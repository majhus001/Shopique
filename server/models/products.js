
const mongoose = require("mongoose");


const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },               // Product name
    price: { type: Number, required: true, set: v => Number(v) },
    brand: { type: String },                              // Optional brand
    images: [{ type: String }],                           // Support multiple images
    category: { type: String, required: true },           // cloth, kitchen, decor, etc.
    subCategory: { type: String },                        // optional: shirt, frying pan, sofa

    description: { type: String, required: true },
    stock: { type: Number, required: true, set: v => Number(v) },
    rating: { type: Number, default: 0, set: v => Number(v) },

    specifications: { type: mongoose.Schema.Types.Mixed }, // Varies by product (flexible)
    tags: [{ type: String }],                              // For filtering/searching (e.g. "eco-friendly", "bestseller")

    isFeatured: { type: Boolean, default: false },         // For homepage banners or deals
    offerPrice: { type: Number },                          // Optional discount price
    deliveryTime: { type: String },                        // "2-3 days"

    reviews: {
      type: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        review: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        createdAt: { type: Date, default: Date.now },
      }],
      default: []
    },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  },
  { timestamps: true }
);


const product = mongoose.model("products", productSchema);







const mobileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: {
      type: Number,
      required: true,
      set: v => Number(v) // Ensure conversion to number
    },
    brand: { type: String },
    image: { type: String },
    rating: {
      type: Number,
      default: 0,
      set: v => Number(v) // Ensure conversion to number
    },
    description: { type: String, required: true },
    stock: {
      type: Number,
      required: true,
      set: v => Number(v) // Ensure conversion to number
    },
    category: { type: String, required: true },
    deliverytime: { type: String },
    reviews: {
      type: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        review: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        createdAt: { type: Date, default: Date.now },
      }],
      default: [] // Initialize with empty array
    }
  },
  { timestamps: true }
);

const mobile = mongoose.model("mobileproduct", mobileSchema);


const clothSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: {
    type: Number,
    required: true,
    set: v => Number(v) // Ensure conversion to number
  },
  brand: { type: String },
  image: { type: String },
  rating: {
    type: Number,
    default: 0,
    set: v => Number(v) // Ensure conversion to number
  },
  description: { type: String, required: true },
  stock: {
    type: Number,
    required: true,
    set: v => Number(v) // Ensure conversion to number
  },
  category: { type: String, required: true },
  deliverytime: { type: String },
  reviews: {
    type: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      review: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now },
    }],
    default: [] // Initialize with empty array
  }
 },
 { timestamps: true },
);

const cloth = mongoose.model("clothingproduct", clothSchema);



const homeappliancesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: {
    type: Number,
    required: true,
    set: v => Number(v) // Ensure conversion to number
  },
  brand: { type: String },
  image: { type: String },
  rating: {
    type: Number,
    default: 0,
    set: v => Number(v) // Ensure conversion to number
  },
  description: { type: String, required: true },
  stock: {
    type: Number,
    required: true,
    set: v => Number(v) // Ensure conversion to number
  },
  category: { type: String, required: true },
  deliverytime: { type: String },
  reviews: {
    type: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      review: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now },
    }],
    default: [] // Initialize with empty array
  }
 },
 { timestamps: true },
);

const homeappliances = mongoose.model("homeappliances", homeappliancesSchema);


module.exports = {mobile, cloth, homeappliances, product}