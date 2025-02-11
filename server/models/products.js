
const mongoose = require("mongoose");



const mobileSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  price: { type: Number, required: true }, 
  brand: { type: String }, 
  image: { type: String }, 
  rating: { type: Number, default: 0 },
  description: { type: String, required: true },
  stock: { type: Number, required: true },
  route: { type: String },
  category: { type: String, required: true }, 
  deliverytime: { type: String },
 },
 { timestamps: true },
);

const mobile = mongoose.model("mobileproduct", mobileSchema);




const clothSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  price: { type: Number, required: true }, 
  brand: { type: String }, 
  image: { type: String }, 
  rating: { type: Number, default: 0 },
  description: { type: String, required: true },
  stock: { type: Number, required: true },
  route: { type: String },
  category: { type: String, required: true }, 
  deliverytime: { type: String },
 },
 { timestamps: true },
);

const cloth = mongoose.model("clothingproduct", clothSchema);



const homeappliancesSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  price: { type: Number, required: true }, 
  brand: { type: String }, 
  image: { type: String }, 
  rating: { type: Number, default: 0 },
  description: { type: String, required: true },
  stock: { type: Number, required: true },
  route: { type: String },
  category: { type: String, required: true }, 
  deliverytime: { type: String },
 },
 { timestamps: true },
);

const homeappliances = mongoose.model("homeappliances", homeappliancesSchema);


module.exports = {mobile, cloth, homeappliances}