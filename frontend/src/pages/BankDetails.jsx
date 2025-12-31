import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const BankDetails = () => {
  const [bankDetails, setBankDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [formData, setFormData] = useState({
    companyName: 'GOMUKH DIAMOND',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    accountHolderName: '',
    amount: '0'
  });

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const response = await api.get('/bank-details');
      setBankDetails(response.data.bankDetails);
    } catch (error) {
      toast.error('Failed to fetch bank details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingBank) {
        await api.put(`/bank-details/${editingBank._id}`, formData);
        toast.success('Bank detail updated successfully');
      } else {
        await api.post('/bank-details', formData);
        toast.success('Bank detail created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchBankDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save bank detail');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bank detail?')) return;
    
    try {
      await api.delete(`/bank-details/${id}`);
      toast.success('Bank detail deleted successfully');
      fetchBankDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete bank detail');
    }
  };

  const openEditModal = (bank) => {
    setEditingBank(bank);
    setFormData({
      companyName: bank.companyName || 'GOMUKH DIAMOND',
      accountNumber: bank.accountNumber,
      ifscCode: bank.ifscCode,
      bankName: bank.bankName,
      branchName: bank.branchName,
      accountHolderName: bank.accountHolderName,
      amount: bank.amount || 0
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      companyName: 'GOMUKH DIAMOND',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      branchName: '',
      accountHolderName: '',
      amount: '0'
    });
    setEditingBank(null);
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
          <span>🏦</span>
          Bank Details
        </h1>
        <button 
          className="btn btn-primary" 
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <span>+</span>
          <span>Add Bank Detail</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
        {bankDetails.length === 0 ? (
          <div className="card">
            <p style={{ textAlign: 'center', color: '#999' }}>No bank details found</p>
          </div>
        ) : (
          bankDetails.map((bank) => (
            <div key={bank._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>{bank.companyName}</h3>
                <div>
                  <button className="btn btn-secondary" onClick={() => openEditModal(bank)} style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(bank._id)} style={{ padding: '5px 10px', fontSize: '12px' }}>Delete</button>
                </div>
              </div>
              <div>
                <p><strong>Account Number:</strong> {bank.accountNumber}</p>
                <p><strong>IFSC Code:</strong> {bank.ifscCode}</p>
                <p><strong>Bank Name:</strong> {bank.bankName}</p>
                <p><strong>Branch Name:</strong> {bank.branchName}</p>
                <p><strong>Account Holder:</strong> {bank.accountHolderName}</p>
                <p><strong>Amount:</strong> ₹{parseFloat(bank.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bank Detail Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px', position: 'relative' }}>
            <button onClick={() => { setShowModal(false); resetForm(); }} style={{ position: 'absolute', top: '10px', right: '10px', background: '#f3f4f6', border: 'none', fontSize: '14px', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px', fontWeight: '500', color: '#6b7280' }}>Close</button>
            <h2>{editingBank ? 'Edit Bank Detail' : 'Add Bank Detail'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Company Name *</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Account Number *</label>
                <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>IFSC Code *</label>
                <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} required style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="form-group">
                <label>Bank Name *</label>
                <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Branch Name *</label>
                <input type="text" name="branchName" value={formData.branchName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Account Holder Name *</label>
                <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} min="0" step="0.01" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {editingBank ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankDetails;

