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
  unit: {
    type: String,
    default: 'Point'
  },
  categoryId: {
    type: ObjectId,
    ref: 'Category'
  },
  imageId: {
    type: ObjectId,
    ref: 'Image',
  }
})

module.exports = mongoose.model('Item', itemSchema)