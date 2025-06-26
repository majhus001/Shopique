const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,  
    trim: true
  },
  displayName: {
    type: String,
    required: true
  },
  priority: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featuredProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Schema options
  autoIndex: true 
});

categorySchema.index({ priority: -1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;