const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const mongoose = require("mongoose");
const { product } = require("../models/products");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Add a new product
router.post("/add", upload.array("images", 5), async (req, res) => {
  try {
    const {
      name,
      price,
      brand,
      category,
      subCategory,
      description,
      stock,
      rating,
      deliveryTime,
      offerPrice,
      isFeatured,
      tags,
      specifications,
      sellerId,
    } = req.body;

    // Create product data object with proper type conversion
    const productData = {
      name,
      price: Number(price),
      brand,
      category,
      subCategory,
      description,
      stock: Number(stock),
      rating: rating ? Number(rating) : 0,
      deliveryTime,
      offerPrice: offerPrice ? Number(offerPrice) : undefined,
      isFeatured: isFeatured === "true" || isFeatured === true,
      tags: Array.isArray(tags)
        ? tags
        : typeof tags === "string"
        ? tags.split(",")
        : [],
      specifications:
        typeof specifications === "string"
          ? JSON.parse(specifications)
          : specifications,
      images: [],
      sellerId: sellerId,
    };

    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map((file) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "products" },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary upload error:", error);
                  reject(error);
                  return;
                }
                resolve(result.secure_url);
              }
            );
            uploadStream.end(file.buffer);
          });
        });

        const imageUrls = await Promise.all(uploadPromises);
        productData.images = imageUrls;
      } catch (uploadError) {
        console.error("Error uploading images:", uploadError);
      }
    }
    
    const newProduct = new product(productData);
    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add product",
      details: error.message,
    });
  }
});

// Get all products
router.get("/fetchAll", async (req, res) => {
  try {
    const products = await product.find();
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
    });
  }
});

// Get product by ID
router.get("/fetch/:id", async (req, res) => {
  try {
    const productItem = await product.findById(req.params.id);
    if (!productItem) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      data: productItem,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product",
    });
  }
});

router.get("/fetchbycategory/:category", async (req, res) => {
  try {
    const {category} = req.params;
    
    const products = await product.find({category: category});
    if (!products) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product",
    });
  }
});

// Update product
router.put("/update/:id", upload.array("images", 5), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      brand,
      category,
      subCategory,
      description,
      stock,
      rating,
      deliveryTime,
      offerPrice,
      isFeatured,
      tags,
      specifications,
    } = req.body;

    // Check if product exists
    const existingProduct = await product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Prepare update data with proper type conversion
    const updateData = {
      name,
      price: Number(price),
      brand,
      category,
      subCategory,
      description,
      stock: Number(stock),
      rating: rating ? Number(rating) : 0,
      deliveryTime,
      offerPrice: offerPrice ? Number(offerPrice) : undefined,
      isFeatured: isFeatured === "true" || isFeatured === true,
      tags: Array.isArray(tags)
        ? tags
        : typeof tags === "string"
        ? tags.split(",")
        : existingProduct.tags,
      specifications:
        typeof specifications === "string"
          ? JSON.parse(specifications)
          : specifications,
    };

    // Handle images for update
    if (req.files && req.files.length > 0) {
      try {
        // Upload new images if provided
        const uploadPromises = req.files.map((file) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "products" },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary upload error:", error);
                  reject(error);
                  return;
                }
                resolve(result.secure_url);
              }
            );
            uploadStream.end(file.buffer);
          });
        });

        // Wait for all uploads to complete
        const imageUrls = await Promise.all(uploadPromises);

        // Add new image URLs to update data
        updateData.images = imageUrls;
        console.log(
          `Successfully uploaded ${imageUrls.length} new images for product ${id}`
        );
      } catch (uploadError) {
        console.error("Error uploading images:", uploadError);
        // Keep existing images if upload fails
      }
    } else if (req.body.keepExistingImages === "true") {
      // If keepExistingImages flag is set, don't change the images array
      console.log(`Keeping existing images for product ${id}`);
      delete updateData.images; // Remove images from update data to keep existing ones
    }

    // Update product
    const updatedProduct = await product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update product",
      details: error.message,
    });
  }
});

// Delete product
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Delete product
    await product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete product",
      details: error.message,
    });
  }
});

// Search products
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    const products = await product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { subCategory: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ],
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search products",
      details: error.message,
    });
  }
});

router.post("/top-selling", async (req, res) => {
  const { productIds } = req.body;
  try {
    const products = await product.find({
      _id: { $in: productIds },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching top products" });
  }
});

module.exports = router;
