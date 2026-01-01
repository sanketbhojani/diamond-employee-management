import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterSubDept, setFilterSubDept] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024 && window.innerWidth > 768);
    };
    
    // Initialize on mount
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    mobile: '',
    department: '',
    subDepartment: '',
    employeeType: 'Fix',
    salaryType: 'bank',
    salary: '',
    advancedSalary: '0',
    pf: '0',
    pt: '0',
    aadhar: '',
    pan: '',
    isManager: false,
    hasSpecialPermissions: false,
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      branchName: ''
    }
  });

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, filterDept, filterSubDept]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      toast.error('Failed to fetch departments');
    }
  };

  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterDept) params.append('department', filterDept);
      if (filterSubDept) params.append('subDepartment', filterSubDept);

      const response = await api.get(`/employees?${params.toString()}`);
      setEmployees(response.data.employees);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const getSubDepartments = () => {
    if (!formData.department) return [];
    const dept = departments.find(d => d._id === formData.department);
    return dept ? (dept.subDepartments || []) : [];
  };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('bankDetails.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        bankDetails: {
          ...formData.bankDetails,
          [field]: value
        }
      });
    } else {
      // Handle checkbox inputs
      const newFormData = { 
        ...formData, 
        [name]: type === 'checkbox' ? checked : value 
      };
      
      // If department changes, reset subDepartment
      if (name === 'department') {
        newFormData.subDepartment = '';
      }
      
      setFormData(newFormData);
    }
  };

  const calculateNetSalary = () => {
    const salary = parseFloat(formData.salary) || 0;
    const advanced = parseFloat(formData.advancedSalary) || 0;
    const pf = parseFloat(formData.pf) || 0;
    const pt = parseFloat(formData.pt) || 0;
    return salary - advanced - pf - pt;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...formData };
    data.salary = parseFloat(data.salary);
    data.advancedSalary = parseFloat(data.advancedSalary || 0);
    data.pf = parseFloat(data.pf || 0);
    data.pt = parseFloat(data.pt || 0);
    data.netSalary = calculateNetSalary();
    data.grossSalary = data.salary;

    // If salary type is cash, remove bank details
    if (data.salaryType === 'cash') {
      data.bankDetails = {};
    }

    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee._id}`, data);
        toast.success('Employee updated successfully');
      } else {
        await api.post('/employees', data);
        toast.success('Employee created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save employee');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      mobile: employee.mobile,
      department: employee.department._id || employee.department,
      subDepartment: employee.subDepartment,
      employeeType: employee.employeeType,
      salaryType: employee.salaryType || 'bank',
      salary: employee.salary,
      advancedSalary: employee.advancedSalary || 0,
      pf: employee.pf || 0,
      pt: employee.pt || 0,
      aadhar: employee.aadhar,
      pan: employee.pan,
      isManager: employee.isManager || false,
      hasSpecialPermissions: employee.hasSpecialPermissions || false,
      bankDetails: employee.bankDetails || {
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: ''
      }
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      name: '',
      email: '',
      mobile: '',
      department: '',
      subDepartment: '',
      employeeType: 'Fix',
      salaryType: 'bank',
      salary: '',
      advancedSalary: '0',
      pf: '0',
      pt: '0',
      aadhar: '',
      pan: '',
      isManager: false,
      hasSpecialPermissions: false,
      bankDetails: {
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: ''
      }
    });
    setEditingEmployee(null);
  };

  if (loading) return (
    <div className="loading">
      <div></div>
    </div>
  );

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        padding: '0 20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <h1 style={{ 
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: '700',
          color: '#1f2937',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>👥</span>
          Employees
        </h1>
        <button 
          className="btn btn-primary" 
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{
            fontSize: '14px',
            padding: isMobile ? '10px 16px' : '12px 24px'
          }}
        >
          <span>+</span>
          <span>Add Employee</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ marginBottom: '20px', marginLeft: '20px', marginRight: '20px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px' 
        }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>🔍 Search</label>
            <input
              type="text"
              placeholder="Search by ID, name, email, mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>🏢 Filter by Department</label>
            <select value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setFilterSubDept(''); }}>
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
          {filterDept && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>📁 Filter by Sub-Department</label>
              <select value={filterSubDept} onChange={(e) => setFilterSubDept(e.target.value)}>
                <option value="">All Sub-Departments</option>
                {departments.find(d => d._id === filterDept)?.subDepartments?.map(sub => (
                  <option key={sub._id} value={sub.name}>{sub.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Employees Table */}
      <div className="card" style={{ 
        padding: 0, 
        overflow: 'hidden', 
        width: '100%', 
        maxWidth: '100%',
        marginLeft: '20px',
        marginRight: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        background: '#ffffff'
      }}>
        <div style={{ 
          padding: '24px 28px', 
          borderBottom: '2px solid #e5e7eb',
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '20px', 
              fontWeight: '700',
              color: '#1f2937',
              letterSpacing: '-0.5px'
            }}>
              Employee List
            </h3>
            <div style={{
              padding: '6px 16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: 'white',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)'
            }}>
              {employees.length} {employees.length === 1 ? 'Employee' : 'Employees'}
            </div>
          </div>
        </div>
        <div style={{ 
          width: '100%', 
          overflowX: 'hidden', 
          WebkitOverflowScrolling: 'touch', 
          background: '#ffffff',
          maxWidth: '100%'
        }}>
          <table className="table" style={{ 
            margin: 0, 
            width: '100%', 
            tableLayout: 'fixed', 
            borderCollapse: 'separate', 
            borderSpacing: 0 
          }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                <th style={{ 
                  width: isMobile ? '0' : '8%', 
                  display: isMobile ? 'none' : 'table-cell', 
                  padding: '18px 14px', 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#000000',
                  textTransform: 'none',
                  letterSpacing: '0',
                  borderBottom: '3px solid #cbd5e1'
                }}>ID</th>
                <th style={{ 
                  width: isMobile ? '25%' : '12%', 
                  padding: '18px 14px', 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#000000',
                  textTransform: 'none',
                  letterSpacing: '0',
                  borderBottom: '3px solid #cbd5e1'
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
                  borderBottom: '3px solid #cbd5e1'
                }}>Email</th>
                <th style={{ 
                  width: isMobile ? '0' : '10%', 
                  display: isMobile ? 'none' : 'table-cell', 
                  padding: '18px 14px', 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#000000',
                  textTransform: 'none',
                  letterSpacing: '0',
                  borderBottom: '3px solid #cbd5e1'
                }}>Mobile</th>
                <th style={{ 
                  width: isMobile ? '20%' : '10%', 
                  padding: '18px 14px', 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#000000',
                  textTransform: 'none',
                  letterSpacing: '0',
                  borderBottom: '3px solid #cbd5e1'
                }}>Department</th>
                <th style={{ 
                  width: isMobile || isTablet ? '0' : '8%', 
                  display: isMobile || isTablet ? 'none' : 'table-cell', 
                  padding: '18px 14px', 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#000000',
                  textTransform: 'none',
                  letterSpacing: '0',
                  borderBottom: '3px solid #cbd5e1'
                }}>Sub-Dept</th>
                <th style={{ 
                  width: isMobile ? '12%' : '8%', 
                  padding: '18px 14px', 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#000000',
                  textTransform: 'none',
                  letterSpacing: '0',
                  borderBottom: '3px solid #cbd5e1',
                  minWidth: '80px'
                }}>Type</th>
                <th style={{ 
                  width: isMobile ? '15%' : '10%', 
                  padding: '18px 14px', 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#000000',
                  textTransform: 'none',
                  letterSpacing: '0',
                  borderBottom: '3px solid #cbd5e1'
                }}>Net Salary</th>
                <th style={{ 
                  width: isMobile || isTablet ? '0' : '8%', 
                  display: isMobile || isTablet ? 'none' : 'table-cell', 
                  padding: '18px 14px', 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#000000',
                  textTransform: 'none',
                  letterSpacing: '0',
                  borderBottom: '3px solid #cbd5e1'
                }}>Advanced</th>
                <th style={{ 
                  width: isMobile || isTablet ? '0' : '6%', 
                  display: isMobile || isTablet ? 'none' : 'table-cell', 
                  padding: '18px 14px', 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#000000',
                  textTransform: 'none',
                  letterSpacing: '0',
                  borderBottom: '3px solid #cbd5e1'
                }}>PF</th>
                <th style={{ 
                  width: isMobile || isTablet ? '0' : '6%', 
                  display: isMobile || isTablet ? 'none' : 'table-cell', 
                  padding: '18px 14px', 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#000000',
                  textTransform: 'none',
                  letterSpacing: '0',
                  borderBottom: '3px solid #cbd5e1'
                }}>PT</th>
                <th style={{ 
                  width: isMobile ? '0' : '10%', 
                  display: isMobile ? 'none' : 'table-cell', 
                  padding: '18px 14px', 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#000000',
                  textTransform: 'none',
                  letterSpacing: '0',
                  borderBottom: '3px solid #cbd5e1'
                }}>Gross</th>
                <th style={{ 
                  width: isMobile ? '30%' : '15%', 
                  padding: '18px 14px', 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#000000',
                  textTransform: 'none',
                  letterSpacing: '0',
                  borderBottom: '3px solid #cbd5e1'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="13" style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    background: '#ffffff'
                  }}>
                    <div style={{ 
                      fontSize: '64px', 
                      marginBottom: '20px',
                      opacity: 0.5
                    }}>👥</div>
                    <div style={{ 
                      color: '#64748b', 
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>No Employees Found</div>
                    <div style={{ 
                      color: '#94a3b8', 
                      fontSize: '14px'
                    }}>Get started by adding your first employee</div>
                  </td>
                </tr>
              ) : (
                employees.map((emp, index) => (
                  <tr 
                    key={emp._id}
                    style={{
                      background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                      transition: 'all 0.2s ease',
                      borderBottom: '1px solid #e5e7eb'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.transform = 'scale(1.001)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
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
                    }}><strong>{emp.employeeId}</strong></td>
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
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap', 
                      display: isMobile ? 'none' : 'table-cell', 
                      padding: '16px 12px',
                      color: '#475569'
                    }} title={emp.email}>{emp.email}</td>
                    <td style={{ 
                      fontSize: '14px', 
                      display: isMobile ? 'none' : 'table-cell', 
                      padding: '16px 12px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      color: '#475569'
                    }}>{emp.mobile}</td>
                    <td style={{ 
                      fontSize: '14px', 
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
                    <td style={{ padding: '16px 12px', minWidth: '80px', textAlign: 'center' }}>
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
                      fontSize: '15px', 
                      fontWeight: '700', 
                      padding: '16px 12px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      color: '#059669'
                    }}>₹{emp.netSalary?.toFixed(2) || '0.00'}</td>
                    <td style={{ 
                      fontSize: '14px', 
                      display: isMobile || isTablet ? 'none' : 'table-cell', 
                      padding: '16px 12px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      color: '#64748b'
                    }}>₹{emp.advancedSalary?.toFixed(2) || '0.00'}</td>
                    <td style={{ 
                      fontSize: '14px', 
                      display: isMobile || isTablet ? 'none' : 'table-cell', 
                      padding: '16px 12px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      color: '#64748b'
                    }}>₹{emp.pf?.toFixed(2) || '0.00'}</td>
                    <td style={{ 
                      fontSize: '14px', 
                      display: isMobile || isTablet ? 'none' : 'table-cell', 
                      padding: '16px 12px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      color: '#64748b'
                    }}>₹{emp.pt?.toFixed(2) || '0.00'}</td>
                    <td style={{ 
                      fontSize: '15px', 
                      fontWeight: '600', 
                      display: isMobile ? 'none' : 'table-cell', 
                      padding: '16px 12px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      color: '#0369a1'
                    }}>₹{emp.grossSalary?.toFixed(2) || '0.00'}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => openEditModal(emp)} 
                          style={{ 
                            padding: '7px 14px', 
                            fontSize: '13px',
                            minWidth: 'auto',
                            borderRadius: '6px',
                            fontWeight: '600',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-primary" 
                          onClick={async () => {
                            try {
                              const response = await api.get(`/salary-transfer/receipt/${emp._id}`, {
                                responseType: 'blob'
                              });
                              const url = window.URL.createObjectURL(new Blob([response.data]));
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', `Salary_Receipt_${emp.employeeId}.pdf`);
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                              toast.success('Salary receipt generated successfully');
                            } catch (error) {
                              toast.error('Failed to generate receipt');
                            }
                          }} 
                          style={{ 
                            padding: '7px 14px', 
                            fontSize: '13px',
                            minWidth: 'auto',
                            borderRadius: '6px',
                            fontWeight: '600',
                            boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)'
                          }}
                        >
                          Receipt
                        </button>
                        <button 
                          className="btn btn-danger" 
                          onClick={() => handleDelete(emp._id)} 
                          style={{ 
                            padding: '7px 14px', 
                            fontSize: '13px',
                            minWidth: 'auto',
                            borderRadius: '6px',
                            fontWeight: '600',
                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Modal */}
      {showModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.6)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          zIndex: 2000, 
          overflowY: 'auto', 
          padding: '20px' 
        }}>
          <div className="card" style={{ 
            width: '100%', 
            maxWidth: '900px', 
            position: 'relative', 
            margin: 'auto',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid var(--border-color)'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <button 
                onClick={() => { setShowModal(false); resetForm(); }} 
                style={{ 
                  background: '#f3f4f6',
                  border: 'none', 
                  fontSize: '14px', 
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  color: '#6b7280',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e5e7eb';
                  e.target.style.color = '#1f2937';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f3f4f6';
                  e.target.style.color = '#6b7280';
                }}
              >
                Close
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ maxHeight: 'calc(90vh - 120px)', overflowY: 'auto', paddingRight: '8px' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
                gap: '20px' 
              }}>
                <div className="form-group">
                  <label>Employee ID *</label>
                  <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} required disabled={!!editingEmployee} />
                </div>
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Mobile *</label>
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <select name="department" value={formData.department} onChange={handleChange} required>
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Sub-Department *</label>
                  <select name="subDepartment" value={formData.subDepartment} onChange={handleChange} required>
                    <option value="">Select Sub-Department</option>
                    {getSubDepartments().map(sub => (
                      <option key={sub._id} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Employee Type *</label>
                  <select name="employeeType" value={formData.employeeType} onChange={handleChange} required>
                    <option value="Fix">Fix</option>
                    <option value="Chutak">Chutak</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Salary Type *</label>
                  <select name="salaryType" value={formData.salaryType} onChange={handleChange} required>
                    <option value="bank">Bank</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Salary *</label>
                  <input type="number" name="salary" value={formData.salary} onChange={handleChange} required min="0" step="0.01" />
                </div>
                <div className="form-group">
                  <label>Advanced Salary</label>
                  <input type="number" name="advancedSalary" value={formData.advancedSalary} onChange={handleChange} min="0" step="0.01" />
                </div>
                <div className="form-group">
                  <label>PF (Provident Fund)</label>
                  <input type="number" name="pf" value={formData.pf} onChange={handleChange} min="0" step="0.01" />
                </div>
                <div className="form-group">
                  <label>PT (Professional Tax)</label>
                  <input type="number" name="pt" value={formData.pt} onChange={handleChange} min="0" step="0.01" />
                </div>
                <div className="form-group">
                  <label>Net Salary</label>
                  <input type="text" value={`₹${calculateNetSalary().toFixed(2)}`} disabled style={{ background: '#f0f0f0' }} />
                </div>
                <div className="form-group">
                  <label>Aadhar * (12 digits)</label>
                  <input type="text" name="aadhar" value={formData.aadhar} onChange={handleChange} required pattern="[0-9]{12}" maxLength="12" />
                </div>
                <div className="form-group">
                  <label>PAN *</label>
                  <input type="text" name="pan" value={formData.pan} onChange={handleChange} required pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}" maxLength="10" style={{ textTransform: 'uppercase' }} />
                </div>
              </div>

              {formData.salaryType === 'bank' && (
                <div style={{ 
                  marginTop: '24px', 
                  borderTop: '2px solid var(--border-color)', 
                  paddingTop: '24px',
                  gridColumn: '1 / -1'
                }}>
                  <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>🏦 Bank Details</h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
                    gap: '20px' 
                  }}>
                    <div className="form-group">
                      <label>Account Number</label>
                      <input type="text" name="bankDetails.accountNumber" value={formData.bankDetails.accountNumber} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>IFSC Code</label>
                      <input type="text" name="bankDetails.ifscCode" value={formData.bankDetails.ifscCode} onChange={handleChange} style={{ textTransform: 'uppercase' }} />
                    </div>
                    <div className="form-group">
                      <label>Bank Name</label>
                      <input type="text" name="bankDetails.bankName" value={formData.bankDetails.bankName} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Branch Name</label>
                      <input type="text" name="bankDetails.branchName" value={formData.bankDetails.branchName} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ gridColumn: '1 / -1', marginTop: '24px', paddingTop: '20px', borderTop: '2px solid var(--border-color)' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ 
                    width: '100%', 
                    padding: '14px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  {editingEmployee ? 'Update Employee' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;

