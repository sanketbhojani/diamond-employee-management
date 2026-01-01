# Employee Management System - MERN Stack

A comprehensive Employee Management System built with MongoDB, Express, React, and Node.js. This system is designed for GOMUKH DIAMOND company to manage employees, departments, diamond prices, salary transfers, and generate various reports.

## Features

### Authentication
- User signup and login
- Gmail-based forgot password functionality
- JWT token-based authentication
- Protected routes

### Manager Dashboard
- Total employees count
- Total departments count
- Total salary paid statistics

### Department Management
- Create, edit, and delete departments (4P, Auto, Galaxy, Laser, Sarin, Russian)
- Create, edit, and delete sub-departments
- Assign employees to sub-departments

### Employee Management
- Add, edit, and delete employees with comprehensive details:
  - Unique Employee ID
  - Personal information (name, email, mobile, Aadhar, PAN)
  - Department and sub-department assignment
  - Employee type (Fix/Chutak)
  - Salary management (salary, advanced salary, net/gross salary)
  - Bank details (auto-hide if salary type is cash)
  - Full form validation
- Search functionality (by ID, name, department, contact)
- Filter by department and sub-department
- View employees of selected department

### Diamond Price Management
- Set default diamond prices for categories A(2.60), B(3.0), C(3.60), D(4)
- Add/remove diamond categories
- Assign different diamond prices per department/sub-department
- Individual department diamond price setup

### Daily Diamond Entry System
- Add, edit, and delete diamond entries
- Auto-fetch diamond price based on employee's department
- Calculate daily, monthly, and yearly salary for Chutak employees
- Filter entries by employee and date range

### Company Bank Details
- Add, edit, and delete company bank details (GOMUKH DIAMOND)
- Multiple bank account support

### Salary Transfer
- Structured salary transfer UI (UI only, no backend banking)
- Select employee and company bank account
- Display transfer summary with all relevant details

### Reports & Export
- Department-wise reports
- Monthly reports
- Yearly reports
- Total employee reports
- Export employees to PDF/Excel
- Export departments to PDF/Excel

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Nodemailer for email functionality
- PDFKit for PDF generation
- XLSX for Excel generation

### Frontend
- React 18
- React Router DOM
- Axios for API calls
- React Toastify for notifications
- Vite as build tool

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Gmail account for password reset functionality

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee_management
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

# Gmail Configuration for Forgot Password
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password_here
```

**Note:** For Gmail, you need to generate an App Password:
1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate a new app password for "Mail"
5. Use this password in the `GMAIL_PASS` field

4. Start the backend server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Sign Up**: Create a new manager account
2. **Login**: Use your credentials to log in
3. **Dashboard**: View overview statistics
4. **Departments**: Create and manage departments and sub-departments
5. **Employees**: Add employees with all required information
6. **Diamond Prices**: Set up diamond prices for different categories and departments
7. **Diamond Entries**: Record daily diamond entries for Chutak employees
8. **Bank Details**: Add company bank account details
9. **Salary Transfer**: Process salary transfers (UI only)
10. **Reports**: Generate and export various reports

## Default Departments

The system supports the following departments:
- 4P
- Auto
- Galaxy
- Laser
- Sarin
- Russian

## Default Diamond Prices

Initial default prices are set as:
- Category A: ₹2.60
- Category B: ₹3.0
- Category C: ₹3.60
- Category D: ₹4.0

## Data Persistence

All data is stored in MongoDB and instantly available on the website. New data is immediately reflected in the UI and persisted to the database.

## Production Deployment

Before deploying to production:

1. Change the `JWT_SECRET` to a strong random string
2. Update `MONGODB_URI` to your production MongoDB connection string
3. Set up proper environment variables on your hosting platform
4. Build the frontend for production:
```bash
cd frontend
npm run build
```
5. Serve the built files using a static file server or integrate with your backend

## License

This project is proprietary software for GOMUKH DIAMOND.

## Support

For issues or questions, please contact the development team.



















