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

