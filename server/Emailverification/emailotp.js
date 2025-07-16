const express = require("express");
const sgMail = require("@sendgrid/mail");
const axios = require("axios");
require("dotenv").config();
const User = require("../models/userschema");

const router = express.Router();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
let verificationCodes = {};

const isValidEmailFormat = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const checkEmailWithAbstract = async (email) => {
  try {
    const res = await axios.get(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_API_KEY}&email=${email}`
    );
    const data = res.data;
    return data.is_smtp_valid;
  } catch (err) {
    console.error("❌ Abstract API error:", err.message);
    return false;
  }
};

router.post("/signup", async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmailFormat(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email format" });
  }

  // 🔐 Validate with AbstractAPI
  const isRealEmail = await checkEmailWithAbstract(email);
  if (!isRealEmail.value) {
    return res.status(400).json({
      success: false,
      message: "This email doesn't seem to exist or is disposable.",
    });
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000);

  const msg = {
    to: email,
    from: {
      email: "majidsmart7@gmail.com",
      name: "Shopique",
    },
    subject: "🌟 Welcome to Shopique! Verify Your Email to Get Started",
    text: `Welcome to Shopique! Your verification code is: ${verificationCode}\n\nThis code expires in 10 minutes. Please enter this code in your browser to complete verification.`,
    html: `
    <div style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; max-width: 900px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.05);">
      <!-- Welcome Header -->
      <div style="background: linear-gradient(135deg, #4F46E5 0%, #007AFF 100%); padding: 20px 25px; text-align: center; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 70% 30%, rgba(255,255,255,0.2) 0%, transparent 70%);"></div>
        <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; position: relative;">Welcome to Shopique!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px; font-weight: 400; position: relative;">Let's verify your email to begin</p>
      </div>
      
      <!-- Content Area -->
      <div style="padding: 40px 35px;">
        <div style="margin-bottom: 25px;">
          <p style="font-size: 16px; color: #4B5563; margin-bottom: 20px; line-height: 1.6;">Thank you for joining Shopique! We're excited to have you on board.</p>
          <p style="font-size: 16px; color: #4B5563; margin-bottom: 20px; line-height: 1.6;">To activate your account, please enter this verification code in your browser:</p>
        </div>
        
        <!-- Verification Code Display -->
        <div style="background: linear-gradient(to right, #F9FAFB, #F3F4F6); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; border: 1px solid rgba(79, 70, 229, 0.2); box-shadow: inset 0 1px 2px rgba(0,0,0,0.03); position: relative;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(to right, #4F46E5, #A855F7); border-radius: 12px 12px 0 0;"></div>
          <p style="margin: 0 0 8px; font-size: 14px; color: #6B7280; letter-spacing: 0.5px;">YOUR VERIFICATION CODE</p>
          <div style="font-size: 42px; font-weight: 700; letter-spacing: 5px; color: #4F46E5; margin: 15px 0; font-family: 'Courier New', monospace;">${verificationCode}</div>
          <div style="display: inline-flex; align-items: center; background: rgba(79, 70, 229, 0.1); padding: 6px 12px; border-radius: 20px; margin-top: 5px;">
            <svg style="margin-right: 6px;" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p style="margin: 0; font-size: 13px; color: #4F46E5; font-weight: 500;">Expires in 10 minutes</p>
          </div>
        </div>
        
        <!-- Verification Instructions -->
        <div style="background: rgba(249, 250, 251, 0.7); border-radius: 10px; padding: 20px; margin: 30px 0; border-left: 4px solid #E5E7EB;">
          <p style="margin: 0 0 10px; font-size: 15px; color: #4B5563; font-weight: 600;">How to use this code:</p>
          <ol style="margin: 0; padding-left: 20px; color: #4B5563; font-size: 14px; line-height: 1.6;">
            <li style="margin-bottom: 8px;">Return to your Shopique browser window</li>
            <li style="margin-bottom: 8px;">Enter the 6-digit code shown above</li>
            <li>Click "Verify Email" to complete your registration</li>
          </ol>
        </div>
        
        <!-- Security Note -->
        <div style="background: rgba(254, 242, 242, 0.5); border-radius: 10px; padding: 18px; margin: 35px 0; border-left: 4px solid #EF4444; display: flex;">
          <div style="margin-right: 12px; flex-shrink: 0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V11M12 15H12.01M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <p style="margin: 0 0 5px; font-size: 15px; color: #B91C1C; font-weight: 600;">Security Notice</p>
            <p style="margin: 0; font-size: 14px; color: #B91C1C; line-height: 1.5;">Never share this code with anyone. Shopique will never ask for this code via phone or email.</p>
          </div>
        </div>
        
        <!-- Help Section -->
        <div style="border-top: 1px solid rgba(0,0,0,0.05); padding-top: 25px;">
          <p style="font-size: 14px; color: #6B7280; margin-bottom: 15px; text-align: center;">Didn't request this code?</p>
          <p style="font-size: 13px; color: #6B7280; margin-bottom: 0; text-align: center; line-height: 1.5;">
            If you didn't initiate this signup, please ignore this email or <a href="mailto:support@shopique.com" style="color: #4F46E5; text-decoration: none; font-weight: 500;">contact support</a> immediately.
          </p>
        </div>
        
        <!-- Premium Footer -->
        <div style="border-top: 1px solid rgba(0,0,0,0.05); padding-top: 25px; text-align: center; margin-top: 25px;">
          <p style="font-size: 12px; color: #9CA3AF; margin: 0; line-height: 1.5;">
            © ${new Date().getFullYear()} Shopique. All rights reserved.<br>
            Elevating your shopping experience
          </p>
        </div>
      </div>
    </div>
    `,
  };

  try {
    await sgMail.send(msg);
    verificationCodes[email] = {
      code: verificationCode,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    console.log(`✅ OTP sent to ${email}: ${verificationCode}`);
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully! Check your email.",
      code: verificationCode,
    });
  } catch (error) {
    console.error(
      "❌ Error sending OTP:",
      error.response?.body || error.message
    );
    return res
      .status(500)
      .json({ success: false, message: "Failed to send OTP. Try again." });
  }
});

const generateOrderEmailHTML = (username, data, orderId) => {
  const itemsHTML = data.cartItems
    .map(
      (item) => `
    <tr>
      <td style="padding:15px 10px;border-bottom:1px solid #f0f0f0;">
        <a href="https://shopique-iota.vercel.app/products/${item.category}/${
        item.subCategory
      }/${item._id}" target="_blank">
          <img src="${item.image}" alt="${
        item.name
      }" width="90" style="border-radius:8px;border:1px solid #f5f5f5;" />
        </a>
      </td>
      <td style="padding:15px 10px;border-bottom:1px solid #f0f0f0;">
        <a href="https://shopique-iota.vercel.app/products/${item.category}/${
        item.subCategory
      }/${
        item._id
      }" target="_blank" style="text-decoration:none;color:#2d3748;font-weight:600;">
          ${item.name}
        </a>
        <p style="margin:8px 0 0;color:#718096;font-size:14px;">
          ${item.brand} | ${item.category}
        </p>
        <p style="margin:8px 0 0;color:#4a5568;">
          Quantity: ${item.quantity} × ₹${item.offerPrice}
        </p>
      </td>
      <td style="padding:15px 10px;color:#4a5568;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">
        Price:
      </td>
      <td style="padding:15px 10px;color:green;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">
        ₹${item.offerPrice * item.quantity}
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <div style="font-family:'Inter', Arial, sans-serif;max-width:9  00px;margin:auto;background:#ffffff;">
      <!-- Header with Branding -->
      <div style="background:#007AFF;padding:25px;text-align:center;border-radius:8px 8px 0 0;">
        <h1 style="color:white;margin:0;font-size:24px;">🛍️ Shopique</h1>
      </div>
      
      <!-- Email Content -->
      <div style="padding:25px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
        <h2 style="color:#2d3748;margin-top:0;">Thank you for your order, ${username}!</h2>
        <p style="color:#4a5568;">Your order #${orderId} has been confirmed and will be processed shortly.</p>
        
        <!-- Order Summary Card -->
        <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:25px 0;border:1px solid #edf2f7;">
          <h3 style="margin-top:0;color:#4F46E5;font-size:18px;">📦 Order Summary</h3>
          <table width="100%" style="border-collapse:collapse;">
            ${itemsHTML}
            <tr>
            <td colspan="2" style="padding:15px 10px;text-align:right;font-weight:600;border-top:1px solid #e2e8f0;">
                Total :
              </td>
             <td style="padding:15px 10px;text-align:right;font-weight:600;border-top:1px solid #e2e8f0;">
                ₹${data.totalPrice - data.deliveryfee}
              </td>
            
              
            </tr>
            <tr>
            <td colspan="2" style="padding:15px 10px;text-align:right;font-weight:600;">
                Shipping :
              </td>
              
              <td style="padding:15px 10px;text-align:right;font-weight:600;">
                ${data.deliveryfee}
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding:15px 10px;text-align:right;font-weight:600;border-top:1px solid #e2e8f0;">
                Subtotal :
              </td>
              <td style="padding:15px 10px;text-align:right;font-weight:600;border-top:1px solid #e2e8f0;">
                ₹${data.totalPrice}
              </td>

            </tr>
            <tr>
              <td colspan="2" style="padding:15px 10px;text-align:right;font-weight:700;font-size:17px;">
                Total Paid
              </td>
              <td style="padding:15px 10px;text-align:right;font-weight:700;font-size:17px;color:#4F46E5;">
                ₹${data.totalPrice}
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Delivery Details Card -->
        <div style="background:#f0fdf4;border-radius:8px;padding:20px;margin:25px 0;border:1px solid #dcfce7;">
          <h3 style="margin-top:0;color:#166534;font-size:18px;">🚚 Delivery Information</h3>
          <div style="display:flex;margin-top:15px;">
            <div style="flex:1;">
              <p style="margin:8px 0;color:#166534;font-weight:600;">Shipping Address</p>
              <p style="margin:8px 0;color:#365314;">${data.deliveryAddress}</p>
              <p style="margin:8px 0;color:#365314;">Pincode: ${
                data.pincode
              }</p>
            </div>
            <div style="flex:1;">
              <p style="margin:8px 0;color:#166534;font-weight:600;">Contact: ${
                data.mobileNumber
              }</p>
              <p style="margin:8px 0;color:#365314;">Payment: ${
                data.paymentMethod
              }</p>
            </div>
          </div>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align:center;margin:30px 0;">
          <a href="https://shopique-iota.vercel.app/user/${
            data.userId
          }/myorders" style="background:#4F46E5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">
            View Your Order
          </a>
        </div>
        
        <!-- Footer -->
        <div style="border-top:1px solid #e2e8f0;padding-top:20px;text-align:center;color:#718096;font-size:14px;">
          <p>Need help? <a href="mailto:support@shopique.com" style="color:#4F46E5;">Contact our support team</a></p>
          <p>© ${new Date().getFullYear()} Shopique. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
};

router.post("/orderplaced", async (req, res) => {
  const { email, data, orderId } = req.body;

  if (!email || !isValidEmailFormat(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email format" });
  }

  const user = await User.findById(data.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  const username = user.username;

  const msg = {
    to: email,
    from: {
      email: "majidsmart7@gmail.com",
      name: "Shopique",
    },
    subject: "✅ Shopique - Order Confirmation",
    html: generateOrderEmailHTML(username, data, orderId),
  };

  try {
    await sgMail.send(msg);
    console.log("Order mail sent");
    return res
      .status(200)
      .json({ success: true, message: "Order confirmation sent to email!" });
  } catch (error) {
    console.error(
      "❌ Email send failed:",
      error.response?.body || error.message
    );
    return res
      .status(500)
      .json({ success: false, message: "Could not send confirmation email." });
  }
});

module.exports = router;
