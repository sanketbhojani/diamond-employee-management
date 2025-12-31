# How to View Data in MongoDB Atlas

There are several ways to view your data in MongoDB Atlas. Here are the easiest methods:

---

## Method 1: MongoDB Atlas Web Interface (Easiest) 🌐

This is the simplest way to view your data directly in the browser.

### Steps:

1. **Log in to MongoDB Atlas**
   - Go to: https://cloud.mongodb.com/
   - Sign in with your MongoDB Atlas account

2. **Navigate to Your Cluster**
   - Click on your cluster: `diamond-employee-manage`
   - Or go to **"Database"** in the left sidebar

3. **Browse Collections**
   - Click the **"Browse Collections"** button
   - You'll see your database: `employee_management`
   - Click on the database to see all collections:
     - `employees`
     - `departments`
     - `users`
     - `diamondentries`
     - `diamondprices`
     - `bankdetails`
     - `salarypayments`
     - etc.

4. **View Documents**
   - Click on any collection to see all documents
   - You can filter, search, and edit documents directly in the interface

---

## Method 2: MongoDB Compass (Desktop App) 💻

MongoDB Compass is a powerful GUI tool for viewing and managing MongoDB data.

### Installation:

1. **Download MongoDB Compass**
   - Go to: https://www.mongodb.com/try/download/compass
   - Download for Windows
   - Install the application

2. **Connect to Your Database**
   - Open MongoDB Compass
   - Paste your connection string:
     ```
     mongodb+srv://sanketbhojani107_db_user:mmFU0wJpsI9RHOQN@diamond-employee-manage.5lkv4te.mongodb.net/employee_management?retryWrites=true&w=majority
     ```
   - Click **"Connect"**

3. **Browse Your Data**
   - You'll see all your databases and collections
   - Click on any collection to view, edit, and query documents
   - Features:
     - View all documents in a collection
     - Filter and search documents
     - Edit documents directly
     - Run queries
     - View indexes and schemas

---

## Method 3: MongoDB Shell (mongosh) - Command Line ⚡

Use the command line to query your data.

### Installation:

1. **Install MongoDB Shell**
   - Download from: https://www.mongodb.com/try/download/shell
   - Or install via npm:
     ```bash
     npm install -g mongosh
     ```

2. **Connect to Your Database**
   ```bash
   mongosh "mongodb+srv://sanketbhojani107_db_user:mmFU0wJpsI9RHOQN@diamond-employee-manage.5lkv4te.mongodb.net/employee_management?retryWrites=true&w=majority"
   ```

3. **View Collections**
   ```javascript
   show collections
   ```

4. **View Data in a Collection**
   ```javascript
   // View all employees
   db.employees.find().pretty()

   // View all departments
   db.departments.find().pretty()

   // Count documents
   db.employees.countDocuments()

   // Find specific document
   db.employees.findOne({ employeeId: "EMP001" })
   ```

---

## Method 4: VS Code Extension (For Developers) 🔧

If you use Visual Studio Code, you can view MongoDB data directly in your editor.

### Setup:

1. **Install MongoDB Extension**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "MongoDB for VS Code"
   - Install the extension

2. **Connect to Database**
   - Click on MongoDB icon in the sidebar
   - Click "Add Connection"
   - Paste your connection string
   - Connect!

3. **Browse Data**
   - Expand your connection
   - Browse databases and collections
   - Click on collections to view documents

---

## Method 5: Create a Simple Data Viewer Script 📊

You can also create a simple Node.js script to view your data.

### Create `backend/view-data.js`:

```javascript
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

    // View Employees
    console.log('📋 EMPLOYEES:');
    const employees = await Employee.find().limit(10);
    console.log(`Total: ${await Employee.countDocuments()} employees\n`);
    employees.forEach(emp => {
      console.log(`- ${emp.employeeId}: ${emp.name} (${emp.employeeType})`);
    });

    // View Departments
    console.log('\n🏢 DEPARTMENTS:');
    const departments = await Department.find();
    console.log(`Total: ${departments.length} departments\n`);
    departments.forEach(dept => {
      console.log(`- ${dept.name} (${dept.subDepartments?.length || 0} sub-departments)`);
    });

    // View Users
    console.log('\n👤 USERS:');
    const users = await User.find();
    console.log(`Total: ${users.length} users\n`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });

    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
```

### Run the script:

```bash
cd backend
node view-data.js
```

---

## Quick Reference: Your Collections

Based on your application, here are the main collections:

- **employees** - Employee records
- **departments** - Department and sub-department data
- **users** - User accounts (managers/admins)
- **diamondentries** - Daily diamond entries
- **diamondprices** - Diamond pricing data
- **bankdetails** - Bank account information
- **salarypayments** - Salary payment records

---

## Recommended Method

**For beginners:** Use **MongoDB Atlas Web Interface** (Method 1) - it's the easiest and requires no installation.

**For developers:** Use **MongoDB Compass** (Method 2) - it provides powerful features and better visualization.

---

## Security Note 🔒

Your connection string contains your password. Keep it secure and never share it publicly or commit it to Git (it's already in .gitignore).

