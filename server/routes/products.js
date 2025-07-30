const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const product = require("../models/products");
const Cart = require("../models/CartSchema");
const Category = require("../models/Category");

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
      displayName,
      description,
      stock,
      rating,
      offerPrice,
      isFeatured,
      tags,
      specifications,
      sellerId,
    } = req.body;

    const productData = {
      name,
      price: Number(price),
      brand,
      category,
      subCategory,
      displayName,
      description,
      stock: Number(stock),
      rating: rating ? Number(rating) : 0,
      views: 0,
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

router.get("/fetchby/category/:category?", async (req, res) => {
  try {
    const { category } = req.params;

    const allProducts = await product
      .find()
      .sort({ createdAt: -1 })
      .select(
        "_id name price category subCategory offerPrice images rating salesCount"
      );

    const categoryProducts = category
      ? allProducts.filter(
          (item) =>
            item.category &&
            item.category.toLowerCase() === category.toLowerCase()
        )
      : allProducts;

    const categoryMap = new Map();

    allProducts.forEach((item) => {
      const cat = item.category;
      const subCat = item.subCategory;

      if (!cat) return;

      // If category doesn't exist in map, initialize
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, {
          name: cat,
          count: 0,
          subCategories: new Map(),
        });
      }

      // Update category count
      const categoryEntry = categoryMap.get(cat);
      categoryEntry.count++;

      // Update subcategory count
      if (subCat) {
        const subMap = categoryEntry.subCategories;
        subMap.set(subCat, (subMap.get(subCat) || 0) + 1);
      }
    });

    // Convert Map to final array
    const categoryList = Array.from(categoryMap.values()).map((cat) => ({
      name: cat.name,
      count: cat.count,
      subCategories: Array.from(cat.subCategories.entries()).map(
        ([name, count]) => ({ name, count })
      ),
    }));

    res.status(200).json({
      success: true,
      products: categoryProducts,
      categories: categoryList,
      totalProducts: allProducts.length,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
    });
  }
});

router.post("/fetchBySpecified", async (req, res) => {
  try {
    const viewedProducts = req.body.viewedProducts;

    const categories = await Category.find({ isActive: true })
      .sort({ priority: -1 })
      .lean();

    const products = await product
      .find()
      .sort({ createdAt: -1 })
      .select(
        "_id name price category subCategory offerPrice images rating salesCount"
      );

    //filtering for viewed products
    let recentlyViewedProducts = [];

    if (viewedProducts.length > 9) {
      recentlyViewedProducts = viewedProducts
        .map((id) => products.find((p) => p._id.toString() === id))
        .filter(Boolean); // remove any undefined if product not found
    }

    //filtering for trending products
    const trending = [...products]
      .sort((a, b) => b.salesCount - a.salesCount || b.views - a.views)
      .slice(0, 10);

    //filtering for newarrivals products
    const newArrivals = products.slice(0, 10); // already sorted by createdAt desc

    // Step 1: Group all products by category
    const allCategoryMap = new Map();

    products.forEach((prod) => {
      const cat = prod.category;
      if (!allCategoryMap.has(cat)) {
        allCategoryMap.set(cat, {
          category: cat,
          image: prod.images[0],
          count: 1,
        });
      } else {
        const existing = allCategoryMap.get(cat);
        existing.count += 1;
      }
    });
    // console.log(allCategoryMap)

    // Step 2: Analyze viewedProducts to find top categories
    const viewedCategoryCount = {};

    products.forEach((prod) => {
      if (viewedProducts.includes(prod._id.toString())) {
        const cat = prod.category;
        if (!viewedCategoryCount[cat]) {
          viewedCategoryCount[cat] = 1;
        } else {
          viewedCategoryCount[cat]++;
        }
      }
    });

    // Step 3: Sort categories by viewed count (if any)
    const sortedViewedCategories = Object.entries(viewedCategoryCount)
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0]);

    let categoriesgridProducts = [];

    if (sortedViewedCategories.length > 0) {
      sortedViewedCategories.forEach((cat) => {
        if (allCategoryMap.has(cat)) {
          categoriesgridProducts.push(allCategoryMap.get(cat));
        }
      });

      for (let [cat, info] of allCategoryMap) {
        if (
          !sortedViewedCategories.includes(cat) &&
          categoriesgridProducts.length < 6
        ) {
          categoriesgridProducts.push(info);
        }
      }
    } else {
      categoriesgridProducts = Array.from(allCategoryMap.values()).slice(0, 6);
    }

    //filtering for categorized products
    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
        const products = await product
          .find({
            _id: { $in: category.featuredProducts },
          })
          .sort({
            rating: -1,
            salesCount: -1,
            createdAt: -1,
          })
          .select(
            "_id name price category subCategory offerPrice images rating salesCount"
          )
          .lean();

        return {
          _id: category._id,
          category: category.category,
          subCategory: category.subCategory,
          products,
        };
      })
    );

    const filteredCategories = categoriesWithProducts.filter(
      (category) => category.products && category.products.length > 0
    );

    const filteredproducts = filteredCategories.filter(
      (category) => category.products && category.products.length > 6
    );

    res.status(200).json({
      success: true,
      categoriesgridProducts,
      filteredCategories,
      filteredproducts,
      trending,
      newArrivals,
      recentlyViewedProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
      details: error.message,
    });
  }
});

