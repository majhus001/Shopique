const express = require("express");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const User = require("./models/userschema");
const Employee = require("./models/EmployeeSchema");
const jwt = require("jsonwebtoken");
const AdminEmail = require("./Admin/AdminEmail")

const router = express.Router();

SECRET_KEY = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.cookies.token; 
  if (!token) {
    console.log("false");
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token." });
  }
};

router.get("/checkvaliduser", verifyToken, (req, res) => {
  res.json({ success:true, message: "User is valid", user: req.user });
});

router.post("/signup", async (req, res) => {
  const { username, email, password, mobile, address, image } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("email already exists");
      return res.status(400).json({
        success: "false",
        message: "Email already registered... please login",
      });
    }

    const newUser = new User({
      username,
      email,
      password,
      mobile,
      address,
      image,
    });

    await newUser.save();
    console.log("Signup success");
    res.status(201).json({ success: true, message: "Signup successful!" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
});

router.get("/signup/check", async (req, res) => {
  try {
    const { email } = req.query; // Get email from query parameters

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }

    // Check if user already exists in the database
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(200)
        .json({ success: false, message: "Email already registered." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Email is available." });
  } catch (error) {
    console.error("Error checking email:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, image: user.image },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    console.log("Login success");
    const role = user.email === AdminEmail ? "Admin" : "User";

    res.cookie("token", token, {
      httpOnly: true, 
      secure: true, 
      sameSite: "none", 
    });

    res.status(200).json({
      success: true,
      message: "Login successful!",
      user,
      role,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
});

router.post("/employee/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  try {
    const employee = await Employee.findOne({ email });

    if (!employee || employee.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check if employee is active
    if (employee.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: `Your account is currently ${employee.status.toLowerCase()}. Please contact the administrator.`
      });
    }

    employee.attendance.push({
      date: new Date(), 
      status: 'Present', 
      checkIn: new Date()
    });
    await employee.save();

    // Create JWT token
    const token = jwt.sign(
      {
        employeeId: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        role: "Employee"
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
     
    // Return success response
    res.status(200).json({
      success: true,
      message: "Login successful!",
      employee: {
        _id: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        role: "Employee"
      }
    });
  } catch (error) {
    console.error("Error during employee login:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again."
    });
  }
});

router.post("/logout", (req, res) => {
  console.log("logingg out")
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "Strict" });
  res.json({ success: true, message: "Logged out successfully!" });
});

router.post("/employee/logout/:empId", async (req, res) => {
  try {
    const employeeId = req.params.empId;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to match only the date

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    console.log("before ",employee);
    const attendanceToday = employee.attendance.find(att => {
      const attDate = new Date(att.date);
      attDate.setHours(0, 0, 0, 0);
      return attDate.getTime() === today.getTime();
    });

    if (attendanceToday) {
      attendanceToday.checkOut = new Date();

      // Optional: Calculate working hours if checkIn is available
      if (attendanceToday.checkIn) {
        const hours = (attendanceToday.checkOut - attendanceToday.checkIn) / (1000 * 60 * 60);
        attendanceToday.workingHours = Math.round(hours * 100) / 100;
      }

    } else {
      // If no attendance exists for today, create a new record (optional)
      employee.attendance.push({
        date: new Date(),
        status: "Present",
        checkOut: new Date(),
        workingHours: 0,
      });
    }
    console.log(employee)
    await employee.save();
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "Strict" });
    console.log("log")
    res.json({ success: true, message: "Logged out successfully and attendance updated!" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Server error during logout" });
  }
});

// fetch User details with user Id
router.get("/fetch/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success:true, message: "User fetched successfully", data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// fetch All User details
router.get("/fetch", async (req, res) => {
  try {
    const user = await User.find();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("users fetched");
    console.log(user);
    res
      .status(200)
      .json({ message: "Users data fetched successfully", data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.put("/update/:userId", upload.single("image"), async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, email, password, mobile, address, pincode } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.username = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (mobile) user.mobile = mobile;
    if (address) user.address = address;
    if (pincode) user.pincode = pincode;

    if (req.file) {
      const file = req.file;
      const result = await cloudinary.uploader
        .upload_stream({ folder: "Users" }, async (error, cloudResult) => {
          if (error) {
            return res.status(500).json({ message: "Image upload failed" });
          }

          user.image = cloudResult.secure_url;
          const updatedUser = await user.save();
          console.log("updated");

          res.status(200).json({
            message: "User details updated successfully",
            user: updatedUser,
          });
        })
        .end(file.buffer); // Upload the file to Cloudinary
    } else {
      // If no image is provided, save without changing the image
      const updatedUser = await user.save();
      res.status(200).json({
        success: true,
        message: "User details updated successfully",
        user: updatedUser,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user details" });
  }
});

router.put("/employees/update/:userId", upload.single("image"), async (req, res) => {
  try {
    console.log(req.params.userId)
    console.log(req.body)
    const userId = req.params.userId;
    const { name, email, password, mobile, address } = req.body;

    const employee = await Employee.findById(userId);

    if (!employee) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) employee.fullName = name;
    if (email) employee.email = email;
    if (password) employee.password = password;
    if (mobile) employee.phone = mobile;
    if (address) employee.address = address;

    if (req.file) {
      const file = req.file;

      const cloudinaryResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Users" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      employee.image = cloudinaryResult.secure_url;
    }

    const updatedEmployee = await employee.save();
    res.status(200).json({
      success: true,
      message: "User details updated successfully",
      user: updatedEmployee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user details" });
  }
});


router.delete("/delete/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User deleted successfully", data: deletedUser });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/users/details", async (req, res) => {
  try {
    const { userIds } = req.query; // Get user IDs from query params
    console.log("Received User IDs:", userIds);

    if (!userIds || userIds.trim() === "") {
      return res.status(400).json({ error: "User IDs are required" });
    }

    const userIdsArray = userIds.split(",").map((id) => id.trim()); // Convert CSV string back to array & trim spaces

    const users = await User.find({ _id: { $in: userIdsArray } }).select(
      "username image"
    );

    if (!users.length) {
      return res.status(404).json({ error: "No users found" });
    }

    const userDetails = users.reduce((acc, user) => {
      acc[user._id] = { username: user.username, image: user.image };
      return acc;
    }, {});

    res.json(userDetails);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
