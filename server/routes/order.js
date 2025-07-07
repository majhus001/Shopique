const express = require("express");
const router = express.Router();
const Order = require("../models/orderschema");
const product = require("../models/products");

// Add new order and update stock
router.post("/add", async (req, res) => {
  const {
    userId,
    cartItems,
    totalPrice,
    mobileNumber,
    pincode,
    deliveryAddress,
    paymentMethod,
  } = req.body;

  if (
    !userId ||
    !cartItems ||
    !Array.isArray(cartItems) ||
    cartItems.length === 0 ||
    !totalPrice ||
    !mobileNumber ||
    !pincode ||
    !deliveryAddress ||
    !paymentMethod
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const formattedItems = [];
    let collection = product;
    for (let item of cartItems) {
      const product = await collection.findById(item._id);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product ${item.productId} not found.` });
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}.` });
      }

      // Update stock and salesCount
      product.stock -= item.quantity;
      product.salesCount += item.quantity;
      await product.save();

      formattedItems.push({
        productId: item._id,
        name: item.name,
        price: item.price,
        brand: item.brand,
        quantity: item.quantity,
        description: item.description,
        image: item.image,
        category: item.category,
      });
    }

    const newOrder = new Order({
      userId,
      OrderedItems: formattedItems,
      totalPrice,
      mobileNumber,
      pincode,
      deliveryAddress,
      paymentMethod,
    });

    await newOrder.save();
    console.log("order placed")
    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res
      .status(500)
      .json({ message: "Failed to place order. Please try again." });
  }
});

// Fetch orders by userId
router.get("/fetch/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const myOrders = await Order.find({ userId });
    if (myOrders.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Orders fetched successfully!",
        data: myOrders,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "No orders found",
        data: [],
      });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Failed to fetch orders." });
  }
});

// Cancel an order
router.put("/cancelorder/:orderId", async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    order.OrderStatus = "Cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      data: order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({ message: "Failed to cancel order." });
  }
});

module.exports = router;
