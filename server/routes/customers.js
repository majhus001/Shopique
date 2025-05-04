const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
// const { verifyToken } = require("../middleware/auth");

// Add a new customer
router.post("/add",  async (req, res) => {
  try {
    const { username, mobile, email, address } = req.body;

    if (!username || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Username and mobile number are required",
      });
    }

    // Check if customer with this mobile already exists
    const existingCustomer = await Customer.findOne({ mobile });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer with this mobile number already exists",
      });
    }

    // Create new customer
    const newCustomer = new Customer({
      username,
      mobile,
      email,
      address,
    });

    await newCustomer.save();

    res.status(201).json({
      success: true,
      message: "Customer added successfully",
      customer: newCustomer,
    });
  } catch (error) {
    console.error("Error adding customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add customer",
      error: error.message,
    });
  }
});

// Get all customers
router.get("/fetch", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
});

// Get customer by ID
router.get("/fetch/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }
    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
});

// Get customer by mobile number
router.get("/fetchByMobile/:mobile", async (req, res) => {
  try {
    const customer = await Customer.findOne({ mobile: req.params.mobile });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }
    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error fetching customer by mobile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
});

// Update customer
router.put("/update/:id", async (req, res) => {
  try {
    const { username, mobile, email, address, notes, status } = req.body;
    
    // Check if mobile is being changed and if it already exists
    if (mobile) {
      const existingCustomer = await Customer.findOne({ 
        mobile, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: "Another customer with this mobile number already exists",
        });
      }
    }
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        username,
        mobile,
        email,
        address,
        notes,
        status,
      },
      { new: true }
    );
    
    if (!updatedCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update customer",
      error: error.message,
    });
  }
});

// Delete customer
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    
    if (!deletedCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
      error: error.message,
    });
  }
});

module.exports = router;
