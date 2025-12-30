import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const DiamondPrices = () => {
  const [prices, setPrices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [filterDept, setFilterDept] = useState('');
  const [formData, setFormData] = useState({
    category: '',
    price: '',
    department: '',
    subDepartment: '',
    isDefault: false
  });

  useEffect(() => {
    fetchDepartments();
    fetchPrices();
    initializeDefaults();
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [filterDept]);

  const initializeDefaults = async () => {
    try {
      const response = await api.get('/diamond-prices');
      if (response.data.prices.length === 0) {
        await api.post('/diamond-prices/initialize');
        fetchPrices();
      }
    } catch (error) {
      // Ignore if already initialized
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      toast.error('Failed to fetch departments');
    }
  };

  const fetchPrices = async () => {
    try {
      const params = new URLSearchParams();
      if (filterDept) params.append('department', filterDept);

      const response = await api.get(`/diamond-prices?${params.toString()}`);
      setPrices(response.data.prices);
    } catch (error) {
      toast.error('Failed to fetch diamond prices');
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
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      department: formData.department || null,
      subDepartment: formData.subDepartment || null
    };

    try {
      if (editingPrice) {
        await api.put(`/diamond-prices/${editingPrice._id}`, data);
        toast.success('Diamond price updated successfully');
      } else {
        await api.post('/diamond-prices', data);
        toast.success('Diamond price created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchPrices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save diamond price');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this diamond price?')) return;
    
    try {
      await api.delete(`/diamond-prices/${id}`);
      toast.success('Diamond price deleted successfully');
      fetchPrices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete diamond price');
    }
  };

  const openEditModal = (price) => {
    setEditingPrice(price);
    setFormData({
      category: price.category,
      price: price.price,
      department: price.department?._id || price.department || '',
      subDepartment: price.subDepartment || '',
      isDefault: price.isDefault || false
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      category: '',
      price: '',
      department: '',
      subDepartment: '',
      isDefault: false
    });
    setEditingPrice(null);
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
          <span>💎</span>
          Diamond Prices
        </h1>
        <button 
          className="btn btn-primary" 
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <span>+</span>
          <span>Add Diamond Price</span>
        </button>
      </div>

      {/* Filter */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Filter by Department</label>
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept._id}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Prices Table */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Price</th>
              <th>Department</th>
              <th>Sub-Department</th>
              <th>Default</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prices.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No diamond prices found</td>
              </tr>
            ) : (
              prices.map((price) => (
                <tr key={price._id}>
                  <td><strong>{price.category}</strong></td>
                  <td>₹{price.price}</td>
                  <td>{price.department?.name || 'Default'}</td>
                  <td>{price.subDepartment || '-'}</td>
                  <td>{price.isDefault ? 'Yes' : 'No'}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => openEditModal(price)} style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(price._id)} style={{ padding: '5px 10px', fontSize: '12px' }}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Price Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px', position: 'relative' }}>
            <button onClick={() => { setShowModal(false); resetForm(); }} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
            <h2>{editingPrice ? 'Edit Diamond Price' : 'Add Diamond Price'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category *</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} required placeholder="A, B, C, D, etc." style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="form-group">
                <label>Price (₹) *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label>Department (Optional - leave empty for default)</label>
                <select name="department" value={formData.department} onChange={handleChange}>
                  <option value="">Default (All Departments)</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              {formData.department && (
                <div className="form-group">
                  <label>Sub-Department (Optional)</label>
                  <select name="subDepartment" value={formData.subDepartment} onChange={handleChange}>
                    <option value="">All Sub-Departments</option>
                    {getSubDepartments().map(sub => (
                      <option key={sub._id} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} />
                  Set as Default for this Category
                </label>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {editingPrice ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiamondPrices;


