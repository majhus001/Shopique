const express = require('express');
const Report = require('../models/ReportSchema'); // Import Report model

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {

    const { orderId, username, email, mobile, address, pincode, generatedAt } = req.body;

    if (!orderId || !username || !email || !mobile || !address) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newReport = new Report({
      orderId,
      username,
      email,
      mobile,
      address,
      pincode,
      generatedAt,
    });

    await newReport.save();

    console.log("Report successfully saved to DB");
    res.status(201).json({ message: 'Report stored successfully.' });

  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ message: 'Server Error. Could not store report.' });
  }
});

router.get("/fetch", async (req, res) => {
  try {
    const reports = await Report.find();
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

module.exports = router;
