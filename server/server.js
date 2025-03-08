const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require('dotenv').config();
const authRoutes = require("./Authentication");
const mobileRoutes = require("./Products/mobileprod");
const clothingRoutes = require("./Products/clothprod");
const homeappliRoutes = require("./Products/homeappli");
const cartRoutes = require("./Carder/cart");
const orderRoutes = require("./Carder/order");
const adminRoutes = require("./Admin/userdatas");
const sendVerificationotp = require("./Emailverification/emailotp");

const app = express();

const allowedOrigins = [
  "http://localhost:5000", // Local frontend
  "https://shopique-iota.vercel.app", // Deployed frontend
];

// Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);


app.use(cookieParser());
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
