const { successHelper, errorHelper } = require("#lib/response");
const mongoose = require("mongoose");
const decode = require("jwt-decode");

const fs = require('fs');
const PostStory = require("../models/postStory");
const UserModal = require("../models/user");
const { string } = require("#utils/index");
const { uploadFileGithub, deleteFileGithub } = require("./genFunc.controller");

const getPosts = async (req, res) => {
    const { page } = req.query;

    try {
        const LIMIT = 5;
        const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page

        const total = await PostStory.countDocuments({});
        const posts = await PostStory.find()
            .select("_id message selectedFile likes comments tags creator createdAt")
            .sort({ _id: -1 })
            .limit(LIMIT)
            .skip(startIndex)
            .populate({
                path: "creator",
                select: "_id name file"
            });
        const users = await UserModal.find()
            .select("_id name file")

        res.json({ data: posts, users, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT) });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const getPostsBySearch = async (req, res) => {
    const { searchQuery, tags } = req.query;

    try {
        const title = new RegExp(searchQuery, "i");
        const posts = await PostStory.find({ $or: [{ title }, { tags: { $in: tags.split(',') } }] });

        res.json({ data: posts });
    } catch (error) {
        console.log("error ======", error);
        res.status(404).json({ message: error.message });
    }
}

const getPostsByCreator = async (req, res) => {
    const { name } = req.query;
    try {
        const posts = await PostStory.find({ name });
        console.log("posts ======", posts);
        res.json({ data: posts });
    } catch (error) {
        console.log("error ======", error);
        res.status(404).json({ message: error.message });
    }
}

const getPost = async (req, res) => {
    const { id } = req.params;
    try {
        const post = await PostStory.findById(id);
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const createPost = async (req, res) => {
    const body = req.body;
    const file = req.files?.selectedFile;


    const pathFile = "public/images/posts"
    const uploading = await uploadFileGithub(file, pathFile, req, res)

    const newPostStory = new PostStory({
        ...body,
        selectedFile: uploading?.filenameFormatted,
        createdAt: new Date().toISOString()
    })

    try {
        await newPostStory.save();
        return successHelper(req, res, 200, {
            success: true,
            newPostStory,
        });
    } catch (error) {
        return errorHelper(req, res, 400, {
            success: false,
            message: error.message,
        });
    }
}

const updatePost = async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    const { message } = body;

    const file = req.files?.selectedFile;

    try {
        const findById = await PostStory.findById(id);

        if (!findById)
            return errorHelper(req, res, 200, {
                success: false,
                message: "File not found",
            });

        let updatedPost = {};
        // uploading file
        if (!string.isEmpty(file)) {
            const pathFile = "public/images/posts"
            await deleteFileGithub(findById.selectedFile, pathFile, req, res)
            const upload = await uploadFileGithub(file, pathFile, req, res)
            updatedPost = {
                message: message,
                selectedFile: upload?.filenameFormatted,
            };
        } else {
            updatedPost = {
                message: message,
            };
        }
        // end uploading file

        await PostStory.findByIdAndUpdate(id, updatedPost, { new: true });

        return successHelper(req, res, 200, {
            success: true,
            message: "Berhasil di update",
        });
    } catch (error) {
        return errorHelper(req, res, 400, {
            success: false,
            message: error,
        });
    }
}

const deletePost = async (req, res) => {
    const { id } = req.params;
    try {
        const findById = await PostStory.findById(id);
        if (!findById)
            return errorHelper(req, res, 200, {
                success: false,
                message: "File not found",
            });

        const pathFile = "public/images/posts"
        await deleteFileGithub(findById.selectedFile, pathFile, req, res)
        await PostStory.findByIdAndDelete(findById._id);
        return successHelper(req, res, 200, {
            success: true,
            message: "Deleted successfully.",
        });
    } catch (error) {
        console.error("error deletePost=====", error);
        return errorHelper(req, res, 400, {
            success: false,
            message: error,
        });
    }
}

const likePost = async (req, res) => {
    const { id } = req.params;
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    if (token && token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
        token = decode(token)
    }
    if (!token.id) {
        return res.json({ message: "Unauthenticated" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

    try {
        const post = await PostStory.findById(id);
        const index = post.likes.findIndex((id) => id === String(token.id));
        if (index === -1) {
            post.likes.push(token.id);
        } else {
            post.likes = post.likes.filter((id) => id !== String(token.id));
        }

        const updatedPost = await PostStory.findByIdAndUpdate(id, post, { new: true });
        return successHelper(req, res, 200, {
            success: false,
            updatedPost,
            message: "Like successfully.",
        });
    } catch (error) {
        return errorHelper(req, res, 400, {
            success: false,
            message: "Deleted successfully.",
        });
    }
}

const commentPost = async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;
    try {
        const post = await PostStory.findById(id);
        post.comments.push(value);
        const updatedPost = await PostStory.findByIdAndUpdate(id, post, { new: true });

        return res.status(200).json(updatedPost);
    } catch (error) {
        console.log("error ===", error);
    }
};

module.exports = {
    getPosts,
    getPostsBySearch,
    getPostsByCreator,
    getPost,
    createPost,
    updatePost,
    deletePost,
    likePost,
    commentPost,
};