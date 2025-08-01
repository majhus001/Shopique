const express = require("express");
const router = express.Router();
const Newsletter = require("../models/Newsletter");

router.post("/add",  async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Basic validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }

    // 2. Check if already exists
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This email is already subscribed",
      });
    }

    // 3. Save new subscriber
    await Newsletter.create({ email });

    return res.status(201).json({
      success: true,
      message: "Subscribed successfully",
    });
  } catch (err) {
    console.error("Newsletter error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
});

module.exports = router;
