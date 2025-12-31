const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/diamond-prices', require('./routes/diamondPrices'));
app.use('/api/diamond-entries', require('./routes/diamondEntries'));
app.use('/api/bank-details', require('./routes/bankDetails'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/salary-transfer', require('./routes/salaryTransfer'));
app.use('/api/salary-report', require('./routes/salaryReport'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management')
.then(() => {
  console.log('MongoDB Connected');
  initializeDepartments();
})
.catch(err => console.error('MongoDB Connection Error:', err));

// Initialize default departments
const initializeDepartments = async () => {
  try {
    const Department = require('./models/Department');
    const defaultDepartments = ['Deepak', 'Laser', 'Galaxy', 'R Galaxy', 'Russian', 'Sarin', '4P'];
    
    for (const deptName of defaultDepartments) {
      const existingDept = await Department.findOne({ name: deptName });
      if (!existingDept) {
        await Department.create({ name: deptName, subDepartments: [] });
        console.log(`✓ Department "${deptName}" created`);
      }
    }
    console.log('Departments initialized');
  } catch (error) {
    console.error('Error initializing departments:', error.message);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

