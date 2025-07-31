const express = require("express");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const User = require("./models/userschema");
const Employee = require("./models/EmployeeSchema");
const jwt = require("jsonwebtoken");
const AdminEmail = require("./Admin/AdminEmail");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

SECRET_KEY = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access denied. No token provided." });
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
  res.json({ success: true, message: "User is valid", user: req.user });
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

    user.lastLogin = new Date();
    await user.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      image: user.image,
      pincode: user.pincode,
    };

    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: userData,
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

router.post("/login/check/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId); // FIX: findById is case-sensitive

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const lastLogin = user.lastLogin;
    const today = new Date();

    const diffInMs = today - lastLogin;

    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays > 5) {
      return res.status(200).json({
        success: false,
        message: `Login denied. Last login was ${diffInDays} days ago.`,
        daysSinceLastLogin: diffInDays,
      });
    }

    res.status(200).json({
      success: true,
      message: `Login allowed. Last login was ${diffInDays} days ago.`,
      daysSinceLastLogin: diffInDays,
    });
  } catch (error) {
    console.error("Error during last login check:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
});

router.post("/employee/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const employee = await Employee.findOne({ email });

    if (!employee || employee.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if employee is active
    if (employee.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: `Your account is currently ${employee.status.toLowerCase()}. Please contact the administrator.`,
      });
    }

    employee.attendance.push({
      date: new Date(),
      status: "Present",
      checkIn: new Date(),
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
        role: "Employee",
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
        role: "Employee",
      },
    });
  } catch (error) {
    console.error("Error during employee login:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
});

router.post("/logout", (req, res) => {
  console.log("logingg out");
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.json({ success: true, message: "Logged out successfully!" });
  } catch {
    res.json({ success: false, message: "Logged out error!" });
  }
});

router.post("/employee/logout/:empId", async (req, res) => {
  try {
    const employeeId = req.params.empId;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to match only the date

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    console.log("before ", employee);
    const attendanceToday = employee.attendance.find((att) => {
      const attDate = new Date(att.date);
      attDate.setHours(0, 0, 0, 0);
      return attDate.getTime() === today.getTime();
    });

    if (attendanceToday) {
      attendanceToday.checkOut = new Date();

      // Optional: Calculate working hours if checkIn is available
      if (attendanceToday.checkIn) {
        const hours =
          (attendanceToday.checkOut - attendanceToday.checkIn) /
          (1000 * 60 * 60);
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
    console.log(employee);
    await employee.save();
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    console.log("log");
    res.json({
      success: true,
      message: "Logged out successfully and attendance updated!",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during logout" });
  }
});

// fetch User details with user Id
router.get("/fetch/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      console.log("no");
      return res.status(404).json({ message: "User not found" });
    }

    const lastLogin = user.lastLogin;
    const today = new Date();

    const diffInMs = today - lastLogin;

    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    console.log(`User last logged in ${diffInDays} days ago.`);

    if (diffInDays > 5) {
      return res.status(200).json({
        success: false,
        message: `Login denied. Last login was ${diffInDays} days ago.`,
        daysSinceLastLogin: diffInDays,
      });
    }

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      image: user.image,
      pincode: user.pincode,
    };

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: userData,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      image: user.image,
      pincode: user.pincode,
    };

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user: userData,
    });
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
    
    user.mobile = mobile || " ";
    user.address = address || " ";
    console.log("pincode",pincode)
    user.pincode = pincode || " ";

    if (req.file) {
      const file = req.file;
      const result = await cloudinary.uploader
        .upload_stream({ folder: "Users" }, async (error, cloudResult) => {
          if (error) {
            return res.status(500).json({ message: "Image upload failed" });
          }

          user.image = cloudResult.secure_url;
          const updatedUser = await user.save();

          console.log("profile updated....");
          res.status(200).json({
            message: "User details updated successfully",
            user: updatedUser,
          });
        })
        .end(file.buffer);
    } else {
      const updatedUser = await user.save();

      const userData = {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        image: updatedUser.image,
        pincode: updatedUser.pincode,
      };
      res.status(200).json({
        success: true,
        message: "User details updated successfully",
        user: userData,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user details" });
  }
});

router.put(
  "/employees/update/:userId",
  upload.single("image"),
  async (req, res) => {
    try {
      console.log(req.params.userId);
      console.log(req.body);
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
  }
);

router.delete("/delete/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

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

router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;

    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const username = payload.name;
    const picture = payload.picture;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username,
        email,
        image: picture,
        password: "google-oauth",
        pincode: "",
      });
      await user.save();
      console.log("✅ Google Signup success");
    }

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      image: user.image,
      pincode: user.pincode,
    };

    console.log("llll");
    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: userData,
      role: "user",
    });
  } catch (error) {
    console.error("❌ Google Login Error:", error);
    res.status(500).json({ success: false, message: "Google login failed." });
  }
});

module.exports = router;
