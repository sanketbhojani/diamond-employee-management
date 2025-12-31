import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setMobileMenuOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initialize on mount
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [location, isMobile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/departments', label: 'Departments', icon: '🏢' },
    { path: '/employees', label: 'Employees', icon: '👥' },
    { path: '/diamond-prices', label: 'Diamond Prices', icon: '💎' },
    { path: '/diamond-entries', label: 'Diamond Entries', icon: '📝' },
    { path: '/bank-details', label: 'Bank Details', icon: '🏦' },
    { path: '/salary-transfer', label: 'Salary Transfer', icon: '💰' },
    { path: '/salary-report', label: 'Salary Report', icon: '📋' },
    { path: '/reports', label: 'Reports', icon: '📈' }
  ];

  const sidebarStyle = {
    width: isMobile ? '280px' : (sidebarOpen ? '280px' : '80px'),
    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    color: 'white',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    padding: '24px 16px',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '4px 0 6px rgba(0, 0, 0, 0.1)',
    transform: isMobile ? (mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)'
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    display: mobileMenuOpen && isMobile ? 'block' : 'none'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Mobile Overlay */}
      <div style={overlayStyle} onClick={() => setMobileMenuOpen(false)} />

      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 1001,
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            width: '48px',
            height: '48px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s'
          }}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      )}

      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={{ 
          marginBottom: '32px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          paddingBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          gap: '12px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            flex: sidebarOpen ? '1' : 'none',
            minWidth: 0
          }}>
            <Logo size={sidebarOpen ? 80 : 60} />
            {sidebarOpen && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                lineHeight: '1.2'
              }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}>
                  GOMUKH
                </h2>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}>
                  DIAMOND
                </h2>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '20px',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
              flexShrink: 0
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 16px',
                  color: 'white',
                  textDecoration: 'none',
                  marginBottom: '8px',
                  borderRadius: '10px',
                  transition: 'all 0.3s',
                  background: isActive ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                  fontWeight: isActive ? '600' : '400',
                  boxShadow: isActive ? '0 4px 6px rgba(99, 102, 241, 0.3)' : 'none',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center'
                }}
                onMouseEnter={(e) => !isActive && (e.target.style.background = 'rgba(255, 255, 255, 0.1)')}
                onMouseLeave={(e) => !isActive && (e.target.style.background = 'transparent')}
              >
                <span style={{ 
                  marginRight: sidebarOpen ? '12px' : '0',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '24px'
                }}>
                  {item.icon}
                </span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            marginTop: '24px',
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '15px',
            transition: 'all 0.3s',
            boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 8px rgba(239, 68, 68, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 6px rgba(239, 68, 68, 0.3)';
          }}
        >
          {sidebarOpen ? (
            <>
              <span>🚪</span>
              <span>Logout</span>
            </>
          ) : (
            <span>🚪</span>
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main
        style={{
          marginLeft: isMobile ? '0' : (sidebarOpen ? '280px' : '80px'),
          flex: 1,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: isMobile ? '16px' : '24px',
          paddingTop: isMobile ? '72px' : '24px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%)',
          minHeight: '100vh',
          width: '100%',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

