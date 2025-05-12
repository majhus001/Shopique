const mongoose = require("mongoose");

const EmpRecentActivitySchema = new mongoose.Schema(
  {
    employeeId: mongoose.Schema.Types.ObjectId,
    activityType: String,
    description: String,
    billId: String,
    itemsCount: Number,
    totalAmount: Number,
  },
  { timestamps: true }
);

const EmployeeRecentActivity = mongoose.model(
  "Employeeactivity",
  EmpRecentActivitySchema
);

module.exports = EmployeeRecentActivity;
