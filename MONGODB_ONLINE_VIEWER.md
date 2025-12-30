# How to View MongoDB Data Online

There are several ways to view your MongoDB data online or with a GUI:

## Option 1: MongoDB Atlas (Cloud - Recommended for Online Viewing)

### Step 1: Create a Free MongoDB Atlas Account
1. Go to: **https://www.mongodb.com/cloud/atlas**
2. Click "Try Free" or "Sign Up"
3. Create a free account (M0 Free Tier available)

### Step 2: Create a Cluster
1. After signing up, create a new cluster
2. Choose **FREE** tier (M0 Sandbox)
3. Select your preferred cloud provider and region
4. Click "Create Cluster" (takes 3-5 minutes)

### Step 3: Set Up Database Access
1. Go to **Security > Database Access**
2. Click "Add New Database User"
3. Create a username and password
4. Set privileges to "Read and write to any database"
5. Click "Add User"

### Step 4: Set Up Network Access
1. Go to **Security > Network Access**
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (or add your IP)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to **Database** section
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/employee_management?retryWrites=true&w=majority`)

### Step 6: Update Your Application
1. Edit `backend/.env` file
2. Replace `MONGODB_URI` with your Atlas connection string:
   ```env
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/employee_management?retryWrites=true&w=majority
   ```
3. Replace `yourusername` and `yourpassword` with your database user credentials
4. Make sure `employee_management` is the database name (or change it)

### Step 7: View Data in Atlas
1. Go to **Database** section in Atlas
2. Click "Browse Collections"
3. You can now view all your data in a beautiful web interface!

---

## Option 2: MongoDB Compass (Desktop GUI - Best for Local MongoDB)

### Step 1: Download MongoDB Compass
1. Go to: **https://www.mongodb.com/try/download/compass**
2. Download MongoDB Compass for Windows
3. Install it

### Step 2: Connect to Your Database
1. Open MongoDB Compass
2. Connection string:
   - For local MongoDB: `mongodb://localhost:27017`
   - For Atlas: Use your Atlas connection string
3. Click "Connect"

### Step 3: Navigate to Your Database
1. Click on `employee_management` database
2. Browse all collections (users, employees, departments, etc.)
3. View, edit, and search data with a beautiful GUI

---

## Option 3: Use Online MongoDB Viewers (Third-Party)

### mongoDBViewer.com
- URL: **https://mongodbviewer.com/**
- Upload your connection string (use with caution - read privacy policy)
- View data in browser

### Studio 3T (Free Tier Available)
- URL: **https://studio3t.com/download/**
- Professional MongoDB GUI tool
- Free tier available for non-commercial use
- Can connect to both local and Atlas databases

---

## Option 4: Quick Data Export/Import Script

I've created a script (`backend/view-mongodb-data.js`) that shows all data in the terminal. You can also create an export script to export data to JSON.

---

## Recommended Approach

1. **For Online Viewing**: Use **MongoDB Atlas** (Option 1)
   - Free tier available
   - Access from anywhere
   - Beautiful web interface
   - No software installation needed

2. **For Local Development**: Use **MongoDB Compass** (Option 2)
   - Full-featured GUI
   - Fast and responsive
   - Great for local MongoDB

---

## Current Setup Check

To check your current MongoDB connection:
- If `MONGODB_URI` in `backend/.env` starts with `mongodb://localhost`, you're using local MongoDB
- If it starts with `mongodb+srv://`, you're using MongoDB Atlas

---

## Need Help?

1. **Atlas Setup Video**: Search "MongoDB Atlas Setup Tutorial" on YouTube
2. **Compass Tutorial**: Search "MongoDB Compass Tutorial" on YouTube
3. **MongoDB Documentation**: https://docs.mongodb.com/

---

## Quick Start for Atlas

1. Sign up at: https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0)
3. Create database user
4. Add IP address (0.0.0.0/0 for anywhere)
5. Get connection string
6. Update `backend/.env` with connection string
7. Restart your backend server
8. View data in Atlas web interface!






