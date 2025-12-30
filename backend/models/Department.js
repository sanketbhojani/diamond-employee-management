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
    enum: ['4P', 'Auto', 'Galaxy', 'Laser', 'Sarin', 'Russian']
  },
  subDepartments: [subDepartmentSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);






