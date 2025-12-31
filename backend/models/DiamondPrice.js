const mongoose = require('mongoose');

const diamondPriceSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  price: {
    type: Number,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  subDepartment: {
    type: String,
    trim: true,
    default: null
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient lookup
diamondPriceSchema.index({ department: 1, subDepartment: 1, category: 1 });

module.exports = mongoose.model('DiamondPrice', diamondPriceSchema);













