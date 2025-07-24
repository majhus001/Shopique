const Razorpay = require("razorpay");
const express = require("express");
const router = express.Router();
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", async (req, res) => {
  const { cartItems, deliveryfee } = req.body;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  let totalAmount = 0;

  cartItems.forEach((item) => {
    if (!item.offerPrice || isNaN(item.offerPrice)) return;
    totalAmount += Number(item.offerPrice);
  });

  if (totalAmount <= 0) {
    return res.status(400).json({ error: "Invalid cart amount" });
  }

  const amountInPaise = Math.round(totalAmount * 100) + deliveryfee * 100;
  
  const options = {
    amount: amountInPaise,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    console.error("❌ Razorpay Order Creation Failed:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
