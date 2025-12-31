import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Logo from '../components/Logo';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Login successful!');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-50%',
        left: '-50%',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }}></div>

      <div className="card" style={{ 
        width: '100%',
        maxWidth: '450px', 
        padding: '48px 40px',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        border: 'none'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <Logo size={150} />
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              lineHeight: '1.2'
            }}>
              <h2 style={{ 
                fontSize: '32px',
                fontWeight: '700', 
                color: '#1f2937',
                margin: 0,
                letterSpacing: '0.5px'
              }}>
                GOMUKH
              </h2>
              <h2 style={{ 
                fontSize: '32px',
                fontWeight: '700', 
                color: '#1f2937',
                margin: 0,
                letterSpacing: '0.5px'
              }}>
                DIAMOND
              </h2>
            </div>
          </div>
          <p style={{ color: '#6b7280', fontSize: '15px', marginTop: '8px' }}>
            Employee Management System
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              marginTop: '8px'
            }} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={{ marginRight: '8px' }}>⏳</span>
                Logging in...
              </>
            ) : (
              <>
                <span style={{ marginRight: '8px' }}>🔐</span>
                Login
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link 
            to="/forgot-password" 
            style={{ 
              color: '#6366f1', 
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Forgot Password?
          </Link>
        </div>
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>Don't have an account? </span>
          <Link 
            to="/signup" 
            style={{ 
              color: '#6366f1', 
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

