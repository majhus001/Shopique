const express = require("express");
const router = express.Router();
const Order = require("../models/orderschema");
const { product } = require("../models/products");

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
    !totalPrice ||
    !mobileNumber ||
    !pincode ||
    !deliveryAddress ||
    !paymentMethod
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Create a new order
    const newOrder = new Order({
      userId,
      OrderedItems: cartItems, // Properly mapping cartItems to OrderedItems
      totalPrice,
      mobileNumber,
      pincode,
      deliveryAddress,
      paymentMethod,
    });

    await newOrder.save();
    return res.status(201).json({
      success:true,
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

router.get("/fetch/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const MyOrders = await Order.find({ userId });
    if(MyOrders){
      return res.status(201).json({
        message: "Order fetched successfully!", data: MyOrders,
       })
    }else{
      return res.status(201).json({
        message: "No Orders found",
       })
    }
    
  } catch (error) {
    console.error("Error fetching orders:", error); 
  }
});

router.put("/cancelorder/:orderId", async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const myOrder = await Order.findOne({ _id: orderId });

    if (myOrder) {
      myOrder.OrderStatus = "Cancelled";
      await myOrder.save(); 
      return res.status(200).json({
        success: true,
        message: "Order updated successfully!",
        data: myOrder,
      });
    } else {
      return res.status(404).json({
        message: "No order found with the given ID.",
      });
    }
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.put("/stockupdate", async (req, res) => {
  try {
      const { cartItems } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Invalid cart items" });
    }

    let collection = product;
    // Process each item in cartItems
    for (let item of cartItems) {
      const { itemId, quantity, category } = item;

      if (!itemId || !quantity || !category) {
        return res.status(400).json({ message: "Invalid item data" });
      }

      const product = await collection.findById(itemId);
      if (!product) {
        return res.status(404).json({ message: `Product ${itemId} not found` });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ message: `Not enough stock for ${itemId}` });
      }

      product.stock -= quantity;
      await product.save();
    }

    res.json({ message: "Stock updated successfully" });

  } catch (error) {
    console.error("Stock update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
