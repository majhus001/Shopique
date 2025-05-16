const express = require("express");
const mongoose = require("mongoose");
const Dailysales = require("../models/DailysalesSchema");

const router = express.Router();
router.get("/fetch", async (req, res) => {
  try {
    const sales = await Dailysales.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: sales,
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching sales",
      error: error.message,
    });
  }
});

module.exports = router;