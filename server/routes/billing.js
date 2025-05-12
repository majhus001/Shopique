const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Bill = require("../models/BillSchema");
const { product } = require("../models/products");
const Customer = require("../models/Customer");
const EmployeeRecentActivity = require("../models/EmployeeRecentActivity");

const { authenticateToken } = require("../middleware/auth");

// Route to save bill
router.post("/savebill", authenticateToken, async (req, res) => {
  try {
    const billData = req.body;
    const customerId = billData.customerId;

    // Check for duplicate bill number
    const existingBill = await Bill.findOne({ billNumber: billData.billNumber });
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
        timestamp: new Date()
      });
      await activity.save();
      console.log("Activity recorded");
    } catch (activityError) {
      console.error("Activity logging failed:", activityError);
    }

    // Final response
    return res.status(201).json({
      success: true,
      message: "Bill saved successfully and all updates applied",
      billId: newBill._id,
      billNumber: newBill.billNumber
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

    if (!bills || bills.length === 0){
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


router.get("/customer/:customerId", authenticateToken, async (req, res) => {
  try {
    const bills = await Bill.find({
      customerId: req.params.customerId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: bills,
    });
  } catch (error) {
    console.error("Error fetching customer bills:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching customer bills",
      error: error.message,
    });
  }
});


module.exports = router;
