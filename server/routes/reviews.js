const express = require("express");
const router = express.Router();
const product = require("../models/products");
const mongoose = require("mongoose");

router.post("/add", async (req, res) => {
  try {
    const { itemId, userId, review, rating } = req.body;

    if (!userId || !itemId || !review || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const Reviewproduct = await product.findById(itemId);

    if (!Reviewproduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    Reviewproduct.reviews.push({ userId, review, rating });

    // Update average rating
    // const totalRatings = Reviewproduct.reviews.reduce((sum, r) => sum + r.rating, 0);
    // Reviewproduct.rating = totalRatings / Reviewproduct.reviews.length;

    Reviewproduct.rating = (Reviewproduct.rating + rating) / 2;

    console.log(Reviewproduct.rating);
    await Reviewproduct.save();
    res
      .status(201)
      .json({ message: "Review added successfully", Reviewproduct });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/fetch", async (req, res) => {
  try {
    const { itemId, page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(404).json({
        success: false,
        error: "Invalid product ID format",
      });
    }
    // Validate inputs
    if (!itemId) {
      return res.status(400).json({ message: "itemId is required" });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }

    // Find the product and populate reviews with user details if needed
    const productWithReviews = await product
      .findById(itemId)
      .select("reviews")
      .lean();

    if (!productWithReviews) {
      return res.status(404).json({ message: "Product not found" });
    }

    const allReviews = productWithReviews.reviews || [];
    const totalReviews = allReviews.length;

    // Implement pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;

    // Sort reviews by date (newest first)
    const sortedReviews = allReviews.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const paginatedReviews = sortedReviews.slice(startIndex, endIndex);

    res.status(200).json({
      reviews: paginatedReviews,
      total: totalReviews,
      page: pageNum,
      pages: Math.ceil(totalReviews / limitNum),
      limit: limitNum,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
