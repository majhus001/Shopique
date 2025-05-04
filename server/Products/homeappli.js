const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const { mobile, cloth, homeappliances } = require("../models/products");

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Add homeappliances Product
router.post("/prod", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      price,
      brand,
      rating,
      description,
      stock,
      category,
      deliverytime,
    } = req.body;

    console.log("Request body:", req.body);
    console.log("File:", req.file);

    // Create product data object
    const productData = {
      name,
      price: Number(price),
      brand,
      rating: Number(rating),
      description,
      stock: Number(stock),
      category,
      deliverytime,
      // Default image if none provided
      image:
        "https://res.cloudinary.com/demo/image/upload/v1/samples/default-placeholder.jpg",
    };

    const file = req.file;

    // Only try to upload if we have a valid file
    if (file && file.buffer) {
      try {
        // Use Promise to handle the upload stream
        const cloudResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "Homeappliances" },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
                return;
              }
              resolve(result);
            }
          );

          uploadStream.end(file.buffer);
        });

        // Update product with the image URL
        productData.image = cloudResult.secure_url;
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        // Continue with default image if upload fails
      }
    }

    // Create and save the product
    const newProduct = new homeappliances(productData);

    console.log("Saving product to MongoDB:", newProduct);

    try {
      const savedProduct = await newProduct.save();
      console.log("Product saved successfully:", savedProduct);
      res.status(201).json({
        message: "Home appliance product added successfully",
        product: savedProduct,
      });
    } catch (saveError) {
      console.error("MongoDB save error:", saveError);
      return res.status(500).json({
        error: "Failed to save product to database",
        details: saveError.message,
        validationErrors: saveError.errors,
      });
    }
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      error: "Failed to add home appliance product",
      details: error.message,
    });
  }
});

// Fetch homeappliances Products
router.get("/fetch", async (req, res) => {
  try {
    const products = await homeappliances.find(); // Fetch all products
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Search homeappliances Products
router.get("/search", async (req, res) => {
  const query = req.query.query;

  try {
    const products = await homeappliances
      .find({
        name: { $regex: query, $options: "i" },
      })
      .limit(10); // Limit to 10 results

    res.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).send("Error searching products");
  }
});

// Delete homeappliances Product
router.delete("/:_id", async (req, res) => {
  try {
    const productId = req.params._id;
    console.log("Deleting product with ID:", productId);

    // Use findByIdAndDelete for better error handling
    const deletedProduct = await homeappliances.findByIdAndDelete(productId);

    if (!deletedProduct) {
      console.log("Product not found for deletion");
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Product deleted successfully:", deletedProduct);
    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
});

// Update homeappliances Product
router.put("/update/:_id", upload.single("image"), async (req, res) => {
  const { _id } = req.params;
  const {
    name,
    price,
    brand,
    rating,
    description,
    stock,
    category,
    deliverytime,
  } = req.body;

  try {
    // Find the product first to make sure it exists
    const product = await homeappliances.findById(_id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Prepare the update fields with proper type conversion
    const updateFields = {
      name,
      price: Number(price),
      brand,
      rating: Number(rating),
      description,
      stock: Number(stock),
      category,
      deliverytime,
      updatedAt: Date.now(),
    };

    // Update image if a new file is uploaded
    if (req.file && req.file.buffer) {
      try {
        // Use Promise to handle the upload stream
        const cloudResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "Homeappliances" },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
                return;
              }
              resolve(result);
            }
          );

          uploadStream.end(req.file.buffer);
        });

        // Update the image URL in update fields
        updateFields.image = cloudResult.secure_url;
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        return res.status(500).json({
          message: "Image upload failed",
          error: uploadError.message,
        });
      }
    }

    console.log("Updating product with fields:", updateFields);

    // Update the product in the database
    const updatedProduct = await homeappliances.findByIdAndUpdate(
      _id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    console.log("Product updated successfully:", updatedProduct);

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      error: "Failed to update product",
      details: error.message,
      validationErrors: error.errors,
    });
  }
});

router.get("/search/prod", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query)
      return res.status(400).json({ message: "Search query is required" });

    const products = await homeappliances.find({
      name: { $regex: query, $options: "i" }, // Case-insensitive search
    });

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/add/review", async (req, res) => {
  try {
    const { itemId, userId, review, rating } = req.body;
    console.log(req.body);
    if (!userId || !itemId || !review || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await homeappliances.findById(itemId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.reviews.push({ userId, review, rating });

    // Update average rating
    const totalRatings = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = totalRatings / product.reviews.length;

    await product.save();

    res.status(201).json({ message: "Review added successfully", product });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/fetch/reviews", async (req, res) => {
  try {
    const { itemId } = req.query;
    console.log(req.query);
    if (!itemId) {
      return res.status(400).json({ message: "itemId is required" });
    }

    const product = await homeappliances.findById(itemId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ reviews: product.reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
