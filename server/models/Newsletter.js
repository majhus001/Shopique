const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
    },
    source: {
      type: String,
      default: "website", // like "popup", "footer", "checkout", etc.
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // creates createdAt & updatedAt
  }
);

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

module.exports = Newsletter;
