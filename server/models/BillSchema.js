const mongoose = require("mongoose");


const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    required: true,
    unique: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerMobile: String,
  customerEmail: String,
  customerAddress: String,
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    name: String,
    quantity: Number,
    category: String,
    unitPrice: Number,
    total: Number
  }],
  subtotal: {
    type: Number,
    required: true
  },
  taxRate: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountRate: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Failed'],
    default: 'Pending'
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create Bill Model
const Bill = mongoose.model('Bill', billSchema);


module.exports = Bill;