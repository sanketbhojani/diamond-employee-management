const mongoose = require('mongoose');

const diamondEntrySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  category: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  diamondPrice: {
    type: Number,
    required: true
  },
  dailySalary: {
    type: Number,
    default: 0
  },
  monthlySalary: {
    type: Number,
    default: 0
  },
  yearlySalary: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate salaries based on quantity and price
diamondEntrySchema.pre('save', function(next) {
  if (this.quantity && this.diamondPrice) {
    this.dailySalary = this.quantity * this.diamondPrice;
    this.monthlySalary = this.dailySalary * 30;
    this.yearlySalary = this.dailySalary * 365;
  }
  next();
});

module.exports = mongoose.model('DiamondEntry', diamondEntrySchema);







