const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } 
);

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
