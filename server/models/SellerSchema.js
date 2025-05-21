const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyname: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  products: [
    {
      key: { type: String },
      value: { type: Number}, 
    }
  ],
});

const Seller = mongoose.model("Seller", sellerSchema);

module.exports = Seller;
