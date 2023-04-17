const Category = require("../models/Category");
const Bank = require("../models/Bank");
const Item = require("../models/Item");
const Image = require("../models/Image");
const Feature = require("../models/Feature");
const Activity = require("../models/Activity");
const Booking = require("../models/Booking");
const Member = require("../models/Member");
const Users = require("../models/Users");
const UserModal = require("../models/user");
const fs = require("fs-extra");
const path = require("path");
const bcrypt = require("bcryptjs");
//PROLINE
const adminModel = require("#models/admin.model");
const helper = require("#lib/response");
const s3 = require("#lib/s3");
const { errorHelper, successHelper } = require("#lib/response");
const { uploadFile, deleteFile } = require("./genFunc.controller");
const decode = require("jwt-decode");

const viewDashboard = async (req, res) => {
  try {
    const member = await Member.find();
    const booking = await Booking.find();
    const item = await Item.find();
    res.status(200).json({
      user: req.session.user,
      member,
      booking,
      item,
    });

    res.render("admin/dashboard/view_dashboard", {
      title: "SambasVacation | Dashboard",
      user: req.session.user,
      member,
      booking,
      item,
    });
  } catch (error) {
    res.redirect("/admin/dashboard");
  }
};

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

const viewAccount = async (req, res) => {
  try {
    const account = await UserModal.find();
    res.status(200).json({
      success: true,
      account,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const viewAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await UserModal.findOne({ _id: id });
    res.status(200).json({
      success: true,
      account,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const addAccount = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Users.create({
      username,
      password,
      imageUrl: `images/${req.file.filename}`,
    });
    res.status(200).json({
      success: true,
      message: "Add Account successfully",
      user,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const editAccount = async (value) => {
  try {
    const { id, email, name, coordinatUser, file, } = value;
    console.log("value====", value);
    const account = await UserModal.findOne({ _id: id })
    account.coordinatUser = coordinatUser.toString();
    await account.save();
    return account
  } catch (error) {
    return error
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Users.findOne({ _id: id });
    await fs.unlink(path.join(`public/${account.imageUrl}`));
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

const viewItem = async (req, res) => {
  try {
    const { page } = req.query || 1;
    const LIMIT = 4;
    const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page

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

const likeItem = async (req, res) => {
  const { id } = req.params;
  try {
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
      token = decode(token)
    }

    const item = await Item.findById(id)
    const users = await UserModal.find()
      .select("_id name file")

    const index = item.likes.findIndex((id) => id === String(token.id));
    if (index === -1) {
      item.likes.push(token.id);
    } else {
      item.likes = item.likes.filter((id) => id !== String(token.id));
    }
    const updatedItem = await Item.findByIdAndUpdate(id, item, { new: true })
      .populate({ path: "imageId", select: "id imageUrl" })
      .populate({ path: "categoryId", select: "id name" });

    res.status(200).json({
      item: updatedItem,
      users,
    });
  } catch (error) {
    console.log("error ===", error);
  }
}

const commentItem = async (req, res) => {
  const { id } = req.params;
  const { value } = req.body;
  try {
    const item = await Item.findById(id);
    const users = await UserModal.find()
      .select("_id name file")
    item.comments.push(value);
    const updatedItem = await Item.findByIdAndUpdate(id, item, { new: true })
      .populate({ path: "imageId", select: "id imageUrl" })
      .populate({ path: "categoryId", select: "id name" });

    res.status(200).json({
      item: updatedItem,
      users,
    });
  } catch (error) {
    console.log("error ===", error);
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

const addFeature = async (req, res) => {
  const { name, qty, itemId } = req.body;

  try {
    //aws
    var filenameFormatted = "";
    const file = req.files.file;
    const extension = file.name.split(".");
    const ext =
      extension.length > 1 ? "." + extension[extension.length - 1] : "";
    filenameFormatted = `${new Date() / 1}${ext}`;

    // upload attachment to s3
    const upload = await s3.put(
      file.tempFilePath,
      `feature/${filenameFormatted}`
    );
    if (upload.status == false) {
      return helper.errorHelper(req, res, 400, {
        success: false,
        message: upload.message,
      });
    }
    //end aws

    const feature = await Feature.create({
      name,
      qty,
      itemId,
      imageUrl: `${filenameFormatted}`,
    });

    const item = await Item.findOne({ _id: itemId });
    item.featureId.push({ _id: feature._id });
    await item.save();
    res.status(200).json({
      success: true,
      messae: "Successful adding feature",
      feature,
      item,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const showEditFeature = async (req, res) => {
  const { id } = req.params;
  try {
    const feature = await Feature.findOne({ _id: id });
    res.status(200).json({
      feature,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const editFeature = async (req, res) => {
  const { id, name, qty, itemId } = req.body;
  try {
    const feature = await Feature.findOne({ _id: id });
    if (req.files) {
      var filenameFormatted = feature.imageUrl;
      const file = s3.remove(`feature/${filenameFormatted}`);

      // error delete dari aws
      if (file.status == false) {
        return helper.errorHelper(req, res, 400, {
          success: false,
          message: `Error when delete file try again`,
        });
      }

      //aws
      var filenameFormatted = "";
      const newFile = req.files.file;
      const extension = newFile.name.split(".");
      const ext =
        extension.length > 1 ? "." + extension[extension.length - 1] : "";
      filenameFormatted = `${new Date() / 1}${ext}`;

      // upload attachment to s3
      const upload = await s3.put(
        newFile.tempFilePath,
        `feature/${filenameFormatted}`
      );
      if (upload.status == false) {
        return helper.errorHelper(req, res, 400, {
          success: false,
          message: upload.message,
        });
      }
      //end aws

      feature.name = name;
      feature.qty = qty;
      feature.imageUrl = `${filenameFormatted}`;
      await feature.save();
    } else {
      feature.name = name;
      feature.qty = qty;
      await feature.save();
    }
    res.status(200).json({
      success: true,
      messae: "Successful updating feature",
      feature,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const deleteFeature = async (req, res) => {
  const { id, itemId } = req.params;
  try {
    const feature = await Feature.findOne({ _id: id });
    const item = await Item.findOne({ _id: itemId }).populate("featureId");

    for (let i = 0; i < item.featureId.length; i++) {
      if (item.featureId[i]._id.toString() === feature._id.toString()) {
        item.featureId.pull({ _id: feature._id });
        await item.save();
      }
    }

    var filenameFormatted = feature.imageUrl;
    const file = s3.remove(`feature/${filenameFormatted}`);

    // error delete dari aws
    if (file.status == false) {
      return helper.errorHelper(req, res, 400, {
        success: false,
        message: `Error when delete file try again`,
      });
    }

    await feature.remove();
    res.status(200).json({
      success: true,
      messae: "Successful deleting feature",
      feature,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const addActivity = async (req, res) => {
  const { name, type, itemId } = req.body;

  try {
    //aws
    var filenameFormatted = "";
    const file = req.files.file;
    const extension = file.name.split(".");
    const ext =
      extension.length > 1 ? "." + extension[extension.length - 1] : "";
    filenameFormatted = `${new Date() / 1}${ext}`;

    // upload attachment to s3
    const upload = await s3.put(
      file.tempFilePath,
      `activity/${filenameFormatted}`
    );
    if (upload.status == false) {
      return helper.errorHelper(req, res, 400, {
        success: false,
        message: upload.message,
      });
    }
    //end aws
    const activity = await Activity.create({
      name,
      type,
      itemId,
      imageUrl: `${filenameFormatted}`,
    });

    const item = await Item.findOne({ _id: itemId });
    item.activityId.push({ _id: activity._id });
    await item.save();

    res.status(200).json({
      success: true,
      messae: "Successful adding activity",
      activity,
      item,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const showEditActivity = async (req, res) => {
  const { id } = req.params;
  try {
    const activity = await Activity.findOne({ _id: id });
    res.status(200).json({
      activity,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const editActivity = async (req, res) => {
  const { id, name, type, itemId } = req.body;
  try {
    const activity = await Activity.findOne({ _id: id });
    if (req.files) {
      var filenameFormatted = activity.imageUrl;
      const file = s3.remove(`activity/${filenameFormatted}`);

      // error delete dari aws
      if (file.status == false) {
        return helper.errorHelper(req, res, 400, {
          success: false,
          message: `Error when delete file try again`,
        });
      }

      //aws
      var filenameFormatted = "";
      const newFile = req.files.file;
      const extension = newFile.name.split(".");
      const ext =
        extension.length > 1 ? "." + extension[extension.length - 1] : "";
      filenameFormatted = `${new Date() / 1}${ext}`;

      // upload attachment to s3
      const upload = await s3.put(
        newFile.tempFilePath,
        `activity/${filenameFormatted}`
      );
      if (upload.status == false) {
        return helper.errorHelper(req, res, 400, {
          success: false,
          message: upload.message,
        });
      }
      //end aws

      activity.name = name;
      activity.type = type;
      await activity.save();
    } else {
      activity.name = name;
      activity.type = type;
      activity.imageUrl = `${filenameFormatted}`;
      await activity.save();
    }
    res.status(200).json({
      success: true,
      messae: "Successful updating activity",
      activity,
    });
  } catch (error) {
    console.log("errornya======", error);
    res.status(400).json(error);
  }
};

const deleteActivity = async (req, res) => {
  const { id, itemId } = req.params;
  try {
    const activity = await Activity.findOne({ _id: id });
    const item = await Item.findOne({ _id: itemId }).populate("activityId");

    for (let i = 0; i < item.activityId.length; i++) {
      if (item.activityId[i]._id.toString() === activity._id.toString()) {
        item.activityId.pull({ _id: activity._id });
        await item.save();
      }
    }

    var filenameFormatted = activity.imageUrl;
    const file = s3.remove(`activity/${filenameFormatted}`);

    // error delete dari aws
    if (file.status == false) {
      return helper.errorHelper(req, res, 400, {
        success: false,
        message: `Error when delete file try again`,
      });
    }
    await activity.remove();
    res.status(200).json({
      success: true,
      messae: "Successful deleting activity",
      activity,
    });
  } catch (error) {
    console.log("errornya======", error);
    res.status(400).json(error);
  }
};


const viewBookingBySearch = async (req, res) => {
  const { searchQuery, } = req.query;
  try {
    let email = req.query.email || null;
    let status = req.query.status || null;
    const page = Number(req.query.page) || 1;
    const LIMIT = 2;
    const startIndex = (page - 1) * LIMIT;

    let query = Booking.find()
      .populate({
        path: "userId",
        select: "_id name email role coordinatUser file",
      })
      .populate({
        path: "bankId",
      })

    const items = await Item.find()
      .populate({
        path: "imageId",
        select: "_id imageUrl",
        options: { lean: true }
      })

    const dataBooking = await query;
    const total = dataBooking.filter(({ userId, payments }) => userId.email === email && (!status || payments.status === status)).length;

    console.log("total===>>", total);

    let booking = await query

    booking = booking.map(b => {
      return {
        ...b._doc,
        itemId: b.itemId.map(i => {
          const item = items.find(item => item._id.toString() === i._id.toString());
          return {
            _id: item._id,
            title: item.title,
            qty: i.qty,
            subtotal: i.subtotal,
            price: item.price,
            unit: item.unit,
            imageId: item.imageId[0]
          }
        })
      }
    });
    booking = booking.filter(({ userId, payments }) =>
      (!email || userId.email === email) &&
      (!status || payments.status === status)
    )

    booking = booking.filter((item) => {
      return item.itemId.some((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    });

    res.status(200).json({
      data: booking,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    });

  } catch (error) {
    res.status(400).json(error);
  }
};

const viewBooking = async (req, res) => {
  try {
    let email = req.query.email || null;
    let status = req.query.status || null;
    const page = Number(req.query.page) || 1;
    const LIMIT = 2;
    const startIndex = (page - 1) * LIMIT;

    let query = Booking.find()
      .populate({
        path: "userId",
        select: "_id name email role coordinatUser file",
      })
      .populate({
        path: "bankId",
      })

    const items = await Item.find()
      .populate({
        path: "imageId",
        select: "_id imageUrl",
      })

    const dataBooking = await query;

    console.log("dataBooking viewdataBooking===>>", dataBooking);
    const total = dataBooking.filter(({ userId, payments }) => userId.email === email && (!status || payments.status === status)).length;


    let booking = await query
      .limit(LIMIT)
      .skip(startIndex)
      .exec();

    booking = booking.map(b => {
      return {
        ...b._doc,
        itemId: b.itemId.map(i => {
          const item = items.find(item => item._id.toString() === i._id.toString());
          return {
            _id: item._id,
            title: item.title,
            qty: i.qty,
            subtotal: i.subtotal,
            price: item.price,
            unit: item.unit,
            imageId: item.imageId[0]
          }
        })
      }
    });
    booking = booking.filter(({ userId, payments }) =>
      (!email || userId.email === email) &&
      (!status || payments.status === status)
    )

    res.status(200).json({
      data: booking,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    });

  } catch (error) {
    res.status(400).json(error);
  }
};

const viewPurchase = async (req, res) => {
  try {
    let email = req.query.email || null;
    let status = req.query.status || null;
    const page = req.query.page || 1;
    const LIMIT = 2;
    const startIndex = (parseInt(page)) * LIMIT; // get the starting index of every page


    let query = Booking.find()
      .populate({
        path: "userId",
        select: "_id name email role coordinatUser file",
      })
      .populate({
        path: "bankId",
      })

    const items = await Item.find()
      .populate({
        path: "imageId",
        select: "_id imageUrl",
      })


    const dataBooking = await query;
    const total = dataBooking.filter(({ userId, payments }) => userId.email === email && (!status || payments.status === status)).length;

    console.log("total===>>", total);


    let booking = await query
    // .limit(LIMIT)
    // .skip(startIndex)

    booking = booking.map(b => {
      return {
        ...b._doc,
        itemId: b.itemId.map(i => {
          const item = items.find(item => item._id.toString() === i._id.toString());
          return {
            _id: item._id,
            title: item.title,
            qty: i.qty,
            subtotal: i.subtotal,
            price: item.price,
            unit: item.unit,
            imageId: item.imageId[0]
          }
        })
      }
    });
    booking = booking.filter(({ userId, payments }) =>
      (!email || userId.email === email) &&
      (!status || payments.status === status)
    )
    console.log("booking===>>", booking);

    res.status(200).json({
      data: booking, items,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT)
    });

  } catch (error) {
    res.status(400).json(error);
  }
};


const showDetailBooking = async (req, res) => {
  const { id } = req.params;
  try {
    let booking = await Booking.findOne({ _id: id })
      .populate({
        path: "userId",
        select: "_id name email role coordinatUser file",
      })
      .populate({
        path: "senderId",
        select: "_id name email role coordinatUser file",
      })
      .populate({
        path: "bankId",
      })
    const items = await Item.find()
      .populate({
        path: "imageId",
        select: "_id imageUrl",
      })

    booking = [booking].map(b => {
      return {
        ...b._doc,
        itemId: b.itemId.map(i => {
          const item = items.find(item => item._id.toString() === i._id.toString());
          return {
            _id: item._id,
            title: item.title,
            qty: i.qty,
            subtotal: i.subtotal,
            price: item.price,
            unit: item.unit,
            imageId: item.imageId[0]
          }
        })
      }
    });

    console.log("showDetailBooking===", booking);

    res.status(200).json({
      data: booking
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const actionConfirmation = async (req, res) => {
  const { id } = req.body;
  try {
    const booking = await Booking.findOne({ _id: id });
    console.log("booking", booking);
    booking.payments.status = "Selesai";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Request Approved",
      booking,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const actionReject = async (req, res) => {
  const { id } = req.body;
  try {
    const booking = await Booking.findOne({ _id: id });
    booking.payments.status = "Dibatalkan";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Request Rejected",
      booking,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports = {
  viewDashboard,
  viewCategory,
  viewCategoryById,
  addCategory,
  editCategory,
  deleteCategory,
  viewAccount,
  viewAccountById,
  addAccount,
  editAccount,
  deleteAccount,
  viewItem,
  viewItemById,
  addItem,
  showImageItem,
  showEditItem,
  editItem,
  likeItem,
  commentItem,
  deleteItem,
  viewDetailItem,
  addFeature,
  showEditFeature,
  editFeature,
  deleteFeature,
  addActivity,
  showEditActivity,
  editActivity,
  deleteActivity,
  viewBookingBySearch,
  viewBooking,
  viewPurchase,
  showDetailBooking,
  actionConfirmation,
  actionReject,
};
