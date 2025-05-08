const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Employee = require("../models/EmployeeSchema");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/add", async (req, res) => {
  try {
    const {
      fullName,
      password,
      email,
      phone,
      position,
      department,
      salary,
      joiningDate,
      address,
      emergencyContact,
      status,
      documents
    } = req.body;

    // Check for required fields
    if (!fullName || !password || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Full name, password, email, and phone number are required",
      });
    }

    // Check if employee with this email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists",
      });
    }

    // Create new employee
    const newEmployee = new Employee({
      fullName,
      password,
      email,
      phone,
      position,
      department,
      salary,
      joiningDate,
      address,
      emergencyContact,
      status: status || 'Active',
      documents: documents || []
    });

    await newEmployee.save();

    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      employee: newEmployee,
    });
  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add employee",
      error: error.message,
    });
  }
});

// Get all employees
router.get("/fetch", async (_, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
});

// Get employee by ID
router.get("/fetch/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee",
      error: error.message,
    });
  }
});

// Get employee by phone number
router.get("/fetchByPhone/:phone", async (req, res) => {
  try {
    const employee = await Employee.findOne({ phone: req.params.phone });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching employee by phone:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee",
      error: error.message,
    });
  }
});

// Update employee
router.put("/update/:id", async (req, res) => {
  try {
    const {
      fullName,
      password,
      email,
      phone,
      position,
      department,
      salary,
      joiningDate,
      address,
      emergencyContact,
      status,
      documents
    } = req.body;

    // Check if email is being changed and if it already exists
    if (email) {
      const existingEmployee = await Employee.findOne({
        email,
        _id: { $ne: req.params.id }
      });

      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: "Another employee with this email already exists",
        });
      }
    }

    // Create update object
    const updateData = {
      fullName,
      email,
      phone,
      position,
      department,
      salary,
      joiningDate,
      address,
      emergencyContact,
      status,
      ...(documents && { documents })
    };

    // Only update password if provided
    if (password) {
      updateData.password = password;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update employee",
      error: error.message,
    });
  }
});

// Delete employee
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);

    if (!deletedEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete employee",
      error: error.message,
    });
  }
});

// Upload document for employee
router.post("/upload-document", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document file provided",
      });
    }

    // Upload file to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "employee-documents" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
            return;
          }
          resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Return the document URL and other details
    res.status(200).json({
      success: true,
      document: {
        name: req.file.originalname,
        url: result.secure_url,
        size: req.file.size,
        type: req.file.mimetype,
        uploadDate: new Date()
      }
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload document",
      error: error.message,
    });
  }
});


module.exports = router;
