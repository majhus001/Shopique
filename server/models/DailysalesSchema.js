const mongoose = require("mongoose");


const dailysales = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
  billNumber: { type: String, required: true },
  productname: { type: String, required: true },
  price: { type: Number, required: true },               
  quantity: { type: Number, required: true, default: 1 },
  totalAmount: { type: Number, required: true },   
  category: { type: String, required: true },
  subCategory: { type: String },
  soldAt: { type: Date, default: Date.now },
  soldBy: { type: mongoose.Schema.Types.ObjectId, ref: "employees" }, 
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "customers" }, 
}, { timestamps: true });


const Dailysales = mongoose.model("dailysales", dailysales);

module.exports = Dailysales