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

router.get("/auth/checkvaliduser", verifyToken, (req, res) => {
  res.json({ message: "User is valid", user: req.user });
});
