const mongoose = require("mongoose");

const RecentActivitySchema = new mongoose.Schema(
  {
    username: String,
    activity: String,
  },
  { timestamps: true }
);

const RecentActivity = mongoose.model("recentactivity", RecentActivitySchema);

module.exports = RecentActivity;
