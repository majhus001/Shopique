const express = require("express");
const User = require("../models/userschema");
const Order = require("../models/orderschema");
const { mobile, cloth, homeappliances } = require("../models/products");
const router = express.Router();



// Route to Fetch All Users
router.get("/userdata", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

router.get("/pendingorders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

router.get("/fetchmobiles", async (req, res) => {
  try {
    const products = await mobile.find().limit(10); // Fetch all products
    res.status(200).json(products);
    
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/fetchcloths", async (req, res) => {
  try {
    const products = await cloth.find().limit(10); // Fetch all products
    res.status(200).json(products);
    
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/fetchhomeappliance", async (req, res) => {
  try {
    
    const products = await homeappliances.find().limit(10); // Fetch all products
    res.status(200).json(products);
    
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.put('/update-orders', async (req, res) => {
  const { orderId, status } = req.body;
console.log(req.body)
  if (!orderId || !status) {
      return res.status(400).json({ message: 'Order ID and status are required' });
  }

  try {
      const order = await Order.findById(orderId);

      if (!order) {
          return res.status(404).json({ message: 'Order not found' });
      }

      order.OrderStatus = status;
      const userId = order.userId

      const user = await User.findById(userId);
      await order.save();
      res.status(200).json({ order, user });
  } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ message: 'Server error, please try again later' });
  }
});

router.get("/orduser", async (req, res) => {

  const { orderId } = req.query;
  try {
    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    const userId = order.userId

    const user = await User.findById(userId);
    console.log(user)
    console.log(order)
    res.status(200).json({ user, order});
} catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
}
});

router.get("/get-orders", async (req, res) => {
  try {
    
    const products = await Order.find(); 
    console.log(products)
    res.status(200).json(products);
    
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});



// Export the Router
module.exports = router;
