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
  try {
    const billData = req.body;
    const { items, customerId, employeeId, createdAt, billNumber } = billData;

    // Check for duplicate bill number
    const existingBill = await Bill.findOne({
      billNumber: billNumber,
    });
    if (existingBill) {
      return res.status(400).json({
        success: false,
        message: "Bill with this number already exists",
      });
    }

    // Save new bill
    const newBill = new Bill(billData);
    await newBill.save();

    // Update product stock
    for (const item of billData.items) {
      const productItem = await product.findById(item.productId);
      if (productItem) {
        await product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
        console.log(`Stock updated for: ${item.name}`);
      } else {
        console.warn(`Product not found: ${item.productId}`);
      }
    }

    // Update customer's total purchases
    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.totalPurchases += 1;
      await customer.save();
      console.log("Customer purchase count updated");
    } else {
      console.log("Customer not found");
    }

    // Log activity
    try {
      const activity = new EmployeeRecentActivity({
        employeeId: billData.employeeId,
        activityType: "BILL_CREATED",
        description: `Created bill #${billData.billNumber}`,
        billId: newBill._id,
        itemsCount: billData.items.length,
        totalAmount: billData.grandTotal,
        timestamp: new Date(),
      });
      await activity.save();
      console.log("Activity recorded");
    } catch (activityError) {
      console.error("Activity logging failed:", activityError);
    }

    //log the daily sales
    try {
      for (const item of items) {
        const sale = new Dailysales({
          productId: item.productId,
          billNumber: billNumber,
          productname: item.name,
          price: item.unitPrice,
          quantity: item.quantity,
          totalAmount: item.total,
          category: item.category,
          soldAt: new Date(),
          soldBy: employeeId,
          customerId: customerId,
        });
        await sale.save();
        console.log(item.name, "saved to dailysale");
      }
    } catch (error) {
      console.log("error on saving to daily sales");
    }

    // Final response
    return res.status(201).json({
      success: true,
      message: "Bill saved successfully and all updates applied",
      billId: newBill._id,
      billNumber: newBill.billNumber,
    });
  } catch (error) {
    console.error("Error saving bill:", error);
    return res.status(500).json({
      success: false,
      message: "Error saving bill",
      error: error.message,
    });
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
