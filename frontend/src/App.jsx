import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Employees from './pages/Employees';
import DiamondPrices from './pages/DiamondPrices';
import DiamondEntries from './pages/DiamondEntries';
import BankDetails from './pages/BankDetails';
import SalaryTransfer from './pages/SalaryTransfer';
import Reports from './pages/Reports';
import SalaryReport from './pages/SalaryReport';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="departments" element={<Departments />} />
          <Route path="employees" element={<Employees />} />
          <Route path="diamond-prices" element={<DiamondPrices />} />
          <Route path="diamond-entries" element={<DiamondEntries />} />
          <Route path="bank-details" element={<BankDetails />} />
          <Route path="salary-transfer" element={<SalaryTransfer />} />
          <Route path="reports" element={<Reports />} />
          <Route path="salary-report" element={<SalaryReport />} />
        </Route>
        {/* Catch-all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

