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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
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
    const { name, value } = e.target;
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
      setFormData({ ...formData, [name]: value });
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
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
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
      <div className="card" style={{ marginBottom: '24px' }}>
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
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Employee List ({employees.length})
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Department</th>
                <th>Sub-Dept</th>
                <th>Type</th>
                <th>Net Salary</th>
                <th>Advanced</th>
                <th>PF</th>
                <th>PT</th>
                <th>Gross</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="13" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                    <div style={{ color: '#6b7280', fontSize: '16px' }}>No employees found</div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id}>
                    <td><strong>{emp.employeeId}</strong></td>
                    <td>{emp.name}</td>
                    <td style={{ fontSize: '14px' }}>{emp.email}</td>
                    <td>{emp.mobile}</td>
                    <td>{emp.department?.name || 'N/A'}</td>
                    <td>{emp.subDepartment}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: emp.employeeType === 'Fix' ? '#dcfce7' : '#fef3c7',
                        color: emp.employeeType === 'Fix' ? '#166534' : '#92400e'
                      }}>
                        {emp.employeeType}
                      </span>
                    </td>
                    <td><strong>₹{emp.netSalary?.toFixed(2) || '0.00'}</strong></td>
                    <td>₹{emp.advancedSalary?.toFixed(2) || '0.00'}</td>
                    <td>₹{emp.pf?.toFixed(2) || '0.00'}</td>
                    <td>₹{emp.pt?.toFixed(2) || '0.00'}</td>
                    <td>₹{emp.grossSalary?.toFixed(2) || '0.00'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => openEditModal(emp)} 
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px',
                            minWidth: 'auto'
                          }}
                        >
                          ✏️
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
                              link.setAttribute('download', `Salary_Invoice_${emp.employeeId}.pdf`);
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                              toast.success('Salary invoice generated successfully');
                            } catch (error) {
                              toast.error('Failed to generate invoice');
                            }
                          }} 
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px',
                            minWidth: 'auto'
                          }}
                        >
                          📄
                        </button>
                        <button 
                          className="btn btn-danger" 
                          onClick={() => handleDelete(emp._id)} 
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px',
                            minWidth: 'auto'
                          }}
                        >
                          🗑️
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
                {editingEmployee ? '✏️ Edit Employee' : '➕ Add Employee'}
              </h2>
              <button 
                onClick={() => { setShowModal(false); resetForm(); }} 
                style={{ 
                  background: '#f3f4f6',
                  border: 'none', 
                  fontSize: '24px', 
                  cursor: 'pointer',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  color: '#6b7280'
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
                ×
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
                  {editingEmployee ? (
                    <>
                      <span>💾</span>
                      <span>Update Employee</span>
                    </>
                  ) : (
                    <>
                      <span>➕</span>
                      <span>Create Employee</span>
                    </>
                  )}
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

