const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

router.post("/submit", async (req, res) => {
  const { name, email, message } = req.body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !message.trim()
  ) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    await Contact.create({ name, email, message });
    return res
      .status(201)
      .json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    console.error("Contact form error:", err);
    return res
      .status(500)
      .json({
        success: false,
        message: "Server error. Please try again later.",
      });
  }
});

module.exports = router;
