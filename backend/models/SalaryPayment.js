const mongoose = require('mongoose');

const salaryPaymentSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['bank', 'cash'],
    required: true
  },
  fromBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankDetail'
  },
  receiptNumber: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate receipt number before saving
salaryPaymentSchema.pre('save', async function(next) {
  if (!this.receiptNumber) {
    const count = await mongoose.model('SalaryPayment').countDocuments();
    this.receiptNumber = `SR-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('SalaryPayment', salaryPaymentSchema);