// Get product by ID
router.get("/fetch/:id", async (req, res) => {
  const { id } = req.params;

  console.log("isValid:", mongoose.Types.ObjectId.isValid(id));

  // 👇 First validate the ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      success: false,
      error: "Invalid product ID format",
    });
  }

  try {
    const productItem = await product.findById(id);

    if (!productItem) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    const subcat = productItem.subCategory;
    const subCatProducts = await product.find({ subCategory: subcat });

    const finalsubcatprods = subCatProducts.filter(
      (p) => !p._id.equals(productItem._id)
    );

    res.status(200).json({
      success: true,
      data: productItem,
      relatedProducts: finalsubcatprods,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product",
    });
  }
});

// GET /admin/paginated?page=1&limit=10
router.get("/admin/paginated", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const query = {};

    // Category filter
    if (req.query.category && req.query.category !== "all") {
      query.category = req.query.category;
    }

    // Search filter
    if (req.query.search) {
      const searchRegex = new RegExp(escapeRegex(req.query.search), "i");
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
      ];
    }

    // Additional filters can be added here (e.g., price range, stock status)
    if (req.query.minPrice) {
      query.price = { ...query.price, $gte: parseFloat(req.query.minPrice) };
    }
    if (req.query.maxPrice) {
      query.price = { ...query.price, $lte: parseFloat(req.query.maxPrice) };
    }

    // Execute queries in parallel for better performance
    const [products, total] = await Promise.all([
      product
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      product.countDocuments(query),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.min(page, totalPages || 1);

    res.status(200).json({
      success: true,
      products,
      total,
      page: currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      limit,
    });
  } catch (error) {
    console.error("Error in paginated products:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Helper function to escape regex characters
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

router.get("/paginated", async (req, res) => {
  try {
    const {
      userId,
      productId,
      page = 1,
      limit = 8,
      minPrice = 0,
      maxPrice = 100000,
      selectedbrands,
    } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const parsedMinPrice = Number(minPrice);
    const parsedMaxPrice = Number(maxPrice);

    let category,
      subCategory,
      clickedProduct = null;

    if (productId) {
      try {
        clickedProduct = await product
          .findById(productId)
          .select(
            "category subCategory brand stock salesCount offerPrice price images name description rating "
          )
          .lean();

        if (clickedProduct) {
          ({ category, subCategory } = clickedProduct);
          clickedProduct.images = clickedProduct.images?.length
            ? clickedProduct.images
            : ["/placeholder-product.jpg"];
        }
      } catch (error) {
        console.error("Error fetching product by ID:", error);
      }
    } else {
      category = req.query.category;
      subCategory = req.query.subCategory;
    }

    const baseFilter = {
      ...(category && { category }),
      ...(subCategory && { subCategory }),
      offerPrice: {
        $gte: parsedMinPrice,
        $lte: parsedMaxPrice,
      },
    };
    const sidebarFilter = {
      ...(category && { category }),
      ...(subCategory && { subCategory }),
    };

    const finalFilter = selectedbrands
      ? { ...baseFilter, brand: { $in: selectedbrands } } // Changed to $in operator
      : baseFilter;

    const [Uniquebrands, total, maxPriceResult] = await Promise.all([
      product.distinct("brand", sidebarFilter),
      product.countDocuments(finalFilter),
      product
        .findOne(sidebarFilter)
        .sort({ offerPrice: -1 })
        .select("offerPrice")
        .lean(),
    ]);

    const maxOfferPrice = maxPriceResult?.offerPrice || 0;
    const totalPages = Math.ceil(total / parsedLimit);

    let skip = (parsedPage - 1) * parsedLimit;
    const clickedProductInserted =
      clickedProduct &&
      clickedProduct.offerPrice <= parsedMaxPrice &&
      (!selectedbrands || clickedProduct.brand === selectedbrands);

    if (parsedPage > 1 && clickedProductInserted) {
      skip = Math.max(skip - 1, 0);
    }

    // Get paginated products with all necessary fields
    let products = await product
      .find(finalFilter)
      .select(
        "category subCategory name description price brand stock salesCount offerPrice images rating"
      )
      .skip(skip)
      .limit(parsedLimit)
      .sort({ createdAt: -1 })
      .lean();

    if (clickedProduct) {
      // First check if clicked product matches all current filters
      const clickedProductMatchesFilters =
        clickedProduct.offerPrice >= parsedMinPrice &&
        clickedProduct.offerPrice <= parsedMaxPrice &&
        (!selectedbrands || selectedbrands.includes(clickedProduct.brand));

      // Filter out the clicked product if it exists in results
      products = products.filter(
        (p) => p._id.toString() !== clickedProduct._id.toString()
      );

      // Only insert if on first page and matches all filters
      if (parsedPage === 1 && clickedProductMatchesFilters) {
        const fullClickedProduct = {
          ...clickedProduct,
        };

        // Insert without reducing total count
        products = [fullClickedProduct, ...products];

        // Only slice if we exceeded the limit
        if (products.length > parsedLimit) {
          products = products.slice(0, parsedLimit);
        }
      }
    }

    let cartProductIds = [];
    if (userId) {
      const userCart = await Cart.findOne({ userId })
        .select("items.productId")
        .lean();
      if (userCart) {
        cartProductIds = userCart.items.map((item) =>
          item.productId.toString()
        );
      }
    }

    const finalProducts = products.map((prod) => ({
      ...prod,
      isAddedToCart: cartProductIds.includes(prod._id.toString()),
    }));

    res.status(200).json({
      success: true,
      data: finalProducts,
      totalPages,
      maxPrice: maxOfferPrice,
      Uniquebrands,
    });
  } catch (error) {
    console.error("Error in paginated fetch:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch paginated products",
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
      displayName,
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
      displayName,
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

// update views product
router.put("/views/update/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: "Invalid product ID format",
      });
    }

    const existingProduct = await product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }
    existingProduct.views += 1;
    await existingProduct.save();

    res.status(200).json({
      success: true,
      message: "Product views updated successfully",
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
    const products = await product
      .find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { brand: { $regex: query, $options: "i" } },
          { category: { $regex: query, $options: "i" } },
          { subCategory: { $regex: query, $options: "i" } },
          { displayName: { $regex: query, $options: "i" } },
          { tags: { $in: [new RegExp(query, "i")] } },
        ],
      })
      .limit(10);

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

router.get("/admin/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }
    const products = await product
      .find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { brand: { $regex: query, $options: "i" } },
          { category: { $regex: query, $options: "i" } },
          { subCategory: { $regex: query, $options: "i" } },
          { displayName: { $regex: query, $options: "i" } },
        ],
      })
      .limit(10);

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
