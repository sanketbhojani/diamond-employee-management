# MongoDB Connection Guide

This guide will help you connect your Employee Management System to MongoDB.

## 📋 Table of Contents
1. [Option 1: MongoDB Atlas (Cloud - Recommended)](#option-1-mongodb-atlas-cloud---recommended)
2. [Option 2: Local MongoDB](#option-2-local-mongodb)
3. [Configuration Steps](#configuration-steps)
4. [Testing Connection](#testing-connection)
5. [Troubleshooting](#troubleshooting)

---

## Option 1: MongoDB Atlas (Cloud - Recommended) 🌐

MongoDB Atlas is a free cloud database service. It's the easiest way to get started.

### Step 1: Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (no credit card required)
3. Verify your email address

### Step 2: Create a Cluster
1. After logging in, click **"Build a Database"**
2. Choose **"FREE"** (M0) tier
3. Select a cloud provider and region (choose closest to you)
4. Click **"Create"** (cluster name will be auto-generated)

### Step 3: Create Database User
1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter a username (e.g., `admin`)
5. Enter a strong password (save this password!)
6. Set user privileges to **"Atlas admin"** or **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Configure Network Access
1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - Or add your specific IP address for production
4. Click **"Confirm"**

### Step 5: Get Connection String
1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** and version **"5.5 or later"**
5. Copy the connection string (looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update Connection String
1. Replace `<username>` with your database username
2. Replace `<password>` with your database password
3. Add your database name at the end (before `?`):
   ```
   mongodb+srv://admin:mypassword@cluster0.xxxxx.mongodb.net/employee_management?retryWrites=true&w=majority
   ```

### Step 7: Update .env File
1. Open `backend/.env` file
2. Update the `MONGODB_URI` line with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://admin:mypassword@cluster0.xxxxx.mongodb.net/employee_management?retryWrites=true&w=majority
   ```
3. Save the file

---

## Option 2: Local MongoDB 💻

If you have MongoDB installed on your computer, you can use it locally.

### Step 1: Install MongoDB
1. Download MongoDB from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Install MongoDB Community Server
3. Start MongoDB service:
   - **Windows**: MongoDB should start automatically as a service
   - **Mac/Linux**: Run `mongod` in terminal

### Step 2: Verify MongoDB is Running
- Open terminal/command prompt
- Run: `mongosh` or `mongo` (depending on version)
- If it connects, MongoDB is running ✅

### Step 3: Update .env File
1. Open `backend/.env` file
2. The default connection string should work:
   ```env
   MONGODB_URI=mongodb://localhost:27017/employee_management
   ```
3. Save the file

---

## Configuration Steps ⚙️

### 1. Update .env File
Edit `backend/.env` and set your `MONGODB_URI`:

```env
# For MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/employee_management?retryWrites=true&w=majority

# OR for Local MongoDB
MONGODB_URI=mongodb://localhost:27017/employee_management
```

### 2. Update Other Environment Variables
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key_change_this
```

### 3. Restart Your Backend Server
```bash
cd backend
npm run dev
```

You should see: `MongoDB Connected` ✅

---

## Testing Connection 🧪

### Method 1: Check Server Logs
When you start the backend server, you should see:
```
MongoDB Connected
✓ Department "Deepak" created
✓ Department "Laser" created
...
Departments initialized
Server running on port 5000
```

### Method 2: Test API Endpoint
1. Start your backend server
2. Open browser and go to: `http://localhost:5000/api/dashboard`
3. If you see data or no errors, connection is working ✅

### Method 3: Check MongoDB Atlas Dashboard
1. Go to MongoDB Atlas dashboard
2. Click **"Browse Collections"**
3. You should see your database `employee_management` with collections

---

## Troubleshooting 🔧

### Error: "MongoServerError: Authentication failed"
- **Solution**: Check your username and password in the connection string
- Make sure you URL-encoded special characters in password (e.g., `@` becomes `%40`)

### Error: "MongoNetworkError: connect ECONNREFUSED"
- **Solution**: 
  - For local MongoDB: Make sure MongoDB service is running
  - For Atlas: Check your IP address is whitelisted in Network Access

### Error: "MongoServerError: IP not whitelisted"
- **Solution**: 
  - Go to MongoDB Atlas → Network Access
  - Add your current IP address or allow access from anywhere (0.0.0.0/0)

### Error: "MongooseError: The `uri` parameter to `openUri()` must be a string"
- **Solution**: Check your `.env` file - make sure `MONGODB_URI` is properly set without quotes

### Connection String Format Issues
- Make sure there are **no spaces** in the connection string
- Make sure password doesn't contain special characters that need encoding
- Format: `mongodb+srv://username:password@cluster/database?options`

### Can't Find .env File
- Make sure the file is in the `backend/` folder
- File should be named exactly `.env` (with the dot at the beginning)
- On Windows, you might need to show hidden files

---

## Quick Reference 📝

### MongoDB Atlas Connection String Format:
```
mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database]?retryWrites=true&w=majority
```

### Local MongoDB Connection String Format:
```
mongodb://localhost:27017/[database]
```

### Example .env File:
```env
MONGODB_URI=mongodb+srv://admin:MyPassword123@cluster0.abc123.mongodb.net/employee_management?retryWrites=true&w=majority
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=my_super_secret_key_12345
```

---

## Need Help? 💬

If you're still having issues:
1. Check the server console for error messages
2. Verify your connection string format
3. Test connection using MongoDB Compass (GUI tool)
4. Check MongoDB Atlas logs in the dashboard

---

## Security Notes 🔒

⚠️ **Important for Production:**
- Never commit `.env` file to Git (already in .gitignore)
- Use strong passwords for database users
- Restrict IP access in MongoDB Atlas for production
- Use environment-specific connection strings
- Rotate JWT secrets regularly

---

**Happy Coding! 🚀**


