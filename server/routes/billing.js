const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Bill = require("../models/BillSchema");
const { product } = require("../models/products");
const Customer = require("../models/Customer");

const { authenticateToken } = require("../middleware/auth");

// Route to save bill
router.post("/savebill", authenticateToken, async (req, res) => {
  try {
    const billData = req.body;
    const customerId = billData.customerId;
    console.log(customerId)
    // Check if bill with this number already exists
    const existingBill = await Bill.findOne({
      billNumber: billData.billNumber,
    });
    if (existingBill) {
      return res.status(400).json({
        success: false,
        message: "Bill with this number already exists",
      });
    }

    // Create new bill
    const newBill = new Bill(billData);
    await newBill.save();

    try {
      for (const item of billData.items) {
        // Find and update the product in the common products collection
        const productItem = await product.findById(item.productId);

        if (productItem) {
          await product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
          });
          console.log(
            `Updated stock for product: ${item.name}, reduced by ${item.quantity}`
          );
        } else {
          console.warn(`Could not find product with ID: ${item.productId}`);
        }
      }
    } catch (stockError) {
      console.error("Error updating product stock:", stockError);
      // Continue with the response even if stock update fails
    }

    try {
      const customer = await Customer.findOne({ _id: customerId });

      if (!customer) {
        console.log("Customer not found");
      } else {
        customer.totalPurchases += 1;
        await customer.save(); // Important to save the changes
        console.log("Purchase count updated");
      }
    } catch (error) {
      console.error("Error while updating customer:", error); // Catch block should show the error
    }

    return res.status(201).json({
      success: true,
      message: "Bill saved successfully and product stock updated",
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
router.get("/fetch", authenticateToken, async (req, res) => {
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
router.get("/fetch/:id", authenticateToken, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: bill,
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
