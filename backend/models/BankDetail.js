const mongoose = require('mongoose');

const bankDetailSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    default: 'GOMUKH DIAMOND',
    trim: true
  },
  accountNumber: {
    type: String,
    required: true,
    trim: true
  },
  ifscCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  branchName: {
    type: String,
    required: true,
    trim: true
  },
  accountHolderName: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BankDetail', bankDetailSchema);

