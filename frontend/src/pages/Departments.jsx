import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [subDeptName, setSubDeptName] = useState('');
  const [editingSubDept, setEditingSubDept] = useState(null);

  const departmentNames = ['4P', 'Auto', 'Galaxy', 'Laser', 'Sarin', 'Russian'];

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      toast.error('Failed to fetch departments');
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
                    ✏️
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
                    🗑️
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
                            ✏️
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
                            🗑️
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
                {editingDept ? '✏️ Edit Department' : '➕ Add Department'}
              </h2>
              <button 
                onClick={() => { setShowModal(false); setEditingDept(null); }} 
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
            <div className="form-group">
              <label>Department Name *</label>
              <select value={formData.name} onChange={(e) => setFormData({ name: e.target.value })} required>
                <option value="">Select Department</option>
                {departmentNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
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
              {editingDept ? (
                <>
                  <span>💾</span>
                  <span>Update Department</span>
                </>
              ) : (
                <>
                  <span>➕</span>
                  <span>Create Department</span>
                </>
              )}
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
                {editingSubDept ? '✏️ Edit Sub-Department' : '➕ Add Sub-Department'}
              </h2>
              <button 
                onClick={() => { setShowSubModal(false); setSelectedDept(null); setEditingSubDept(null); }} 
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
              {editingSubDept ? (
                <>
                  <span>💾</span>
                  <span>Update Sub-Department</span>
                </>
              ) : (
                <>
                  <span>➕</span>
                  <span>Create Sub-Department</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;


