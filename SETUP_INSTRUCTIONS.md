# Setup Instructions to Run the Site

## Prerequisites

1. **MongoDB** - Must be installed and running
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

2. **Node.js** - Should already be installed

## Quick Start

### Option 1: Use the Batch File (Windows)

1. Double-click `START_SERVERS.bat`
2. Two windows will open (Backend and Frontend)
3. Access the site at: http://localhost:3000

### Option 2: Manual Start

#### Step 1: Start MongoDB

**If using local MongoDB:**
- Make sure MongoDB service is running
- On Windows: Check Services or run `mongod`

**If using MongoDB Atlas:**
- Get your connection string from Atlas
- Update `backend/.env` with your Atlas connection string

#### Step 2: Configure Backend (if not done)

Edit `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee_management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_gmail_app_password
```

**Note:** For password reset to work, configure Gmail credentials. Otherwise, you can leave them as placeholder values.

#### Step 3: Start Backend Server

Open a terminal and run:
```bash
cd backend
npm run dev
```

You should see: "MongoDB Connected" and "Server running on port 5000"

#### Step 4: Start Frontend Server

Open a NEW terminal and run:
```bash
cd frontend
npm run dev
```

You should see: "Local: http://localhost:3000"

#### Step 5: Access the Application

Open your browser and go to: **http://localhost:3000**

## First Time Setup

1. **Sign Up** - Create your manager account
2. **Login** - Use your credentials
3. **Create Departments** - Start by creating departments (4P, Auto, Galaxy, Laser, Sarin, Russian)
4. **Add Employees** - Add employees with all required details
5. **Set Diamond Prices** - Configure diamond prices (defaults are auto-created)
6. **Add Bank Details** - Add company bank account details

## Troubleshooting

### MongoDB Connection Error
```
MongoDB Connection Error: connect ECONNREFUSED
```
**Solution:** 
- Make sure MongoDB is running
- Check the connection string in `.env`
- For local: `mongodb://localhost:27017/employee_management`
- For Atlas: Use your Atlas connection string

### Port Already in Use
**Solution:** 
- Change PORT in `backend/.env`
- Update proxy in `frontend/vite.config.js`

### Frontend Can't Connect to Backend
**Solution:**
- Make sure backend is running on port 5000
- Check browser console for errors
- Verify CORS is enabled in backend (already configured)

## Default Data

- **Departments:** 4P, Auto, Galaxy, Laser, Sarin, Russian
- **Diamond Prices:** A(2.60), B(3.0), C(3.60), D(4.0) - Auto-initialized

## Need Help?

- Check the README.md for detailed documentation
- Check QUICK_START.md for quick reference
- Ensure all dependencies are installed: `npm install` in both backend and frontend folders







