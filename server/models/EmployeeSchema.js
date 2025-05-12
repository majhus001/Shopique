const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    position: { type: String, required: true },
    role: {type: String, default : "Employee" },
    department: { type: String, required: true },
    salary: { type: Number, required: true },
    joiningDate: { type: Date, required: true },
    address: { type: String, required: true },
    emergencyContact: { type: String },
    status: {
      type: String,
      enum: ["Active", "On Leave", "Terminated"],
      default: "Active",
    },
    documents: [
      {
        name: String,
        url: String,
        uploadDate: { type: Date, default: Date.now },
      },
    ],
    attendance: [
      {
        date: {
          type: Date,
          required: true,
          index: true, // For faster queries
        },
        status: {
          type: String,
          enum: ["Present", "Absent", "Half Day", "Leave"],
          default: "Present",
        },
        checkIn: {
          type: Date,
          validate: {
            validator: function (v) {
              return !this.checkOut || v < this.checkOut;
            },
            message: "Check-in must be before check-out",
          },
        },
        checkOut: Date,
        workingHours: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("employees", employeeSchema);
