const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const bookingSchema = new mongoose.Schema({
  bookingStartDate: {
    type: Date,
    required: true
  },
  bookingEndDate: {
    type: Date,
    required: true
  },
  invoice: {
    type: String,
    required: true
  },
  coordinateSender: {
    type: String,
  },
  userId: {
    type: ObjectId,
    ref: 'User'
  },
  senderId: {
    type: ObjectId,
    ref: 'User'
  },
  itemId: [{
    _id: {
      type: ObjectId,
      ref: 'Item'
    },
    title: {
      type: String,
      required: true
    },
    qty: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    },
  }],
  total: {
    type: Number,
    required: true
  },
  payments: {
    proofPayment: {
      type: String
    },
    bankFrom: {
      type: String
    },
    accountHolder: {
      type: String
    },
    status: {
      type: String,
      default: 'Proses'
    }
  }
})

module.exports = mongoose.model('Booking', bookingSchema)