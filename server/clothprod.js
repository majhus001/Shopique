const express = require("express");
const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const mongoose = require("mongoose");
const { mobile, cloth, homeappliances } = require("./models/products");

const router = express.Router();

// Multer Storage for cloths
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/clothings/"); // Folder for mobile images
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
//   },
// });

// const upload = multer({ storage: storage });

// // Serve cloth Images
// router.use("/uploads/clothings/", express.static("uploads/clothings"));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Add cloth Product
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
    // const imagePath = req.file ? `/uploads/clothings/${req.file.filename}` : null;

    const file = req.file;
    const result = await cloudinary.uploader
      .upload_stream({ folder: "clothings" }, async (error, cloudResult) => {
        if (error) return res.status(500).json({ message: "Upload failed" });

        const newProduct = new cloth({
          name,
          price,
          brand,
          image: cloudResult.secure_url,
          rating,
          description,
          stock,
          route,
          category,
          deliverytime,
        });

        await newProduct.save();

        res.status(201).json({ message: "cloth product added successfully" });
      })
      .end(file.buffer);




    // const newProduct = new cloth({
    //   name,
    //   price,
    //   brand,
    //   image: cloudResult.secure_url ,
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

// Fetch cloth Products
router.get("/fetch", async (req, res) => {
  try {
    const products = await cloth.find(); // Fetch all products
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Search cloth Products
router.get("/search", async (req, res) => {
  const query = req.query.query;
  try {
    const products = await cloth
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

// Delete cloth Product
router.delete("/:_id", async (req, res) => {
  try {
    const productId = req.params._id;
    const result = await cloth.deleteOne({ name: productId });
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
    route,
    category,
    deliverytime,
    image, // Keep this for the image URL (from previous entry)
  } = req.body;

  try {
    const product = await cloth.findById(_id); // Find product by ID
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

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

    // If a new image is uploaded, handle it
    if (req.file) {
      // Delete the old image from Cloudinary first (if exists)
      if (product.image) {
        const publicId = product.image.split('/').pop().split('.')[0];  // Extract public ID from URL
        await cloudinary.uploader.destroy(publicId);  // Delete the old image from Cloudinary
      }

      // Upload the new image to Cloudinary
      const file = req.file;
      const cloudResult = await cloudinary.uploader.upload_stream(
        { folder: "clothings", public_id: _id.toString() },  // Use _id as public ID
        async (error, result) => {
          if (error) return res.status(500).json({ message: "Image upload failed" });

          // Add the Cloudinary URL to the update fields
          updateFields.image = result.secure_url; // Add new image URL

          // Update the product with the new image and other fields
          const updatedProduct = await cloth.findByIdAndUpdate(
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
      );
      // End the stream with file buffer
      file.buffer && cloudResult.end(file.buffer);
    } else {
      // If no image is uploaded, just update the other fields
      const updatedProduct = await cloth.findByIdAndUpdate(
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

    const products = await cloth.find({
      name: { $regex: query, $options: "i" }, // Case-insensitive search
    });

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
