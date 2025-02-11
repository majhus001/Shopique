const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  OrderedItems: [
    {
      userId: {
        type: String,
        required: true,
      },
      itemId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      brand: {
        type: String,
      },
      quantity: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
      },
      image: {
        type: String,
      },
      category: {
        type: String,
      },
      deliveryTime: {
        type: String,
      },
      rating: {
        type: Number,
        default: 0,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  mobileNumber: {
    type: Number,
    required: true,
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  OrderStatus: {
    type: String,
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Orderdetails", orderSchema);


module.exports = Order;