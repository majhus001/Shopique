const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const { mobile, cloth, homeappliances } = require("./models/products");

const router = express.Router();

// Multer Storage for cloths
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/homeappliances/"); // Folder for mobile images
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
//   },
// });

// const upload = multer({ storage: storage });

// // Serve homeappliances Images
// router.use("/uploads/homeappliances/", express.static("uploads/homeappliances"));

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
      route,
      category,
      deliverytime,
    } = req.body;
    // const imagePath = req.file ? `/uploads/homeappliances/${req.file.filename}` : null;

    const file = req.file;
    const result = await cloudinary.uploader
      .upload_stream(
        { folder: "Homeappliances" },
        async (error, cloudResult) => {
          if (error) return res.status(500).json({ message: "Upload failed" });

          const newProduct = new homeappliances({
            name,
            price,
            brand,
            image: imagePath,
            rating,
            description,
            stock,
            route,
            category,
            deliverytime,
          });

          await newProduct.save();

          res.status(201).json({ message: "cloth product added successfully" });
        }
      )
      .end(file.buffer);

    // const newProduct = new homeappliances({
    //   name,
    //   price,
    //   brand,
    //   image: imagePath ,
    //   rating,
    //   description,
    //   stock,
    //   route,
    //   category,
    //   deliverytime,
    // });

    // await newProduct.save();

    // res.status(201).json({ message: "cloth product added successfully" });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add cloth product" });
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
    const result = await homeappliances.deleteOne({ name: productId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error });
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
    route,
    category,
    deliverytime,
    image,
  } = req.body;

  try {
    const updateFields = {
      name,
      price,
      brand,
      rating,
      description,
      stock,
      route,
      category,
      deliverytime,
    };

    // Update image if a new file is uploaded
    if (req.file) {
      const file = req.file;
      const result = await cloudinary.uploader
        .upload_stream(
          { folder: "Homeappliances" },
          async (error, cloudResult) => {
            if (error) {
              return res.status(500).json({ message: "Image upload failed" });
            }

            updateFields.image = cloudResult.secure_url; // Update the image URL in update fields

            // Proceed to update the product in the database
            const updatedProduct = await homeappliances.findOneAndUpdate(
              { _id },
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
        )
        .end(file.buffer); // Start the file upload to Cloudinary
    } else {
      // If no new image, just update other fields
      const updatedProduct = await homeappliances.findOneAndUpdate(
        { _id },
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

    const products = await homeappliances.find({
      name: { $regex: query, $options: "i" }, // Case-insensitive search
    });

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
