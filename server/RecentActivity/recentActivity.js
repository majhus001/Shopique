// routes/recentActivityRoute.js
const express = require("express");
const router = express.Router();
const RecentActivity = require("../models/recActivitySchema");

// ✅ POST route to add recent activity
router.post("/add", async (req, res) => {
  try {
    const { name, activity } = req.body;
    if (!name || !activity) {
      return res
        .status(400)
        .json({ message: "Name and Activity are required." });
    }

    const newActivity = new RecentActivity({
      username: name,
      activity: activity,
    });

    await newActivity.save();

    res
      .status(201)
      .json({ message: "Activity saved successfully.", data: newActivity });
  } catch (error) {
    console.error("Error saving activity:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// ✅ GET route to fetch recent activities
router.get("/fetch", async (req, res) => {
  try {
    const activities = await RecentActivity.find().sort({ createdAt: -1 });
    res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
