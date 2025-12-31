require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');

    // Import models
    const Employee = require('./models/Employee');
    const Department = require('./models/Department');
    const User = require('./models/User');
    const DiamondEntry = require('./models/DiamondEntry');
    const DiamondPrice = require('./models/DiamondPrice');
    const BankDetail = require('./models/BankDetail');

    console.log('='.repeat(60));
    console.log('📊 DATABASE OVERVIEW');
    console.log('='.repeat(60));

    // View Employees
    const employeeCount = await Employee.countDocuments();
    console.log(`\n👥 EMPLOYEES: ${employeeCount}`);
    if (employeeCount > 0) {
      const employees = await Employee.find().limit(5).select('employeeId name email employeeType department');
      employees.forEach(emp => {
        console.log(`   - ${emp.employeeId}: ${emp.name} (${emp.employeeType})`);
      });
      if (employeeCount > 5) {
        console.log(`   ... and ${employeeCount - 5} more`);
      }
    }

    // View Departments
    const departmentCount = await Department.countDocuments();
    console.log(`\n🏢 DEPARTMENTS: ${departmentCount}`);
    if (departmentCount > 0) {
      const departments = await Department.find().select('name subDepartments');
      departments.forEach(dept => {
        const subCount = dept.subDepartments?.length || 0;
        console.log(`   - ${dept.name} (${subCount} sub-departments)`);
      });
    }

    // View Users
    const userCount = await User.countDocuments();
    console.log(`\n👤 USERS: ${userCount}`);
    if (userCount > 0) {
      const users = await User.find().select('email role');
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }

    // View Diamond Prices
    const priceCount = await DiamondPrice.countDocuments();
    console.log(`\n💎 DIAMOND PRICES: ${priceCount}`);

    // View Diamond Entries
    const entryCount = await DiamondEntry.countDocuments();
    console.log(`\n📝 DIAMOND ENTRIES: ${entryCount}`);

    // View Bank Details
    const bankCount = await BankDetail.countDocuments();
    console.log(`\n🏦 BANK DETAILS: ${bankCount}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Data overview complete!');
    console.log('='.repeat(60));

    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error connecting to MongoDB:', err.message);
    process.exit(1);
  });

