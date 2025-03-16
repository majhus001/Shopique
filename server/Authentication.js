const express = require("express");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const User = require("./models/userschema");
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

router.post("/logout", (req, res) => {
  console.log("logingg out")
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "Strict" });
  res.json({ success: true, message: "Logged out successfully!" });
});

// fetch User details with user Id
router.get("/fetch/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User fetched successfully", data: user });
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
    const { name, email, password, mobile, address } = req.body;
    console.log(req.body);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.username = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (mobile) user.mobile = mobile;
    if (address) user.address = address;

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
        message: "User details updated successfully",
        user: updatedUser,
      });
    }
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
