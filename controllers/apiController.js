const Item = require("../models/Item");
const Treasure = require("../models/Activity");
const Treveler = require("../models/Booking");
const Category = require("../models/Category");
const Bank = require("../models/Bank");
const Booking = require("../models/Booking");
const Member = require("../models/Member");
const helper = require("#lib/response");
const s3 = require("#lib/s3");
const mongoose = require("mongoose");
const { uploadFile } = require("./genFunc.controller");
const { string } = require("#utils/index");

module.exports = {
  landingPage: async (req, res) => {
    try {
      const page = req.query.page || 1;
      const LIMIT = 5;
      const startIndex = (page - 1) * LIMIT;

      const total = await Category.countDocuments({});
      const category = await Category.find()
        .select("_id name")
        .limit(LIMIT)
        .skip(startIndex)
        .populate({
          path: "itemId",
          select: "_id title country city isPopular price unit imageId",
          perDocumentLimit: 10,
          option: { sort: { sumBooking: -1 } },
          populate: {
            path: "imageId",
            select: "_id imageUrl",
            perDocumentLimit: 1,
          },
        });

      for (let i = 0; i < category.length; i++) {
        for (let x = 0; x < category[i].itemId.length; x++) {
          const item = await Item.findOne({ _id: category[i].itemId[x]._id });
          item.isPopular = false;
          await item.save();
          if (category[i].itemId[0] === category[i].itemId[x]) {
            item.isPopular = true;
            await item.save();
          }
        }
      }

      res.status(200).json({
        category,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  landingPageBySearch: async (req, res) => {
    const { searchQuery, } = req.query;
    try {
      let category = await Category.find()
        .select("_id name")
        .limit(3)
        .populate({
          path: "itemId",
          select: "_id title country city isPopular price unit imageId",
          perDocumentLimit: 10,
          option: { sort: { sumBooking: -1 } },
          populate: {
            path: "imageId",
            select: "_id imageUrl",
            perDocumentLimit: 1,
          },
        });

      const items = [];
      for (let i = 0; i < category.length; i++) {
        const categoryItems = category[i].itemId;
        const filteredItems = categoryItems.filter(
          (item) => item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        items.push(...filteredItems);
      }
      category = [{ itemId: items }]
      res.status(200).json({
        category,
      });
    } catch (error) {
      console.log("error==", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  detailPage: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Item.findOne({ _id: id })
        .populate({ path: "featureId", select: "_id name qty imageUrl" })
        .populate({ path: "activityId", select: "_id name type imageUrl" })
        .populate({ path: "imageId", select: "_id imageUrl" });

      const bank = await Bank.find();

      const testimonial = {
        _id: "asd1293uasdads1",
        imageUrl:
          "https://kalbarvacation.s3.ap-southeast-1.amazonaws.com/testimonials/testimonial1.jpg",
        name: "What they are say",
        rate: 4.55,
        content:
          "What a tremendous experience with my own circle of relatives and I ought to strive once more subsequent time soon ...",
        familyName: "C Ronaldo",
        familyOccupation: "Product Designer",
      };

      res.status(200).json({
        ...item._doc,
        bank,
        testimonial,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  bookingPage: async (req, res) => {
    let {
      userId,
      firstName,
      lastName,
      email,
      cartItems,
      totalOrder,
      totalProduct,
      bankFrom,
    } = req.body;

    cartItems = JSON.parse(cartItems);

    let file = "";
    if (string.isEmpty(req.files)) {
      file;
    } else {
      file = req.files.selectedFile;
    }
    if (!file && bankFrom !== "COD") {
      return res.status(404).json({ message: "Image not found" });
    }

    if (!cartItems || !userId || !firstName || !lastName || !email || !totalOrder || !totalProduct || !bankFrom) {
      res.status(404).json({ message: "Lengkapi semua field" });
    }

    // const item = await Item.findOne({ _id: idItem });
    // if (!item) {
    //   return res.status(404).json({ message: "Item not found" });
    // }
    // item.sumBooking += 1;
    // await item.save();

    const invoice = Math.floor(1000000 + Math.random() * 9000000);

    const member = await Member.create({
      firstName,
      lastName,
      email,
    });

    let uploading = "";
    if (bankFrom !== "COD") {
      const path = "public/images/orders";
      uploading = await uploadFile(file, path, req, res)
    } else {
      uploading = { filenameFormatted: "COD Filename" }
    }

    const itemId = cartItems.map(item => {
      return {
        _id: mongoose.Types.ObjectId(item._id),
        title: item.title,
        qty: item.qty,
        subtotal: item.subtotal
      }
    })

    const total = cartItems.reduce((total, item) => {
      return total + item.subtotal
    }, 0)

    const newBooking = {
      bookingStartDate: new Date(),
      bookingEndDate: new Date(),
      invoice,
      userId,
      itemId,
      total,
      payments: {
        proofPayment: uploading.filenameFormatted,
        bankFrom: bankFrom,
      }
    }
    const booking = await Booking.create(newBooking);
    res.status(201).json({ message: "Success Booking", booking });
  },

  viewBank: async (req, res) => {
    try {
      const bank = await Bank.find();
      res.status(200).json({
        bank,
      });
    } catch (error) {
      res.status(400).json(error);
    }
  },
};
