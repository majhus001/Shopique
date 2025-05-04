const express = require("express");
const multer = require("multer");
const path = require("path");
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
      price,
      brand,
      rating,
      description,
      stock,
      category,
      deliverytime,
      image: "https://res.cloudinary.com/demo/image/upload/v1/samples/default-placeholder.jpg"
    };

    const file = req.file;

    // Only try to upload if we have a valid file
    if (file && file.buffer) {
      try {
        // Use Promise to handle the upload stream
        const cloudResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "mobiles" },
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
    const newProduct = new mobile(productData);

    // Convert string values to appropriate types
    if (productData.price) newProduct.price = Number(productData.price);
    if (productData.stock) newProduct.stock = Number(productData.stock);
    if (productData.rating) newProduct.rating = Number(productData.rating);

    console.log("Saving product to MongoDB:", newProduct);

    try {
      const savedProduct = await newProduct.save();
      console.log("Product saved successfully:", savedProduct);
      res.status(201).json({ message: "Mobile product added successfully", product: savedProduct });
    } catch (saveError) {
      console.error("MongoDB save error:", saveError);
      return res.status(500).json({
        error: "Failed to save product to database",
        details: saveError.message,
        validationErrors: saveError.errors
      });
    }
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add mobile product", details: error.message });
  }
});

router.get("/fetch", async (req, res) => {
  try {
    const products = await mobile.find().limit(10); // Fetch all products
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/fetch/searchprod", async (req, res) => {
  try {
    const products = await mobile.find();
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/search", async (req, res) => {
  const query = req.query.query;

  try {
    const products = await mobile
      .find({
        name: { $regex: query, $options: "i" },
      })
      .limit(10);
    res.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).send("Error searching products");
  }
});

router.delete("/:_id", async (req, res) => {
  try {
    const productId = req.params._id;
    const result = await mobile.deleteOne({ _id: productId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error });
  }
});

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
    const product = await mobile.findById(_id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Prepare the update fields
    const updateFields = {
      name,
      price,
      brand,
      rating,
      description,
      stock,
      category,
      deliverytime,
    };

    if (req.file) {
      const file = req.file;

      // Check if buffer exists
      if (!file.buffer) {
        return res.status(400).json({ error: "Invalid image file" });
      }

      if (product.image) {
        try {
          const publicId = product.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Error deleting old image:", err);
          // Continue with the update even if old image deletion fails
        }
      }

      try {
        const cloudResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "mobiles",
              public_id: _id,
            },
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

        updateFields.image = cloudResult.secure_url;

        const updatedProduct = await mobile.findByIdAndUpdate(
          _id,
          { $set: { ...updateFields, updatedAt: Date.now() } },
          { new: true }
        );

        if (!updatedProduct) {
          return res.status(404).json({ error: "Product not found." });
        }

        res.status(200).json({
          message: "Product updated successfully",
          product: updatedProduct,
        });
      } catch (uploadError) {
        return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
      }
    } else {
      const updatedProduct = await mobile.findByIdAndUpdate(
        _id,
        { $set: { ...updateFields, updatedAt: Date.now() } },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found." });
      }

      res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.get("/search/prod", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query)
      return res.status(400).json({ message: "Search query is required" });

    const products = await mobile.find({
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
    // console.log(req.body);
    console.log(itemId)
    if (!userId || !itemId || !review || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await mobile.findById(itemId);

    if (!product) {
      console.log("noooo")
      return res.status(404).json({ message: "Product not found" });
    }
console.log(product)
    product.reviews.push({ userId, review, rating });

    // Update average rating
    const totalRatings = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = totalRatings / product.reviews.length;

    await product.save();
console.log("saved")
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

    const product = await mobile.findById(itemId);
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
