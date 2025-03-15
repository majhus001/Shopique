const mongoose = require("mongoose");


const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  brand: { type: String },
  quantity: { type: Number },
  description: { type: String },
  image: { type: String },
  category: { type: String },
  deliverytime: { type: String },
  rating: { type: Number },
  addedAt: { type: Date, default: Date.now }, // Timestamp for when the product was added
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;