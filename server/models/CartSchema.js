const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true },
  quantity: { type: Number, default: 1 },
});

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [cartItemSchema],
    isOrdered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

module.exports = Cart;


// const cartSchema = new mongoose.Schema({
//   userId: { type: String, required: true },
//   itemId: { type: String, required: true },
//   name: { type: String, required: true },
//   price: { type: Number, required: true },
//   brand: { type: String },
//   quantity: { type: Number },
//   description: { type: String },
//   image: { type: String },
//   category: { type: String },
//   deliverytime: { type: String },
//   rating: { type: Number },
//   addedAt: { type: Date, default: Date.now }, // Timestamp for when the product was added
// });



