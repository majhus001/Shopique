const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Bill = require("../models/BillSchema");
const Dailysales = require("../models/DailysalesSchema");
const { product } = require("../models/products");
const Customer = require("../models/Customer");
const EmployeeRecentActivity = require("../models/EmployeeRecentActivity");

const { authenticateToken } = require("../middleware/auth");

// Route to save bill
router.post("/savebill", authenticateToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const billData = req.body;
    const { items, customerId, employeeId, billNumber } = billData;

    // Check for duplicate bill number
    const existingBill = await Bill.findOne({ billNumber }).session(session);
    if (existingBill) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Bill with this number already exists",
      });
    }

    // Validate stock availability first
    for (const item of items) {
      const productItem = await product
        .findById(item.productId)
        .session(session);
      if (!productItem) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }
      if (productItem.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${productItem.name}. Available: ${productItem.stock}, Requested: ${item.quantity}`,
        });
      }
    }

    // Save new bill
    const newBill = new Bill(billData);
    await newBill.save({ session });
    console.log("update salecount")
    // Update product stock and sales count
    for (const item of items) {
      await product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            stock: -item.quantity, 
            salesCount: +item.quantity, 
          },
          $set: { lastSoldAt: new Date() },
        },
        { session }
      );
      console.log("salecount of ", item.name," ", item.saleCount)

    }

    // Update customer's total purchases if customer exists
    if (customerId) {
      await Customer.findByIdAndUpdate(
        customerId,
        { $inc: { totalPurchases: 1 } },
        { session, new: true }
      );
    }

    // Log activity
    const activity = new EmployeeRecentActivity({
      employeeId,
      activityType: "BILL_CREATED",
      description: `Created bill #${billNumber}`,
      billId: newBill._id,
      itemsCount: items.length,
      totalAmount: billData.grandTotal,
      timestamp: new Date(),
    });
    await activity.save({ session });

    // Log daily sales
    const dailySalesRecords = items.map((item) => ({
      productId: item.productId,
      billNumber,
      productname: item.name,
      price: item.unitPrice,
      quantity: item.quantity,
      totalAmount: item.total,
      category: item.category,
      soldAt: new Date(),
      soldBy: employeeId,
      customerId,
    }));
    await Dailysales.insertMany(dailySalesRecords, { session });

    // Commit transaction if all operations succeeded
    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Bill saved successfully with all updates",
      billId: newBill._id,
      billNumber: newBill.billNumber,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error saving bill:", error);
    return res.status(500).json({
      success: false,
      message: "Error saving bill",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
});

// Route to get all bills
router.get("/fetch", async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: bills,
    });
  } catch (error) {
    console.error("Error fetching bills:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching bills",
      error: error.message,
    });
  }
});

router.get("/fetchByCategories", async (req, res) => {
  try {
    // Define the priority order for categories
    const categoryPriorityOrder = [
      "mobile",
      "laptop",
      "toys",
      "electronics",
      "fashion",
      "home",
      "beauty",
      "sports"
    ];

    // Get all distinct subcategories that exist in our products
    const allSubCategories = await product.distinct("subCategory");
    
    // Filter and sort subcategories according to our priority order
    const sortedSubCategories = categoryPriorityOrder
      .filter(cat => allSubCategories.includes(cat))
      .concat(
        allSubCategories.filter(cat => !categoryPriorityOrder.includes(cat))
          .sort((a, b) => a.localeCompare(b))
      );

    // Fetch limited products for each subcategory with sorting
    const productsByCategory = await Promise.all(
      sortedSubCategories.map(async (subCategory) => {
        const products = await product
          .find({ subCategory })
          .limit(10) // Limit to 10 products per category
          .sort({ 
            rating: -1,        // Highest rated first
            salesCount: -1,    // Then by popularity
            createdAt: -1     // Then by newest
          })
          .select('name price offerPrice images rating salesCount brand description stock deliverytime');
        
        return {
          subCategory,
          products
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: productsByCategory,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
    });
  }
});

// Route to get bill by ID
router.get("/fetchbyemployeeId/:employeeId", async (req, res) => {
  try {
    const employeeId = req.params.employeeId;

    const bills = await Bill.find({ employeeId: employeeId });

    if (!bills || bills.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bills found for this employee",
      });
    }

    return res.status(200).json({
      success: true,
      data: bills,
    });
  } catch (error) {
    console.error("Error fetching bill:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching bill",
      error: error.message,
    });
  }
});

router.get("/customer/fetch/:custId", async (req, res) => {
  try {
    const bills = await Bill.find({
      customerId: req.params.custId,
    }).sort({ createdAt: -1 });

    if (bills.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bills found for this customer",
      });
    }

    // Step 1: Get all unique productIds
    const productIds = bills.flatMap((bill) =>
      Array.isArray(bill.items)
        ? bill.items.map((item) => item.productId.toString())
        : []
    );
    const uniqueProductIds = [...new Set(productIds)].map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Step 2: Fetch all product data
    const products = await product.find({ _id: { $in: uniqueProductIds } });

    // Step 3: Create a productId → product map
    const productMap = {};
    products.forEach((prod) => {
      productMap[prod._id.toString()] = prod;
    });

    // Step 4: Attach image to each bill item
    const billsWithImages = bills.map((bill) => {
      const updatedItems = bill.items.map((item) => {
        const product = productMap[item.productId.toString()];
        return {
          ...item.toObject(), // convert Mongoose subdoc to plain object
          image: product?.images[0] || null, // attach image if found
        };
      });

      return {
        ...bill.toObject(),
        items: updatedItems,
      };
    });

    return res.status(200).json({
      success: true,
      bills: billsWithImages,
    });
  } catch (error) {
    console.error("Error fetching customer bills and product images:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching customer bills and product images",
      error: error.message,
    });
  }
});

module.exports = router;


