import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const DiamondEntries = () => {
  const [entries, setEntries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [diamondPrices, setDiamondPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSubDepartment, setSelectedSubDepartment] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryRows, setEntryRows] = useState([{ category: '', quantity: '', price: '' }]);
  const [filterEmployee, setFilterEmployee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchEntries();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchDiamondPrices();
      fetchEmployeesByDeptAndSubDept();
    } else {
      setEmployees([]);
      setDiamondPrices([]);
    }
  }, [selectedDepartment, selectedSubDepartment]);

  useEffect(() => {
    fetchEntries();
  }, [filterEmployee, startDate, endDate, selectedDepartment]);

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

  const fetchDiamondPrices = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDepartment) params.append('department', selectedDepartment);
      const response = await api.get(`/diamond-prices?${params.toString()}`);
      
      // Get unique categories with prices (prefer department-specific, fallback to default)
      const pricesMap = new Map();
      
      // First add default prices
      response.data.prices.filter(p => p.isDefault).forEach(price => {
        if (!pricesMap.has(price.category)) {
          pricesMap.set(price.category, price);
        }
      });
      
      // Then add department-specific prices (overrides defaults)
      response.data.prices.filter(p => p.department && !p.isDefault).forEach(price => {
        pricesMap.set(price.category, price);
      });
      
      setDiamondPrices(Array.from(pricesMap.values()));
      
      // Auto-populate entry rows with available categories
      if (entryRows.length === 1 && entryRows[0].category === '') {
        const categories = Array.from(pricesMap.keys());
        if (categories.length > 0) {
          setEntryRows(categories.map(cat => ({
            category: cat,
            quantity: '',
            price: pricesMap.get(cat).price
          })));
        }
      } else {
        // Update prices for existing categories
        setEntryRows(prev => prev.map(row => {
          const priceObj = pricesMap.get(row.category);
          return {
            ...row,
            price: priceObj ? priceObj.price : row.price
          };
        }));
      }
    } catch (error) {
      toast.error('Failed to fetch diamond prices');
    }
  };

  const fetchEmployeesByDeptAndSubDept = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (selectedSubDepartment) params.append('subDepartment', selectedSubDepartment);
      
      const response = await api.get(`/employees?${params.toString()}`);
      const chutakEmployees = response.data.employees.filter(emp => emp.employeeType === 'Chutak');
      setEmployees(chutakEmployees);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const fetchEntries = async () => {
    try {
      const params = new URLSearchParams();
      if (filterEmployee) params.append('employee', filterEmployee);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedDepartment) params.append('department', selectedDepartment);

      const response = await api.get(`/diamond-entries?${params.toString()}`);
      setEntries(response.data.entries);
    } catch (error) {
      toast.error('Failed to fetch diamond entries');
    }
  };

  const getSubDepartments = () => {
    if (!selectedDepartment) return [];
    const dept = departments.find(d => d._id === selectedDepartment);
    return dept ? (dept.subDepartments || []) : [];
  };

  const filteredEmployees = employees.filter(emp =>
    !employeeSearch || 
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.email.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const handleAddRow = () => {
    setEntryRows([...entryRows, { category: '', quantity: '', price: '' }]);
  };

  const handleRemoveRow = (index) => {
    if (entryRows.length > 1) {
      setEntryRows(entryRows.filter((_, i) => i !== index));
    }
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...entryRows];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-fetch price when category changes
    if (field === 'category' && value) {
      const priceObj = diamondPrices.find(p => p.category === value.toUpperCase());
      if (priceObj) {
        updated[index].price = priceObj.price;
      }
    }
    
    setEntryRows(updated);
  };

  const calculateDailySalary = (quantity, price) => {
    const qty = parseFloat(quantity) || 0;
    const prc = parseFloat(price) || 0;
    return qty * prc;
  };

  const calculateTotalDailySalary = () => {
    return entryRows.reduce((sum, row) => {
      return sum + calculateDailySalary(row.quantity, row.price);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    if (!selectedDepartment || !selectedSubDepartment) {
      toast.error('Please select department and sub-department');
      return;
    }

    // Filter out empty rows
    const validRows = entryRows.filter(row => row.category && row.quantity && row.price);
    
    if (validRows.length === 0) {
      toast.error('Please add at least one diamond entry');
      return;
    }

    try {
      // Create entries for each row
      const promises = validRows.map(row => 
        api.post('/diamond-entries', {
          employee: selectedEmployee,
          date: entryDate,
          category: row.category.toUpperCase(),
          quantity: parseFloat(row.quantity)
        })
      );

      await Promise.all(promises);
      toast.success(`${validRows.length} diamond entry/entries created successfully`);
      setShowModal(false);
      resetForm();
      fetchEntries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save diamond entries');
    }
  };

  const resetForm = () => {
    setSelectedEmployee('');
    setEntryDate(new Date().toISOString().split('T')[0]);
    setEntryRows([{ category: '', quantity: '', price: '' }]);
    setEmployeeSearch('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await api.delete(`/diamond-entries/${id}`);
      toast.success('Diamond entry deleted successfully');
      fetchEntries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete entry');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 m-0 flex items-center gap-3">
          <span>📝</span>
          Diamond Entries
        </h1>
        <button 
          className="btn btn-primary" 
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <span>+</span>
          <span>Add Diamond Entry</span>
        </button>
      </div>

      {/* Department & Sub-Department Selection */}
      <div className="card mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="form-group mb-0">
            <label>Select Department</label>
            <select 
              value={selectedDepartment} 
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedSubDepartment('');
                fetchEntries();
              }}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
          {selectedDepartment && (
            <div className="form-group mb-0">
              <label>Select Sub-Department</label>
              <select 
                value={selectedSubDepartment} 
                onChange={(e) => {
                  setSelectedSubDepartment(e.target.value);
                }}
              >
                <option value="">All Sub-Departments</option>
                {getSubDepartments().map(sub => (
                  <option key={sub._id} value={sub.name}>{sub.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Diamond Prices Display */}
      {selectedDepartment && diamondPrices.length > 0 && (
        <div className="card mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/50">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">💎</span>
            <h3 className="m-0 text-xl font-semibold text-gray-800">
              Diamond Prices for {departments.find(d => d._id === selectedDepartment)?.name}
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {diamondPrices.map((price, index) => (
              <div 
                key={index} 
                className="p-4 bg-white rounded-xl border-2 border-green-300/30 shadow-sm transition-all duration-200 text-center hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="font-bold text-xl text-gray-800 mb-2">
                  {price.category}
                </div>
                <div className="text-green-600 text-lg font-semibold">
                  ₹{parseFloat(price.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group mb-0">
            <label>Filter by Employee</label>
            <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)}>
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>
              ))}
            </select>
          </div>
          <div className="form-group mb-0">
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="form-group mb-0">
            <label>End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Entries Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="m-0 text-lg font-semibold">
            Diamond Entries ({entries.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table m-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Sub-Dept</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price/Unit</th>
                <th>Daily Salary</th>
                <th>Gross Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-10 px-5">
                    <div className="text-5xl mb-4">📝</div>
                    <div className="text-gray-500 text-base">No entries found</div>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const employeeGrossSalary = entry.employee?.grossSalary || 0;
                  return (
                    <tr key={entry._id}>
                      <td>{new Date(entry.date).toLocaleDateString()}</td>
                      <td>{entry.employee?.name || 'N/A'} ({entry.employee?.employeeId || 'N/A'})</td>
                      <td>{entry.employee?.department?.name || 'N/A'}</td>
                      <td>{entry.employee?.subDepartment || 'N/A'}</td>
                      <td><strong>{entry.category}</strong></td>
                      <td>{entry.quantity}</td>
                      <td>₹{entry.diamondPrice?.toFixed(2) || '0.00'}</td>
                      <td>₹{entry.dailySalary?.toFixed(2) || '0.00'}</td>
                      <td>₹{employeeGrossSalary.toFixed(2)}</td>
                      <td>
                        <button 
                          className="btn btn-danger px-3 py-1.5 text-xs min-w-0"
                          onClick={() => handleDelete(entry._id)} 
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[2000] overflow-y-auto p-5">
          <div className="card w-full max-w-4xl relative mx-auto max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
              <h2 className="m-0 text-2xl font-bold">
                📝 Add Diamond Entry
              </h2>
              <button 
                onClick={() => { setShowModal(false); resetForm(); }} 
                className="bg-gray-100 border-none text-2xl cursor-pointer w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1">
              <div className="max-h-[calc(90vh-180px)] overflow-y-auto pr-2 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="form-group">
                    <label>Department *</label>
                    <select 
                      value={selectedDepartment} 
                      onChange={(e) => {
                        setSelectedDepartment(e.target.value);
                        setSelectedSubDepartment('');
                      }}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedDepartment && (
                    <div className="form-group">
                      <label>Sub-Department *</label>
                      <select 
                        value={selectedSubDepartment} 
                        onChange={(e) => setSelectedSubDepartment(e.target.value)}
                        required
                      >
                        <option value="">Select Sub-Department</option>
                        {getSubDepartments().map(sub => (
                          <option key={sub._id} value={sub.name}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedSubDepartment && (
                    <>
                      <div className="form-group">
                        <label>Search Employee</label>
                        <input
                          type="text"
                          placeholder="Search by name, ID, or email..."
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Select Employee *</label>
                        <select 
                          value={selectedEmployee} 
                          onChange={(e) => setSelectedEmployee(e.target.value)}
                          required
                        >
                          <option value="">Select Employee</option>
                          {filteredEmployees.length === 0 ? (
                            <option disabled>No Chutak employees found</option>
                          ) : (
                            filteredEmployees.map(emp => (
                              <option key={emp._id} value={emp._id}>
                                {emp.name} ({emp.employeeId})
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label>Date *</label>
                    <input 
                      type="date" 
                      value={entryDate} 
                      onChange={(e) => setEntryDate(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                {/* Diamond Prices Reference */}
                {selectedDepartment && diamondPrices.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl mb-6 border-2 border-green-200/50">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">💎</span>
                      <strong className="text-base text-gray-800">
                        Available Diamond Prices
                      </strong>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {diamondPrices.map((price, index) => (
                        <span 
                          key={index} 
                          className="px-4 py-2 bg-white rounded-lg border border-green-300/30 font-semibold text-green-600 text-sm shadow-sm"
                        >
                          {price.category}: ₹{parseFloat(price.price).toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Entry Table */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="m-0 text-lg font-semibold">
                      Diamond Entries
                    </h3>
                    <button 
                      type="button" 
                      className="btn btn-secondary px-4 py-2 text-sm"
                      onClick={handleAddRow} 
                    >
                      <span>+</span>
                      <span>Add Row</span>
                    </button>
                  </div>
                  <table className="table mb-4">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Price (₹)</th>
                        <th>Daily Salary</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entryRows.map((row, index) => (
                        <tr key={index}>
                          <td>
                            <select
                              value={row.category}
                              onChange={(e) => handleRowChange(index, 'category', e.target.value)}
                              required
                              className="w-full p-1.5"
                            >
                              <option value="">Select Category</option>
                              {diamondPrices.map(price => (
                                <option key={price._id || price.category} value={price.category}>
                                  {price.category}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              value={row.quantity}
                              onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
                              placeholder="Qty"
                              min="0"
                              step="0.01"
                              required
                              className="w-full p-1.5"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={row.price}
                              onChange={(e) => handleRowChange(index, 'price', e.target.value)}
                              placeholder="Price"
                              min="0"
                              step="0.01"
                              required
                              className="w-full p-1.5"
                            />
                          </td>
                          <td>
                            ₹{calculateDailySalary(row.quantity, row.price).toFixed(2)}
                          </td>
                          <td>
                            {entryRows.length > 1 && (
                              <button 
                                type="button" 
                                className="btn btn-danger px-2 py-1 text-xs"
                                onClick={() => handleRemoveRow(index)}
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gradient-to-r from-green-500 to-green-600 font-bold text-white">
                        <td colSpan="3" className="text-right text-base">
                          Total Daily Salary:
                        </td>
                        <td className="text-lg">
                          ₹{calculateTotalDailySalary().toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div className="pt-5 border-t-2 border-gray-200 mt-auto">
                <button 
                  type="submit" 
                  className="btn btn-primary w-full py-3.5 text-base font-semibold"
                >
                  <span>💾</span>
                  <span>Save Entries</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiamondEntries;
