import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalSalaryPaid: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: '👥',
      color: '#fff'
    },
    {
      title: 'Total Departments',
      value: stats.totalDepartments,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      icon: '🏢',
      color: '#fff'
    },
    {
      title: 'Total Salary Paid',
      value: `₹${parseFloat(stats.totalSalaryPaid).toLocaleString('en-IN')}`,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      icon: '💰',
      color: '#fff'
    }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ 
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <h1 style={{ 
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: '700',
          color: '#1f2937',
          margin: 0
        }}>
          Dashboard
        </h1>
        <span style={{ fontSize: '24px' }}>📊</span>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        {statCards.map((card, index) => (
          <div
            key={index}
            className="card"
            style={{
              background: card.gradient,
              color: card.color,
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: 'none',
              padding: '28px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              fontSize: '120px',
              opacity: 0.1,
              pointerEvents: 'none'
            }}>
              {card.icon}
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '16px'
              }}>
                <span style={{ fontSize: '32px' }}>{card.icon}</span>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '16px',
                  fontWeight: '500',
                  opacity: 0.9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {card.title}
                </h3>
              </div>
              <div style={{ 
                fontSize: 'clamp(32px, 5vw, 48px)', 
                fontWeight: '700',
                lineHeight: 1.2
              }}>
                {card.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Section */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
        border: '2px solid rgba(102, 126, 234, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ fontSize: '48px' }}>👋</div>
          <div>
            <h2 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
              Welcome to Gomukh Diamond Management
            </h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>
              Manage your employees, departments, and salary payments efficiently from one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

