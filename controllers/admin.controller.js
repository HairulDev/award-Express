const Category = require("#models/Category");
const Item = require("#models/Item");
const Image = require("#models/Image");
const UserModal = require("#models/user");
const helper = require("#lib/response");
const { uploadFile, deleteFile } = require("./genFunc.controller");
const { genFuncController } = require(".");


const viewCategory = async (req, res) => {
  try {
    const category = await Category.find();
    res.status(200).json({
      category,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const viewCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({ _id: id });
    res.status(200).json({
      category,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    await Category.create({ name });
    res.status(200).json({
      success: true,
      message: "Create category successfully",
      Category,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const editCategory = async (req, res) => {
  try {
    const { _id, name } = req.body;
    const category = await Category.findOne({ _id: _id });
    category.name = name;
    await category.save();
    res.status(200).json({
      success: true,
      message: "Update category successfully",
      category,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({ _id: id });
    await category.remove();
    res.status(200).json({
      success: true,
      message: "Delete category successfully",
      category,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const getItemBySearch = async (req, res) => {
  try {
    const minPrice = 10000;
    const { type, maxPrice } = req.query;
    console.log(maxPrice);
    const types = type.split(',');
    const items = await Item.find()
      .populate({ path: "imageId", select: "id imageUrl" })
      .populate({ path: "categoryId", select: "id name" })

    const item = items.filter(item => types.includes(item.categoryId.name)
      && item.price >= minPrice && item.price <= maxPrice);

    res.status(200).json({
      item,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const viewItem = async (req, res) => {
  try {
    const { page } = req.query || 1;
    const LIMIT = 4;
    const startIndex = (Number(page) - 1) * LIMIT;

    const total = await Item.countDocuments({});
    const item = await Item.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex)
      .populate({ path: "imageId", select: "id imageUrl" })
      .populate({ path: "categoryId", select: "id name" });

    res.status(200).json({
      item, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const viewItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findOne({ _id: id });
    res.status(200).json({
      item,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const addItem = async (req, res) => {
  try {
    const { categoryId, title, price, city, description } = req.body;
    const category = await Category.findOne({ _id: categoryId });
    const newItem = {
      categoryId,
      title,
      price,
    };
    const item = await Item.create(newItem);
    category.itemId.push({ _id: item._id });
    await category.save();

    const file = req.files.file;
    const path = "public/images/items";
    const uploading = await uploadFile(file, path, req, res)

    const imageSave = await Image.create({
      imageUrl: uploading.filenameFormatted,
    });
    item.imageId.push({ _id: imageSave._id });
    await item.save();

    res.status(200).json({
      success: true,
      message: "Success Add item",
      item,
    });
  } catch (error) {
    console.log("error=", error);
    res.status(400).json(error);
  }
};

const editItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, title, price, city, description } = req.body;
    const item = await Item.findOne({ _id: id })
      .populate({ path: "imageId", select: "id imageUrl" })
      .populate({ path: "categoryId", select: "id name" });

    if (req.files) {
      for (let i = 0; i < item.imageId.length; i++) {
        const imageUpdate = await Image.findOne({ _id: item.imageId[i]._id });

        var filenameFormatted = imageUpdate.imageUrl;
        const path = "public/images/items";
        const file = deleteFile(filenameFormatted, path, req, res)

        // error delete dari aws
        if (file.status == false) {
          return helper.errorHelper(req, res, 400, {
            success: false,
            message: `Error when delete file try again`,
          });
        }

        //aws
        const newFile = req.files.file;
        const upload = await uploadFile(newFile, path, req, res)

        // upload attachment to s3
        if (upload.status == false) {
          return helper.errorHelper(req, res, 400, {
            success: false,
            message: upload.message,
          });
        }
        //end aws

        imageUpdate.imageUrl = `${filenameFormatted}`;
        await imageUpdate.save();
      }
      item.title = title;
      item.price = price;
      item.city = city;
      item.description = description;
      item.categoryId = categoryId;
      await item.save();
    } else {
      item.title = title;
      item.price = price;
      item.city = city;
      item.description = description;
      item.categoryId = categoryId;
      await item.save();
    }

    res.status(200).json({
      success: true,
      message: "Success edit item",
      item,
    });
  } catch (error) {
    console.log("error==", error);
    res.status(400).json(error);
  }
};

const showImageItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findOne({ _id: id })
      .populate({
        path: "imageId",
        select: "id imageUrl",
      });
    res.status(200).json({ item });
  } catch (error) {
    res.status(400).json(error);
  }
};

const showEditItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findOne({ _id: id })
      .populate({ path: "imageId", select: "id imageUrl" })
      .populate({ path: "categoryId", select: "id name" });
    const category = await Category.find();
    const users = await UserModal.find()
      .select("_id name file")
    res.status(200).json({
      item,
      users,
      category,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findOne({ _id: id }).populate("imageId");
    for (let i = 0; i < item.imageId.length; i++) {
      Image.findOne({ _id: item.imageId[i]._id })
        .then((res) => {
          console.log("res will be deleting", res.imageUrl);
          var filenameFormatted = res.imageUrl;

          const path = "public/images/items";
          const deleting = deleteFile(filenameFormatted, path, req, res)


          // error delete dari aws
          if (deleting.status == false) {
            return helper.errorHelper(req, res, 400, {
              success: false,
              message: `Error when delete file try again`,
            });
          }
          res.remove();
        })
        .catch((error) => {
          console.log("error=", error);
          res.status(400).json(error);
        });
    }
    await item.remove();
    res.status(200).json({
      success: true,
      message: "Success delete item",
      item,
    });
  } catch (error) {
    console.log("error=", error);
    res.status(400).json(error);
  }
};

const viewDetailItem = async (req, res) => {
  const { itemId } = req.params;
  try {
    const feature = await Feature.find({ itemId: itemId });
    const activity = await Activity.find({ itemId: itemId });
    res.status(200).json({
      itemId,
      feature,
      activity,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};



const viewAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const oldUser = await UserModal.findOne({ _id: id });
    const account = {
      _id: oldUser._id,
      name: oldUser.name,
      email: oldUser.email,
      file: oldUser.file,
    }
    res.status(200).json({
      success: true,
      account,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await UserModal.findOne({ _id: id });
    const filenameFormatted = account.file;
    const pathFile = "public/images/users"
    await genFuncController.deleteFile(filenameFormatted, pathFile, req, res)
    await account.remove();
    res.status(200).json({
      success: true,
      message: "Success Delete Account",
      account,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports = {
  viewCategory,
  viewCategoryById,
  addCategory,
  editCategory,
  deleteCategory,
  getItemBySearch,
  viewItem,
  viewItemById,
  addItem,
  showImageItem,
  showEditItem,
  editItem,
  deleteItem,
  viewDetailItem,
  viewAccountById,
  deleteAccount,
};
