const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Category = require("../models/Category"); // Adjust path as needed
const Product = require("../models/products"); // Needed for product references

// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  next();
};

// Create a new category
router.post("/add", async (req, res) => {
  try {
    const { category, subCategory, displayName, priority, isActive, featuredProducts } =
      req.body;

    if (!subCategory || !displayName) {
      return res
        .status(400)
        .json({ message: "Name and displayName are required" });
    }

    // Check if featuredProducts exist
    if (featuredProducts && featuredProducts.length > 0) {
      const productsExist = await Product.countDocuments({
        _id: { $in: featuredProducts },
      });

      if (productsExist !== featuredProducts.length) {
        return res
          .status(400)
          .json({ message: "One or more products not found" });
      }
    }

    const newcategory = new Category({
      category,
      subCategory,
      displayName,
      priority: priority || 0,
      isActive: isActive !== undefined ? isActive : true,
      featuredProducts: featuredProducts || [],
    });

    const savedCategory = await newcategory.save();
    res.status(201).json({success:true, message:"category added successfully"});
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category name must be unique" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all categories (with optional filtering and sorting)
router.get("/", async (req, res) => {
  try {
    const { query } = req.query;

    let findQuery = {};

    if (query && query.trim()) {
      findQuery.$or = [
        { subCategory: { $regex: query, $options: "i" } },
        { displayName: { $regex: query, $options: "i" } },
      ];
    }

    const categories = await Category.find(findQuery)
      .sort({ priority: -1 })
      .populate("featuredProducts", "name price images");

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get a single category by ID
router.get("/:id", validateObjectId, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "featuredProducts"
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update a category
router.put("/:id", validateObjectId, async (req, res) => {
  try {
    const { name, displayName, priority, isActive, featuredProducts } =
      req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (displayName) updateData.displayName = displayName;
    if (priority !== undefined) updateData.priority = priority;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = Date.now();

    // Handle featuredProducts update if provided
    if (featuredProducts) {
      // Validate products exist
      const productsExist = await Product.countDocuments({
        _id: { $in: featuredProducts },
      });

      if (productsExist !== featuredProducts.length) {
        return res
          .status(400)
          .json({ message: "One or more products not found" });
      }

      updateData.featuredProducts = featuredProducts;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("featuredProducts");

    if (!updatedCategory) {
      return res
        .status(404)
        .json({message: "Category not found" });
    }

    res.json({ success: true, data: updatedCategory});
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category name must be unique" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Toggle category active status
router.patch("/:id/toggle-active", validateObjectId, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.isActive = !category.isActive;
    category.updatedAt = Date.now();
    await category.save();

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a category
router.delete("/:id", validateObjectId, async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Search for products to add to featured products
router.get("/products/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Search query must be at least 2 characters" });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .limit(10)
      .select("name price images"); 

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
