const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const postSchema = mongoose.Schema({
    title: String,
    message: String,
    name: String,
    // creator: String,
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tags: [String],
    selectedFile: String,
    userFile: String,
    likes: { type: [String], default: [] },
    comments: {
        type: { String },
        default: []
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
})


module.exports = mongoose.model('PostStory', postSchema)