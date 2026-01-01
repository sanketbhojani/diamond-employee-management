const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  subDepartment: {
    type: String,
    required: true,
    trim: true
  },
  employeeType: {
    type: String,
    enum: ['Fix', 'Chutak'],
    required: true
  },
  salaryType: {
    type: String,
    enum: ['bank', 'cash'],
    default: 'bank'
  },
  salary: {
    type: Number,
    required: true,
    default: 0
  },
  advancedSalary: {
    type: Number,
    default: 0
  },
  pf: {
    type: Number,
    default: 0
  },
  pt: {
    type: Number,
    default: 0
  },
  grossSalary: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    default: 0
  },
  aadhar: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: 'Aadhar must be 12 digits'
    }
  },
  pan: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{5}\d{4}[A-Z]{1}$/.test(v);
      },
      message: 'PAN must be in format ABCDE1234F'
    }
  },
  bankDetails: {
    accountNumber: {
      type: String,
      trim: true
    },
    ifscCode: {
      type: String,
      trim: true,
      uppercase: true
    },
    bankName: {
      type: String,
      trim: true
    },
    branchName: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isManager: {
    type: Boolean,
    default: false
  },
  hasSpecialPermissions: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-calculate net salary
employeeSchema.pre('save', function(next) {
  if (this.salary && this.advancedSalary !== undefined) {
    // If grossSalary is explicitly set (for Chutak employees with diamond entries), use it
    // Otherwise, use base salary as gross salary
    const gross = this.grossSalary !== undefined ? this.grossSalary : this.salary;
    if (this.grossSalary === undefined) {
      this.grossSalary = this.salary;
    }
    // Net salary = Gross salary - Advanced Salary - PF - PT
    const deductions = (this.advancedSalary || 0) + (this.pf || 0) + (this.pt || 0);
    this.netSalary = gross - deductions;
  }
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);

