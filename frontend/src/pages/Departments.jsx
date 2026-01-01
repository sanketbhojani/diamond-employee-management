import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [subDeptName, setSubDeptName] = useState('');
  const [editingSubDept, setEditingSubDept] = useState(null);
  const [managerSearch, setManagerSearch] = useState('');
  const [selectedManager, setSelectedManager] = useState(null);

  // Predefined department suggestions (optional)
  const departmentSuggestions = ['Deepak', 'Laser', 'Galaxy', 'R Galaxy', 'Russian', 'Sarin', '4P'];

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      const employeesList = response.data.employees || [];
      console.log('Fetched employees:', employeesList.length);
      // Ensure all employees have valid IDs and departments
      const validEmployees = employeesList.filter(emp => 
        emp && emp._id && emp.department && (emp.isActive !== false)
      );
      console.log('Valid employees:', validEmployees.length);
      setEmployees(validEmployees);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast.error('Failed to fetch employees. Please refresh the page.');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      const depts = response.data.departments || [];
      console.log('Fetched departments:', depts.length);
      // Ensure all departments have valid IDs
      const validDepts = depts.filter(dept => dept && dept._id);
      setDepartments(validDepts);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to fetch departments. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/departments', formData);
      toast.success('Department created successfully');
      setShowModal(false);
      setFormData({ name: '' });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create department');
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/departments/${editingDept._id}`, formData);
      toast.success('Department updated successfully');
      setShowModal(false);
      setEditingDept(null);
      setFormData({ name: '' });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update department');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete department');
    }
  };

  const handleAddSubDept = async () => {
    try {
      await api.post(`/departments/${selectedDept._id}/subdepartments`, { name: subDeptName });
      toast.success('Sub-department added successfully');
      setShowSubModal(false);
      setSubDeptName('');
      setSelectedDept(null);
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add sub-department');
    }
  };

  const handleUpdateSubDept = async () => {
    try {
      await api.put(`/departments/${selectedDept._id}/subdepartments/${editingSubDept._id}`, { name: subDeptName });
      toast.success('Sub-department updated successfully');
      setShowSubModal(false);
      setSubDeptName('');
      setSelectedDept(null);
      setEditingSubDept(null);
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update sub-department');
    }
  };

  const handleDeleteSubDept = async (deptId, subId) => {
    if (!window.confirm('Are you sure you want to delete this sub-department?')) return;
    
    try {
      await api.delete(`/departments/${deptId}/subdepartments/${subId}`);
      toast.success('Sub-department deleted successfully');
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete sub-department');
    }
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({ name: dept.name });
    setShowModal(true);
  };

  const openSubDeptModal = (dept, subDept = null) => {
    setSelectedDept(dept);
    setEditingSubDept(subDept);
    setSubDeptName(subDept ? subDept.name : '');
    setShowSubModal(true);
  };

  const openManagerModal = (dept) => {
    console.log('Opening manager modal for department:', dept);
    setSelectedDept(dept);
    // Set current manager if exists - normalize to string ID
    const currentManagerId = dept.manager?._id || dept.manager || null;
    const normalizedManagerId = currentManagerId ? (currentManagerId.toString ? currentManagerId.toString() : String(currentManagerId)) : null;
    setSelectedManager(normalizedManagerId);
    setManagerSearch('');
    setShowManagerModal(true);
    
    // Ensure employees are loaded
    if (employees.length === 0) {
      console.log('No employees loaded, fetching...');
      fetchEmployees();
    } else {
      console.log('Employees already loaded:', employees.length);
    }
  };

  const handleAssignManager = async () => {
    if (!selectedDept) {
      toast.error('Please select a department');
      return;
    }
    
    // Validate department ID
    if (!selectedDept._id) {
      toast.error('Invalid department. Please refresh the page and try again.');
      return;
    }
    
    try {
      // Prepare payload - send null if no manager selected, otherwise send the manager ID
      // selectedManager is already a string ID at this point
      const managerId = selectedManager || null;
      // Normalize department ID to string
      const departmentId = selectedDept._id.toString ? selectedDept._id.toString() : String(selectedDept._id);
      
      // Final validation
      if (!departmentId || departmentId === 'undefined' || departmentId === 'null') {
        toast.error('Invalid department ID. Please refresh the page.');
        return;
      }
      
      const payload = { managerId };
      const url = `/departments/${departmentId}/manager`;
      
      console.log('Assigning manager - Request:', { 
        url, 
        departmentId, 
        managerId,
        payload,
        selectedDept,
        selectedManager
      });
      
      const response = await api.put(url, payload);
      
      console.log('Manager assignment - Success:', response.data);
      
      toast.success(response.data.message || (selectedManager ? 'Manager assigned successfully' : 'Manager removed successfully'));
      
      // Close modal and reset state
      setShowManagerModal(false);
      setSelectedDept(null);
      setSelectedManager(null);
      setManagerSearch('');
      
      // Refresh departments to show updated manager
      await fetchDepartments();
    } catch (error) {
      console.error('Error assigning manager:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        requestData: error.config?.data
      });
      
      // Show user-friendly error message
      let errorMessage = 'Failed to assign manager';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      const statusCode = error.response?.status;
      if (statusCode === 404) {
        errorMessage = 'Department or employee not found. Please refresh and try again.';
      } else if (statusCode === 400) {
        errorMessage = error.response?.data?.message || 'Invalid request. Please check the selected employee belongs to this department.';
      } else if (statusCode === 401) {
        errorMessage = 'You are not authorized. Please login again.';
      } else if (statusCode === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      toast.error(errorMessage);
    }
  };

  const getFilteredEmployees = () => {
    if (!selectedDept) {
      console.log('getFilteredEmployees: No selected department');
      return [];
    }
    
    // Compare department IDs properly (handle both ObjectId and string)
    const deptId = selectedDept._id?.toString() || selectedDept._id;
    console.log('getFilteredEmployees: Filtering for department ID:', deptId, 'Total employees:', employees.length);
    
    const deptEmployees = employees.filter(emp => {
      // Handle both populated and non-populated department
      let empDeptId;
      if (emp.department && typeof emp.department === 'object' && emp.department._id) {
        // Department is populated
        empDeptId = emp.department._id.toString();
      } else if (emp.department && typeof emp.department === 'object' && !emp.department._id) {
        // Department is ObjectId directly
        empDeptId = emp.department.toString();
      } else {
        // Department is ObjectId or string
        empDeptId = emp.department?.toString() || emp.department;
      }
      
      const matches = empDeptId === deptId && emp.isActive !== false;
      if (matches) {
        console.log('Employee matches:', emp.name, 'Dept ID:', empDeptId, '===', deptId);
      }
      return matches;
    });
    
    console.log('getFilteredEmployees: Found', deptEmployees.length, 'employees in department');
    
    if (!managerSearch) return deptEmployees;
    
    const searchLower = managerSearch.toLowerCase();
    const searched = deptEmployees.filter(emp => 
      (emp.name || '').toLowerCase().includes(searchLower) ||
      (emp.employeeId || '').toLowerCase().includes(searchLower) ||
      (emp.email || '').toLowerCase().includes(searchLower)
    );
    console.log('getFilteredEmployees: After search,', searched.length, 'employees');
    return searched;
  };

  if (loading) {
    return (
      <div className="loading">
        <div></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
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
          <span>🏢</span>
          Departments
        </h1>
        <button 
          className="btn btn-primary" 
          onClick={() => { setEditingDept(null); setFormData({ name: '' }); setShowModal(true); }}
        >
          <span>+</span>
          <span>Add Department</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {departments.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏢</div>
            <h3 style={{ color: '#6b7280', marginBottom: '12px' }}>No Departments Found</h3>
            <p style={{ color: '#9ca3af', marginBottom: '24px' }}>Get started by creating your first department</p>
            <button 
              className="btn btn-primary" 
              onClick={() => { setEditingDept(null); setFormData({ name: '' }); setShowModal(true); }}
            >
              <span>+</span>
              <span>Add Department</span>
            </button>
          </div>
        ) : (
          departments.map((dept) => (
            <div key={dept._id} className="card" style={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '2px solid var(--border-color)'
              }}>
                <div>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '22px', 
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '4px'
                  }}>
                    {dept.name}
                  </h3>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    {dept.subDepartments?.length || 0} Sub-Department{dept.subDepartments?.length !== 1 ? 's' : ''}
                  </p>
                  <p style={{ margin: '4px 0 0 0', color: dept.manager ? '#3b82f6' : '#9ca3af', fontSize: '13px', fontWeight: '600' }}>
                    👤 Manager: {dept.manager ? `${dept.manager.name} (${dept.manager.employeeId})` : 'Not Assigned'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => openEditModal(dept)} 
                    style={{ 
                      padding: '8px 12px', 
                      fontSize: '13px',
                      minWidth: 'auto'
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDelete(dept._id)} 
                    style={{ 
                      padding: '8px 12px', 
                      fontSize: '13px',
                      minWidth: 'auto'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '16px'
                }}>
                  <strong style={{ color: '#374151', fontSize: '15px' }}>👤 Manager</strong>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => openManagerModal(dept)} 
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '12px',
                      minWidth: 'auto'
                    }}
                  >
                    {dept.manager ? 'Change' : 'Assign'}
                  </button>
                </div>
                {dept.manager ? (
                  <div style={{ 
                    padding: '12px 16px', 
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
                    borderRadius: '8px', 
                    marginBottom: '16px',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
                      {dept.manager.name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#3b82f6' }}>
                      ID: {dept.manager.employeeId || 'N/A'} | {dept.manager.email || 'N/A'}
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    padding: '12px 16px', 
                    background: '#f9fafb',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px dashed #e5e7eb',
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '13px'
                  }}>
                    No manager assigned
                  </div>
                )}
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '16px'
                }}>
                  <strong style={{ color: '#374151', fontSize: '15px' }}>📁 Sub-Departments</strong>
                  <button 
                    className="btn btn-success" 
                    onClick={() => openSubDeptModal(dept)} 
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '12px',
                      minWidth: 'auto'
                    }}
                  >
                    <span>+</span>
                    <span>Add</span>
                  </button>
                </div>
                
                {dept.subDepartments && dept.subDepartments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dept.subDepartments.map((sub) => (
                      <div 
                        key={sub._id} 
                        style={{ 
                          padding: '12px 16px', 
                          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                          borderRadius: '8px', 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          border: '1px solid rgba(0, 0, 0, 0.05)',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <span style={{ fontWeight: '500', color: '#374151' }}>{sub.name}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => openSubDeptModal(dept, sub)} 
                            style={{ 
                              padding: '4px 8px', 
                              fontSize: '11px',
                              minWidth: 'auto'
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-danger" 
                            onClick={() => handleDeleteSubDept(dept._id, sub._id)} 
                            style={{ 
                              padding: '4px 8px', 
                              fontSize: '11px',
                              minWidth: 'auto'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    padding: '24px', 
                    textAlign: 'center',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    border: '2px dashed #e5e7eb'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
                    <p style={{ color: '#9ca3af', fontStyle: 'italic', margin: 0, fontSize: '14px' }}>
                      No sub-departments yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Department Modal */}
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
          padding: '20px'
        }}>
          <div className="card" style={{ 
            width: '100%', 
            maxWidth: '480px', 
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
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
                {editingDept ? 'Edit Department' : 'Add Department'}
              </h2>
              <button 
                onClick={() => { setShowModal(false); setEditingDept(null); }} 
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
            <div className="form-group">
              <label>Department Name *</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({ name: e.target.value })} 
                required 
                placeholder="Enter department name (e.g., Deepak, Laser, Galaxy, etc.)"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  transition: 'all 0.3s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {!editingDept && formData.name === '' && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '12px', 
                  background: '#f0f9ff', 
                  borderRadius: '8px',
                  border: '1px solid #bae6fd'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#0369a1', fontWeight: '600' }}>
                    💡 Quick suggestions:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {departmentSuggestions.map(name => {
                      const exists = departments.some(dept => dept.name === name);
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setFormData({ name })}
                          disabled={exists}
                          style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            border: exists ? '1px solid #d1d5db' : '1px solid #3b82f6',
                            borderRadius: '6px',
                            background: exists ? '#f3f4f6' : '#eff6ff',
                            color: exists ? '#9ca3af' : '#1e40af',
                            cursor: exists ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => {
                            if (!exists) {
                              e.target.style.background = '#dbeafe';
                              e.target.style.transform = 'translateY(-1px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!exists) {
                              e.target.style.background = '#eff6ff';
                              e.target.style.transform = 'translateY(0)';
                            }
                          }}
                        >
                          {name} {exists && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <button 
              className="btn btn-primary" 
              onClick={editingDept ? handleUpdate : handleCreate} 
              style={{ 
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              {editingDept ? 'Update Department' : 'Create Department'}
            </button>
          </div>
        </div>
      )}

      {/* Sub-Department Modal */}
      {showSubModal && selectedDept && (
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
          padding: '20px'
        }}>
          <div className="card" style={{ 
            width: '100%', 
            maxWidth: '480px', 
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
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
                {editingSubDept ? 'Edit Sub-Department' : 'Add Sub-Department'}
              </h2>
              <button 
                onClick={() => { setShowSubModal(false); setSelectedDept(null); setEditingSubDept(null); }} 
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
            <div style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Department
              </label>
              <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#1e40af' }}>
                {selectedDept.name}
              </p>
            </div>
            <div className="form-group">
              <label>Sub-Department Name *</label>
              <input 
                type="text" 
                value={subDeptName} 
                onChange={(e) => setSubDeptName(e.target.value)} 
                required 
                placeholder="Enter sub-department name"
              />
            </div>
            <button 
              className="btn btn-primary" 
              onClick={editingSubDept ? handleUpdateSubDept : handleAddSubDept} 
              style={{ 
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              {editingSubDept ? 'Update Sub-Department' : 'Create Sub-Department'}
            </button>
          </div>
        </div>
      )}

      {/* Manager Assignment Modal */}
      {showManagerModal && selectedDept && (
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
          padding: '20px'
        }}>
          <div className="card" style={{ 
            width: '100%', 
            maxWidth: '600px', 
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            maxHeight: '90vh',
            overflowY: 'auto'
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
                Assign Manager
              </h2>
              <button 
                onClick={() => { 
                  setShowManagerModal(false); 
                  setSelectedDept(null); 
                  setSelectedManager(null);
                  setManagerSearch('');
                }} 
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
            
            <div style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Department
              </label>
              <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#1e40af' }}>
                {selectedDept.name}
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Search Employee</label>
              <input 
                type="text" 
                value={managerSearch} 
                onChange={(e) => setManagerSearch(e.target.value)} 
                placeholder="Search by name, ID, or email..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  transition: 'all 0.3s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#374151' }}>
                Select Manager
              </label>
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px'
              }}>
                <div 
                  onClick={() => setSelectedManager(null)}
                  style={{
                    padding: '12px 16px',
                    marginBottom: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: selectedManager === null ? '#eff6ff' : '#ffffff',
                    border: selectedManager === null ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedManager !== null) {
                      e.currentTarget.style.background = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedManager !== null) {
                      e.currentTarget.style.background = '#ffffff';
                    }
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>No Manager</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Remove current manager</div>
                </div>
                {getFilteredEmployees().map(emp => {
                  const empIdStr = emp._id ? (emp._id.toString ? emp._id.toString() : String(emp._id)) : '';
                  const isSelected = selectedManager && selectedManager.toString() === empIdStr;
                  
                  return (
                  <div 
                    key={emp._id}
                    onClick={() => {
                      console.log('Selecting manager:', emp);
                      setSelectedManager(empIdStr);
                    }}
                    style={{
                      padding: '12px 16px',
                      marginBottom: '8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#ffffff';
                      }
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                      {emp.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      ID: {emp.employeeId} | {emp.email}
                    </div>
                  </div>
                  );
                })}
                {getFilteredEmployees().length === 0 && (
                  <div style={{ 
                    padding: '24px', 
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '14px'
                  }}>
                    {employees.length === 0 
                      ? 'Loading employees...' 
                      : `No employees found in this department. Total employees: ${employees.length}`}
                  </div>
                )}
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAssignManager();
              }}
              disabled={!selectedDept}
              style={{ 
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: selectedDept ? 'pointer' : 'not-allowed',
                opacity: selectedDept ? 1 : 0.6
              }}
            >
              {selectedManager ? 'Assign Manager' : 'Remove Manager'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;


