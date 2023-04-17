const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    default: 'night'
  },
  categoryId: {
    type: ObjectId,
    ref: 'Category'
  },
  imageId: {
    type: ObjectId,
    ref: 'Image'
  },
  likes: {
    type: [String],
    default: []
  },
  comments: {
    type: { String },
    default: []
  }
})

module.exports = mongoose.model('Item', itemSchema)