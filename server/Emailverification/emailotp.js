const express = require("express");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const router = express.Router(); 
sgMail.setApiKey(process.env.SENDGRID_API_KEY); 
let verificationCodes = {};

router.post("/", async (req, res) => {
  const { email } = req.body;
  console.log("otp")

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000);

  const msg = {
    to: email,      
    from: "majidsmart7@gmail.com", 
    subject: "🔐 Shopique OTP Verification Code",
    text: `Your OTP is: ${verificationCode}. This code is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9; text-align: center;">
        <h2 style="color: #4CAF50;">🔒 Secure OTP Verification</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 18px; color: #555;">Your One-Time Password (OTP) for verification is:</p>
        <p style="font-size: 24px; font-weight: bold; color: #4CAF50; background-color: #e8f5e9; padding: 10px; border-radius: 5px; display: inline-block;">${verificationCode}</p>
        <p style="font-size: 16px; color: #777;">This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 14px; color: #999;">If you didn't request this OTP, please ignore this email or contact our support team.</p>
        <p style="font-size: 14px; color: #999;">© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
      </div>
    `,
  };
  

  try {
    await sgMail.send(msg);
    verificationCodes[email] = { code: verificationCode, expiresAt: Date.now() + 10 * 60 * 1000 };

    console.log(`✅ OTP sent to ${email}: ${verificationCode}`);
    return res.status(200).json({ success: true, message: "OTP sent successfully", code: verificationCode});
  } catch (error) {
    console.error("❌ Error sending OTP:", error.response?.body || error.message);
    return res.status(500).json({ success: false, message: "Failed to send OTP. Try again." });
  }
});

module.exports = router;
