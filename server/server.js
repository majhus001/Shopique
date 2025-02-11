const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();
const authRoutes = require("./Authentication");
const mobileRoutes = require("./mobileprod");
const clothingRoutes = require("./clothprod");
const homeappliRoutes = require("./homeappli");
const cartRoutes = require("./cart");
const orderRoutes = require("./order");
const adminRoutes = require("./Admin/userdatas");
const sendVerificationotp = require("./Emailverification/emailotp");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/mobiles", mobileRoutes);
app.use("/api/clothings", clothingRoutes);
app.use("/api/hoappliances", homeappliRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth/send-verify-otp", sendVerificationotp);


// MongoDB Connection
// mongodb+srv://majidsmart7:maji5002@cluster0.jyfpj.mongodb.net/Ecommerse
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log("Error connecting to MongoDB: ", err));




// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
