const express = require("express");
const mongoose = require("mongoose");
const Seller = require("../models/SellerSchema");

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const seller = req.body;

    const newSeller = new Seller({
      name: seller.sellername,
      companyname: seller.companyname,
      email: seller.selleremail,
      mobile: seller.sellermobile,
      address: seller.selleraddress,
    });

    const savedSeller = await newSeller.save();

    return res.status(200).json({
      success: true,
      sellerId: savedSeller._id,
    });
  } catch (error) {
    console.error("Error adding seller:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding seller",
      error: error.message,
    });
  }
});

router.get("/fetch", async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.status(200).json({
      success: true,
      data: sellers,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
});

router.put("/update", async (req, res) => {
  try {
    const { sellerId, products } = req.body;
    console.log(sellerId, products);
    if (!sellerId || !products || !Array.isArray(products)) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    const updatedSeller = await Seller.findByIdAndUpdate(
      sellerId,
      { $push: { products: { $each: products } } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedSeller,
    });
  } catch (error) {
    console.error("Error updating seller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update seller",
      error: error.message,
    });
  }
});

module.exports = router;
