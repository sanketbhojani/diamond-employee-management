import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const SalaryReport = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024 && window.innerWidth > 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchDepartments();
    fetchReport();
  }, [month, year, selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      toast.error('Failed to fetch departments');
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
        departmentId: selectedDepartment
      });
      const response = await api.get(`/salary-report?${params.toString()}`);
      setReportData(response.data.report);
    } catch (error) {
      toast.error('Failed to fetch salary report');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
        departmentId: selectedDepartment
      });
      const response = await api.get(`/salary-report/pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      link.setAttribute('download', `Salary_Report_${monthNames[month - 1]}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Salary report PDF generated successfully');
    } catch (error) {
      toast.error('Failed to generate PDF report');
    }
  };

  const generateExcel = async () => {
    try {
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
        departmentId: selectedDepartment
      });
      const response = await api.get(`/salary-report/excel?${params.toString()}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      link.setAttribute('download', `Salary_Report_${monthNames[month - 1]}_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Salary report Excel generated successfully');
    } catch (error) {
      toast.error('Failed to generate Excel report');
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Navigate to next month
  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '100%', overflowX: 'hidden' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h1 style={{ 
          fontSize: isMobile ? '24px' : '32px',
          fontWeight: '700',
          color: '#1e293b',
          margin: 0
        }}>Monthly Salary Report</h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary" 
            onClick={generatePDF}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: '#3b82f6',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
          >
            Export PDF
          </button>
          <button 
            className="btn btn-success" 
            onClick={generateExcel}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: '#10b981',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ 
        marginBottom: '20px',
        padding: '24px',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px' 
        }}>
          <div className="form-group">
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#475569'
            }}>Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                background: '#ffffff'
              }}
            >
              {monthNames.map((name, index) => (
                <option key={index + 1} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#475569'
            }}>Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              min="2020"
              max="2100"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px'
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#475569'
            }}>Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                background: '#ffffff'
              }}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ 
            display: 'flex', 
            gap: '10px', 
            alignItems: isMobile ? 'stretch' : 'flex-end',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <button
              className="btn btn-secondary"
              onClick={goToPreviousMonth}
              style={{ 
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                background: '#3b82f6',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flex: isMobile ? '1' : 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#3b82f6';
              }}
            >
              ← Previous Month
            </button>
            <button
              className="btn btn-secondary"
              onClick={goToNextMonth}
              style={{ 
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                background: '#10b981',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flex: isMobile ? '1' : 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#059669';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#10b981';
              }}
            >
              Next Month →
            </button>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      {reportData && (
        <div className="card" style={{ 
          marginBottom: '20px', 
          background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            marginTop: 0,
            marginBottom: '20px',
            fontSize: '20px',
            fontWeight: '700',
            color: '#0c4a6e'
          }}>Report Summary</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px' 
          }}>
            <div style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Period</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                {monthNames[month - 1]} {year}
              </p>
            </div>
            <div style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Department</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                {selectedDepartment === 'all' 
                  ? 'All Departments' 
                  : departments.find(d => d._id === selectedDepartment)?.name || 'N/A'}
              </p>
            </div>
            <div style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Total Employees</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                {reportData.summary.totalEmployees}
              </p>
            </div>
            <div style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Total Gross Salary</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                ₹{parseFloat(reportData.summary.totalGrossSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '2px solid #86efac'
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#166534', fontWeight: '600' }}>Total Net Salary</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700', color: '#166534' }}>
                ₹{parseFloat(reportData.summary.totalNetSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Report Table */}
      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '18px', color: '#64748b', fontWeight: '600' }}>Loading report data...</div>
        </div>
      ) : reportData && reportData.employees.length > 0 ? (
        <div className="card" style={{
          padding: '24px',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflowX: 'auto',
          maxWidth: '100%'
        }}>
          <h3 style={{ 
            marginBottom: '24px',
            fontSize: '20px',
            fontWeight: '700',
            color: '#1e293b'
          }}>Employee Salary Details</h3>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
              minWidth: '1100px'
            }}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  borderBottom: '3px solid #cbd5e1'
                }}>
                  <th style={{ 
                    width: isMobile ? '0' : '8%', 
                    display: isMobile ? 'none' : 'table-cell',
                    padding: '18px 14px', 
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#000000',
                    textTransform: 'none',
                    letterSpacing: '0',
                    textAlign: 'left'
                  }}>ID</th>
                  <th style={{ 
                    width: isMobile ? '25%' : '18%',
                    padding: '18px 14px', 
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#000000',
                    textTransform: 'none',
                    letterSpacing: '0',
                    textAlign: 'left'
                  }}>Name</th>
                  <th style={{ 
                    width: isMobile ? '0' : '15%', 
                    display: isMobile ? 'none' : 'table-cell',
                    padding: '18px 14px', 
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#000000',
                    textTransform: 'none',
                    letterSpacing: '0',
                    textAlign: 'left'
                  }}>Department</th>
                  <th style={{ 
                    width: isMobile || isTablet ? '0' : '12%', 
                    display: isMobile || isTablet ? 'none' : 'table-cell',
                    padding: '18px 14px', 
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#000000',
                    textTransform: 'none',
                    letterSpacing: '0',
                    textAlign: 'left'
                  }}>Sub-Dept</th>
                  <th style={{ 
                    width: isMobile ? '20%' : '12%',
                    padding: '18px 14px', 
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#000000',
                    textTransform: 'none',
                    letterSpacing: '0',
                    textAlign: 'center'
                  }}>Type</th>
                  <th style={{ 
                    width: isMobile ? '0' : '10%', 
                    display: isMobile ? 'none' : 'table-cell',
                    padding: '18px 14px', 
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#000000',
                    textTransform: 'none',
                    letterSpacing: '0',
                    textAlign: 'right'
                  }}>Gross</th>
                  <th style={{ 
                    width: isMobile || isTablet ? '0' : '9%', 
                    display: isMobile || isTablet ? 'none' : 'table-cell',
                    padding: '18px 14px', 
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#000000',
                    textTransform: 'none',
                    letterSpacing: '0',
                    textAlign: 'right'
                  }}>Advanced</th>
                  <th style={{ 
                    width: isMobile || isTablet ? '0' : '7%', 
                    display: isMobile || isTablet ? 'none' : 'table-cell',
                    padding: '18px 14px', 
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#000000',
                    textTransform: 'none',
                    letterSpacing: '0',
                    textAlign: 'right'
                  }}>PF</th>
                  <th style={{ 
                    width: isMobile || isTablet ? '0' : '7%', 
                    display: isMobile || isTablet ? 'none' : 'table-cell',
                    padding: '18px 14px', 
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#000000',
                    textTransform: 'none',
                    letterSpacing: '0',
                    textAlign: 'right'
                  }}>PT</th>
                  <th style={{ 
                    width: isMobile ? '25%' : '12%',
                    padding: '18px 14px', 
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#000000',
                    textTransform: 'none',
                    letterSpacing: '0',
                    textAlign: 'right'
                  }}>Net Salary</th>
                  <th style={{ 
                    width: isMobile ? '0' : '10%', 
                    display: isMobile ? 'none' : 'table-cell',
                    padding: '18px 14px', 
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#000000',
                    textTransform: 'none',
                    letterSpacing: '0',
                    textAlign: 'center'
                  }}>Signature</th>
                </tr>
              </thead>
              <tbody>
                {reportData.employees.map((emp, index) => (
                  <tr 
                    key={emp._id}
                    style={{
                      background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                      transition: 'all 0.2s ease',
                      borderBottom: '1px solid #e5e7eb'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                    }}
                  >
                    <td style={{ 
                      fontSize: '14px', 
                      display: isMobile ? 'none' : 'table-cell',
                      padding: '16px 12px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      color: '#1e293b',
                      fontWeight: '600'
                    }}>{emp.employeeId}</td>
                    <td style={{ 
                      fontSize: '15px', 
                      fontWeight: '600', 
                      padding: '16px 12px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      color: '#0f172a'
                    }}>{emp.name}</td>
                    <td style={{ 
                      fontSize: '14px', 
                      display: isMobile ? 'none' : 'table-cell',
                      padding: '16px 12px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      color: '#334155',
                      fontWeight: '500'
                    }}>{emp.department?.name || 'N/A'}</td>
                    <td style={{ 
                      fontSize: '14px', 
                      display: isMobile || isTablet ? 'none' : 'table-cell',
                      padding: '16px 12px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      color: '#64748b'
                    }}>{emp.subDepartment || '-'}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '700',
                        background: emp.employeeType === 'Fix' 
                          ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' 
                          : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        color: emp.employeeType === 'Fix' ? '#166534' : '#92400e',
                        display: 'inline-block',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                        border: `2px solid ${emp.employeeType === 'Fix' ? '#86efac' : '#fcd34d'}`,
                        whiteSpace: 'nowrap',
                        minWidth: '60px',
                        textAlign: 'center'
                      }}>
                        {emp.employeeType}
                      </span>
                    </td>
                    <td style={{ 
                      fontSize: '14px', 
                      display: isMobile ? 'none' : 'table-cell',
                      padding: '16px 12px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      color: '#475569',
                      textAlign: 'right',
                      fontWeight: '600'
                    }}>₹{emp.grossSalary?.toFixed(2) || '0.00'}</td>
                    <td style={{ 
                      fontSize: '14px', 
                      display: isMobile || isTablet ? 'none' : 'table-cell',
                      padding: '16px 12px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      color: '#dc2626',
                      textAlign: 'right',
                      fontWeight: '600'
                    }}>₹{(emp.advancedSalary || 0).toFixed(2)}</td>
                    <td style={{ 
                      fontSize: '14px', 
                      display: isMobile || isTablet ? 'none' : 'table-cell',
                      padding: '16px 12px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      color: '#dc2626',
                      textAlign: 'right',
                      fontWeight: '600'
                    }}>₹{(emp.pf || 0).toFixed(2)}</td>
                    <td style={{ 
                      fontSize: '14px', 
                      display: isMobile || isTablet ? 'none' : 'table-cell',
                      padding: '16px 12px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      color: '#dc2626',
                      textAlign: 'right',
                      fontWeight: '600'
                    }}>₹{(emp.pt || 0).toFixed(2)}</td>
                    <td style={{ 
                      fontSize: '15px',
                      fontWeight: '700', 
                      padding: '16px 12px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      color: '#16a34a',
                      textAlign: 'right'
                    }}>₹{emp.netSalary?.toFixed(2) || '0.00'}</td>
                    <td style={{ 
                      borderBottom: '1px solid #e5e7eb', 
                      minWidth: '150px',
                      display: isMobile ? 'none' : 'table-cell',
                      padding: '16px 12px'
                    }}></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ 
                  background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                  fontWeight: 'bold',
                  borderTop: '3px solid #16a34a'
                }}>
                  <td 
                    colSpan={isMobile ? 3 : 5}
                    style={{
                      padding: '18px 12px',
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#166534',
                      display: isMobile ? 'table-cell' : 'table-cell'
                    }}
                  >
                    TOTAL
                  </td>
                  <td style={{
                      display: isMobile ? 'none' : 'table-cell',
                      padding: '18px 12px',
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#166534',
                      textAlign: 'right'
                    }}>
                    ₹{parseFloat(reportData.summary.totalGrossSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{
                      display: isMobile || isTablet ? 'none' : 'table-cell',
                      padding: '18px 12px',
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#dc2626',
                      textAlign: 'right'
                    }}>
                    ₹{reportData.employees.reduce((sum, emp) => sum + (emp.advancedSalary || 0), 0).toFixed(2)}
                  </td>
                  <td style={{
                      display: isMobile || isTablet ? 'none' : 'table-cell',
                      padding: '18px 12px',
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#dc2626',
                      textAlign: 'right'
                    }}>
                    ₹{reportData.employees.reduce((sum, emp) => sum + (emp.pf || 0), 0).toFixed(2)}
                  </td>
                  <td style={{
                      display: isMobile || isTablet ? 'none' : 'table-cell',
                      padding: '18px 12px',
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#dc2626',
                      textAlign: 'right'
                    }}>
                    ₹{reportData.employees.reduce((sum, emp) => sum + (emp.pt || 0), 0).toFixed(2)}
                  </td>
                  <td style={{ 
                    color: '#16a34a', 
                    fontSize: '18px',
                    fontWeight: '700',
                    padding: '18px 12px',
                    textAlign: 'right'
                  }}>
                    ₹{parseFloat(reportData.summary.totalNetSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{
                      display: isMobile ? 'none' : 'table-cell',
                      padding: '18px 12px'
                    }}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signature Section */}
          <div style={{ 
            marginTop: '40px', 
            paddingTop: '30px', 
            borderTop: '2px solid #e5e7eb' 
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              marginTop: '50px' 
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  borderTop: '2px solid #1e293b', 
                  width: '200px', 
                  marginBottom: '8px', 
                  paddingTop: '5px' 
                }}></div>
                <p style={{ 
                  fontWeight: '700',
                  fontSize: '14px',
                  color: '#1e293b',
                  margin: '4px 0'
                }}>Authorized Signatory</p>
                <p style={{
                  fontSize: '13px',
                  color: '#64748b',
                  margin: '4px 0'
                }}>GOMUKH DIAMOND</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: '64px', 
            marginBottom: '20px',
            opacity: 0.5
          }}>📊</div>
          <div style={{ 
            color: '#64748b', 
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>No Employees Found</div>
          <div style={{ 
            color: '#94a3b8', 
            fontSize: '14px'
          }}>No employees found for the selected criteria.</div>
        </div>
      )}
    </div>
  );
};

export default SalaryReport;











