const express = require("express");
const { Resend } = require("resend");
const axios = require("axios");
require("dotenv").config();
const User = require("../models/userschema");
const { OtpTemplate } = require("./OtpTemplate");
const { generateOrderEmailHTML } = require("./OrderTemplate");
const { generateForgetPasswordEmailHTML } = require("./ForgetPassword");

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);
let verificationCodes = {};

const isValidEmailFormat = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const checkEmailWithAbstract = async (email) => {
  try {
    const response = await axios.get(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_API_KEY}&email=${email}`
    );
    return response.data.is_smtp_valid?.value || false;
  } catch (err) {
    console.error("❌ Abstract API error:", err.message);
    return false;
  }
};

router.post("/signup", async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmailFormat(email)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid email format" 
    });
  }

  const isRealEmail = await checkEmailWithAbstract(email);
  if (!isRealEmail) {
    return res.status(400).json({
      success: false,
      message: "This email doesn't seem to exist or is disposable.",
    });
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000);

  try {
    const { data, error } = await resend.emails.send({
      from: "Shopique <onboarding@resend.dev>",
      to: email,
      subject: "🌟 Welcome to Shopique! Verify Your Email",
      text: `Your verification code is: ${verificationCode}`,
      html: OtpTemplate(verificationCode),
    });

    if (error) {
      throw error;
    }

    verificationCodes[email] = {
      code: verificationCode,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    console.log(`✅ OTP sent to ${email}: ${verificationCode}`);
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully! Check your email.",
    });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to send OTP. Try again." 
    });
  }
});

router.get("/verify-otp/:otp", (req, res) => {
  const { otp } = req.params;
  const { email } = req.query;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Missing email or OTP",
    });
  }

  const stored = verificationCodes[email];

  if (!stored) {
    return res.status(404).json({
      success: false,
      message: "No verification request found for this email",
    });
  }

  const currentTime = Date.now();

  if (currentTime > stored.expiresAt) {
    delete verificationCodes[email];
    return res.status(400).json({
      success: false,
      message: "OTP has expired. Please request a new one.",
    });
  }

  if (parseInt(otp) !== stored.code) {
    return res.status(401).json({
      success: false,
      message: "Invalid OTP. Please try again.",
    });
  }

  delete verificationCodes[email];

  return res.status(200).json({
    success: true,
    message: "OTP verified successfully",
  });
});

router.post("/orderplaced", async (req, res) => {
  const { email, data, orderId } = req.body;

  if (!email || !isValidEmailFormat(email)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid email format" 
    });
  }

  const user = await User.findById(data.userId);
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: "User not found" 
    });
  }

  try {
    const { error } = await resend.emails.send({
      from: "Shopique <onboarding@resend.dev>",
      to: email,
      subject: "✅ Shopique - Order Confirmation",
      html: generateOrderEmailHTML(user.username, data, orderId),
    });

    if (error) {
      throw error;
    }

    console.log("Order confirmation email sent");
    return res.status(200).json({
      success: true,
      message: "Order confirmation sent to email!",
    });
  } catch (error) {
    console.error("❌ Error sending order confirmation:", error);
    return res.status(500).json({
      success: false,
      message: "Could not send confirmation email.",
    });
  }
});

router.post("/forget-pwd", async (req, res) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    return res.status(200).json({
      success: true,
      type: 100,
      message: "Account not found",
    });
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000);

  try {
    const { error } = await resend.emails.send({
      from: "Shopique <onboarding@resend.dev>",
      to: email,
      subject: "✅ Shopique - Password Reset",
      html: generateForgetPasswordEmailHTML(verificationCode),
    });

    if (error) {
      throw error;
    }

    verificationCodes[email] = {
      code: verificationCode,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    console.log(`✅ Password reset OTP sent to ${email}`);
    return res.status(200).json({
      success: true,
      type: 200,
      message: "OTP sent successfully!",
    });
  } catch (error) {
    console.error("❌ Error sending password reset:", error);
    return res.status(500).json({
      success: false,
      message: "Could not send verification email.",
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP code are required",
    });
  }

  const storedCode = verificationCodes[email];
  if (!storedCode) {
    return res.status(400).json({
      success: false,
      message: "OTP not found or expired. Please request a new one.",
    });
  }

  if (Date.now() > storedCode.expiresAt) {
    delete verificationCodes[email];
    return res.status(400).json({
      success: false,
      message: "OTP expired. Please request a new one.",
    });
  }

  if (parseInt(code) !== storedCode.code) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP code. Please try again.",
    });
  }

  delete verificationCodes[email];
  return res.status(200).json({
    success: true,
    message: "OTP verified successfully",
  });
});

router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email and Password are required",
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

module.exports = router;