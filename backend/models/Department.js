const mongoose = require('mongoose');

const subDepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }]
}, {
  timestamps: true
});

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [1, 'Department name cannot be empty'],
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  subDepartments: [subDepartmentSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);









