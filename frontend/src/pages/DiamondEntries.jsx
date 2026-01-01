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
  const [editingEntry, setEditingEntry] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'employee'
  const [selectedDates, setSelectedDates] = useState([]);
  const [bulkEntryMode, setBulkEntryMode] = useState(false);
  const [bulkEntries, setBulkEntries] = useState({}); // { date: { category: quantity } }
  const [employeeViewFilter, setEmployeeViewFilter] = useState({
    search: '',
    department: '',
    subDepartment: ''
  });

  useEffect(() => {
    fetchDepartments();
    // Don't fetch entries on initial load - wait for department and sub-department selection
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
    // Only fetch entries if both department and sub-department are selected
    if (selectedDepartment && selectedSubDepartment) {
      fetchEntries();
    } else {
      // Clear entries if department or sub-department is not selected
      setEntries([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEmployee, startDate, endDate, selectedDepartment, selectedSubDepartment]);

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
      // Allow both Fix and Chutak employees to have diamond entries
      setEmployees(response.data.employees);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const fetchEntries = async () => {
    // Only fetch if both department and sub-department are selected
    if (!selectedDepartment || !selectedSubDepartment) {
      setEntries([]);
      return;
    }
    
    try {
      const params = new URLSearchParams();
      if (filterEmployee) params.append('employee', filterEmployee);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (selectedSubDepartment) params.append('subDepartment', selectedSubDepartment);

      const response = await api.get(`/diamond-entries?${params.toString()}`);
      setEntries(response.data.entries);
    } catch (error) {
      toast.error('Failed to fetch diamond entries');
    }
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Convert DD/MM/YYYY to YYYY-MM-DD for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const getSubDepartments = (deptId = null) => {
    const deptIdToUse = deptId || selectedDepartment || employeeViewFilter.department;
    if (!deptIdToUse) return [];
    const dept = departments.find(d => d._id === deptIdToUse);
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

    // Check dates
    if (bulkEntryMode) {
      if (selectedDates.length === 0) {
        toast.error('Please select at least one date');
        return;
      }
    } else {
      if (!entryDate) {
        toast.error('Please select a date');
        return;
      }
    }

    // Filter out empty rows
    const validRows = entryRows.filter(row => row.category && row.quantity && row.price);
    
    if (validRows.length === 0) {
      toast.error('Please add at least one diamond entry');
      return;
    }

    try {
      if (bulkEntryMode) {
        // Bulk entry mode - use bulkEntries data structure
        const promises = [];
        
        selectedDates.forEach(date => {
          Object.keys(bulkEntries[date] || {}).forEach(category => {
            const quantity = bulkEntries[date][category];
            if (quantity && parseFloat(quantity) > 0) {
              promises.push(
                api.post('/diamond-entries', {
                  employee: selectedEmployee,
                  date: date,
                  category: category.toUpperCase(),
                  quantity: parseFloat(quantity)
                })
              );
            }
          });
        });

        if (promises.length === 0) {
          toast.error('Please enter at least one quantity');
          return;
        }

        await Promise.all(promises);
        toast.success(`${promises.length} diamond entry/entries created successfully for ${selectedDates.length} date(s)`);
      } else {
        // Single entry mode - use entryRows
        const datesToUse = [entryDate];
        const promises = [];

        datesToUse.forEach(date => {
          validRows.forEach(row => {
            promises.push(
              api.post('/diamond-entries', {
                employee: selectedEmployee,
                date: date,
                category: row.category.toUpperCase(),
                quantity: parseFloat(row.quantity)
              })
            );
          });
        });

        await Promise.all(promises);
        toast.success(`${validRows.length} diamond entry/entries created successfully`);
      }

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
    setEditingEntry(null);
    setSelectedDates([]);
    setBulkEntryMode(false);
    setBulkEntries({});
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

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setSelectedEmployee(entry.employee._id);
    setEntryDate(formatDateForInput(entry.date));
    setEntryRows([{
      category: entry.category,
      quantity: entry.quantity.toString(),
      price: entry.diamondPrice.toString()
    }]);
    
    // Get department ID - handle both populated and unpopulated cases
    let departmentId = null;
    if (entry.employee?.department) {
      if (entry.employee.department._id) {
        // Department is populated as object
        departmentId = entry.employee.department._id.toString();
      } else if (typeof entry.employee.department === 'string') {
        // Department is just an ID string
        departmentId = entry.employee.department;
      } else if (entry.employee.department.toString) {
        // Department is an ObjectId
        departmentId = entry.employee.department.toString();
      }
    }
    
    // Set department first, which will trigger useEffect to fetch employees and prices
    if (departmentId) {
      setSelectedDepartment(departmentId);
    }
    
    // Set sub-department
    if (entry.employee?.subDepartment) {
      setSelectedSubDepartment(entry.employee.subDepartment);
    }
    
    setEmployeeSearch('');
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    if (!selectedDepartment || !selectedSubDepartment) {
      toast.error('Please select department and sub-department');
      return;
    }

    const validRows = entryRows.filter(row => row.category && row.quantity && row.price);
    
    if (validRows.length === 0) {
      toast.error('Please add at least one diamond entry');
      return;
    }

    try {
      // For update, we'll update the first row (single entry update)
      await api.put(`/diamond-entries/${editingEntry._id}`, {
        employee: selectedEmployee,
        date: entryDate,
        category: validRows[0].category.toUpperCase(),
        quantity: parseFloat(validRows[0].quantity)
      });

      toast.success('Diamond entry updated successfully');
      setShowModal(false);
      setEditingEntry(null);
      resetForm();
      fetchEntries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update diamond entry');
    }
  };

  // Group entries by employee for employee view
  // Backend already filters by department/sub-department, so entries are already filtered
  const groupEntriesByEmployee = () => {
    const grouped = {};
    entries.forEach(entry => {
      if (!entry.employee) return; // Skip entries without employee data
      
      // Apply employee filter if selected
      if (filterEmployee) {
        const entryEmpId = entry.employee._id?.toString() || entry.employee._id;
        const filterEmpId = filterEmployee.toString();
        if (entryEmpId !== filterEmpId) {
          return; // Skip entries that don't match the selected employee
        }
      }
      
      const empId = entry.employee._id;
      if (!grouped[empId]) {
        grouped[empId] = {
          employee: entry.employee,
          entries: []
        };
      }
      grouped[empId].entries.push(entry);
    });
    
    // Backend already filtered by department and sub-department
    // Employee filter is applied above
    return Object.values(grouped);
  };
  
  // Filter entries for table view - backend already filters by department/sub-department and employee
  const getFilteredEntriesForTableView = () => {
    // Backend already filters by department, sub-department, and employee
    // But let's add an extra check to ensure employee filter is applied correctly
    let filtered = entries;
    
    // If employee filter is selected, ensure only that employee's entries are shown
    if (filterEmployee) {
      filtered = filtered.filter(entry => {
        if (!entry.employee || !entry.employee._id) return false;
        const entryEmpId = entry.employee._id.toString();
        const filterEmpId = filterEmployee.toString();
        return entryEmpId === filterEmpId;
      });
    }
    
    return filtered;
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
        <div className="flex gap-3 items-center">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setViewMode('table')}
            >
              Table View
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'employee'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setViewMode('employee')}
            >
              Employee View
            </button>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => { resetForm(); setShowModal(true); }}
          >
            <span>+</span>
            <span>Add Diamond Entry</span>
          </button>
        </div>
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
                // Clear entries when department changes
                setEntries([]);
              }}
            >
              <option value="">Select Department</option>
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
                  // Entries will be fetched automatically via useEffect
                }}
              >
                <option value="">Select Sub-Department</option>
                {getSubDepartments().map(sub => (
                  <option key={sub._id} value={sub.name}>{sub.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Diamond Prices Display - Only for Table View */}
      {viewMode === 'table' && selectedDepartment && diamondPrices.length > 0 && (
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

      {/* Filters - Only show if department and sub-department are selected */}
      {selectedDepartment && selectedSubDepartment && (
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
      )}

      {/* Message when department/sub-department not selected */}
      {(!selectedDepartment || !selectedSubDepartment) && (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-4">📋</div>
          <div className="text-gray-600 text-lg font-semibold mb-2">
            Please select Department and Sub-Department to view data
          </div>
          <div className="text-gray-500 text-sm">
            Select a department and sub-department from the dropdowns above to see diamond entries
          </div>
        </div>
      )}

      {/* Entries Display - Only show if department and sub-department are selected */}
      {selectedDepartment && selectedSubDepartment && viewMode === 'table' ? (
        <div className="card p-0 overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h3 className="m-0 text-lg font-semibold">
              Diamond Entries ({getFilteredEntriesForTableView().length})
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
                {getFilteredEntriesForTableView().length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-10 px-5">
                      <div className="text-5xl mb-4">📝</div>
                      <div className="text-gray-500 text-base">No entries found</div>
                    </td>
                  </tr>
                ) : (
                  getFilteredEntriesForTableView().map((entry) => {
                    const employeeGrossSalary = entry.employee?.grossSalary || 0;
                    return (
                      <tr key={entry._id}>
                        <td>{formatDate(entry.date)}</td>
                        <td>{entry.employee?.name || 'N/A'} ({entry.employee?.employeeId || 'N/A'})</td>
                        <td>{entry.employee?.department?.name || 'N/A'}</td>
                        <td>{entry.employee?.subDepartment || 'N/A'}</td>
                        <td><strong>{entry.category}</strong></td>
                        <td>{entry.quantity}</td>
                        <td>₹{entry.diamondPrice?.toFixed(2) || '0.00'}</td>
                        <td>₹{entry.dailySalary?.toFixed(2) || '0.00'}</td>
                        <td>₹{employeeGrossSalary.toFixed(2)}</td>
                        <td>
                          <div className="flex gap-2">
                            <button 
                              className="btn btn-secondary px-3 py-1.5 text-xs min-w-0"
                              onClick={() => handleEdit(entry)} 
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-danger px-3 py-1.5 text-xs min-w-0"
                              onClick={() => handleDelete(entry._id)} 
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (selectedDepartment && selectedSubDepartment && viewMode === 'employee') ? (
        <div className="space-y-6">
          {/* Diamond Prices Display - At top of Employee View */}
          {selectedDepartment && diamondPrices.length > 0 && (
            <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/50">
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
          
          {groupEntriesByEmployee().map((group, idx) => {
            const emp = group.employee;
            const sortedEntries = [...group.entries].sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Group entries by date, then by category/price
            const entriesByDate = {};
            sortedEntries.forEach(entry => {
              const dateKey = formatDate(entry.date);
              if (!entriesByDate[dateKey]) {
                entriesByDate[dateKey] = [];
              }
              entriesByDate[dateKey].push(entry);
            });
            
            // Get all unique dates
            const dates = Object.keys(entriesByDate).sort((a, b) => {
              const dateA = new Date(a.split('/').reverse().join('-'));
              const dateB = new Date(b.split('/').reverse().join('-'));
              return dateA - dateB;
            });
            
            // Get all unique price/category combinations across all dates
            const allPriceCategories = new Set();
            sortedEntries.forEach(entry => {
              const priceKey = `${entry.category}(${entry.diamondPrice?.toFixed(2) || '0.00'})`;
              allPriceCategories.add(priceKey);
            });
            const priceCategories = Array.from(allPriceCategories).sort();
            
            return (
              <div key={idx} className="card p-0 overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <h3 className="m-0 text-xl font-bold text-gray-800">
                        {emp.name} ({emp.employeeId})
                      </h3>
                      <p className="m-0 mt-1 text-sm text-gray-600">
                        {emp.department?.name || 'N/A'} - {emp.subDepartment || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Gross Salary</div>
                      <div className="text-lg font-bold text-indigo-600">
                        ₹{(emp.grossSalary || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 overflow-x-auto">
                  {sortedEntries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No diamond entries found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Excel-like Table with Dates as Headers and Prices as Sub-headers */}
                      <div className="overflow-x-auto border-2 border-gray-400 rounded-lg bg-white">
                        <table className="w-full border-collapse" style={{ minWidth: '100%' }}>
                          <thead>
                            {/* Date Headers Row */}
                            <tr>
                              {dates.map((date, dateIdx) => {
                                const dateEntries = entriesByDate[date];
                                const uniquePrices = new Set();
                                dateEntries.forEach(e => {
                                  uniquePrices.add(`${e.category}(${e.diamondPrice?.toFixed(2) || '0.00'})`);
                                });
                                const colSpan = uniquePrices.size || 1;
                                const dayNumber = new Date(date.split('/').reverse().join('-')).getDate();
                                
                                return (
                                  <th
                                    key={dateIdx}
                                    colSpan={colSpan}
                                    className="border-2 border-gray-400 bg-blue-200 px-3 py-3 text-sm font-bold text-center align-middle"
                                    style={{ backgroundColor: '#bfdbfe', whiteSpace: 'nowrap' }}
                                  >
                                    DATE: {dayNumber}th
                                  </th>
                                );
                              })}
                            </tr>
                            {/* Price/Category Sub-headers Row */}
                            <tr>
                              {dates.map((date, dateIdx) => {
                                const dateEntries = entriesByDate[date];
                                const priceMap = new Map();
                                dateEntries.forEach(entry => {
                                  const priceKey = `${entry.category}(${entry.diamondPrice?.toFixed(2) || '0.00'})`;
                                  if (!priceMap.has(priceKey)) {
                                    priceMap.set(priceKey, entry);
                                  }
                                });
                                // Sort prices numerically by the price value
                                const sortedPrices = Array.from(priceMap.keys()).sort((a, b) => {
                                  const priceA = parseFloat(a.match(/\(([\d.]+)\)/)?.[1] || '0');
                                  const priceB = parseFloat(b.match(/\(([\d.]+)\)/)?.[1] || '0');
                                  return priceA - priceB;
                                });
                                
                                return sortedPrices.map((priceKey, priceIdx) => {
                                  const category = priceKey.split('(')[0];
                                  const price = priceKey.split('(')[1].replace(')', '');
                                  
                                  return (
                                    <th
                                      key={`${dateIdx}-${priceIdx}`}
                                      className="border-2 border-gray-400 bg-green-200 px-2 py-2 text-xs font-semibold text-center align-middle"
                                      style={{ backgroundColor: '#bbf7d0', whiteSpace: 'nowrap' }}
                                      title={`${category}(${price})`}
                                    >
                                      {price}
                                    </th>
                                  );
                                });
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {/* Quantity Row */}
                            <tr>
                              {dates.map((date, dateIdx) => {
                                const dateEntries = entriesByDate[date];
                                const priceMap = new Map();
                                dateEntries.forEach(entry => {
                                  const priceKey = `${entry.category}(${entry.diamondPrice?.toFixed(2) || '0.00'})`;
                                  if (!priceMap.has(priceKey)) {
                                    priceMap.set(priceKey, []);
                                  }
                                  priceMap.get(priceKey).push(entry);
                                });
                                // Sort prices numerically by the price value (same as headers)
                                const sortedPrices = Array.from(priceMap.keys()).sort((a, b) => {
                                  const priceA = parseFloat(a.match(/\(([\d.]+)\)/)?.[1] || '0');
                                  const priceB = parseFloat(b.match(/\(([\d.]+)\)/)?.[1] || '0');
                                  return priceA - priceB;
                                });
                                
                                return sortedPrices.map((priceKey, priceIdx) => {
                                  const entriesForPrice = priceMap.get(priceKey);
                                  const totalQuantity = entriesForPrice.reduce((sum, e) => sum + (e.quantity || 0), 0);
                                  
                                  return (
                                    <td
                                      key={`${dateIdx}-${priceIdx}`}
                                      className="border-2 border-gray-400 bg-white px-3 py-3 text-sm font-medium text-center align-middle hover:bg-green-50 transition-colors"
                                      style={{ minWidth: '60px' }}
                                    >
                                      {totalQuantity > 0 ? totalQuantity : ''}
                                    </td>
                                  );
                                });
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Salary Details Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                          <div className="text-sm text-gray-600 mb-1">Gross Salary</div>
                          <div className="text-xl font-bold text-green-600">
                            ₹{(emp.grossSalary || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                          <div className="text-sm text-gray-600 mb-1">Net Salary</div>
                          <div className="text-xl font-bold text-blue-600">
                            ₹{(emp.netSalary || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                          <div className="text-sm text-gray-600 mb-1">PF</div>
                          <div className="text-xl font-bold text-orange-600">
                            ₹{(emp.pf || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                          <div className="text-sm text-gray-600 mb-1">PT</div>
                          <div className="text-xl font-bold text-purple-600">
                            ₹{(emp.pt || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {groupEntriesByEmployee().length === 0 && (
            <div className="card p-10 text-center">
              <div className="text-5xl mb-4">📝</div>
              <div className="text-gray-500 text-base">No entries found</div>
            </div>
          )}
        </div>
      ) : null}

      {/* Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[2000] overflow-y-auto p-5">
          <div className="card w-full max-w-4xl relative mx-auto max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
              <h2 className="m-0 text-2xl font-bold">
                {editingEntry ? 'Edit Diamond Entry' : 'Add Diamond Entry'}
              </h2>
              <button 
                onClick={() => { setShowModal(false); resetForm(); }} 
                className="bg-gray-100 border-none text-sm cursor-pointer px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 text-gray-500 hover:bg-gray-200 hover:text-gray-800 font-medium"
              >
                Close
              </button>
            </div>
            <form onSubmit={editingEntry ? handleUpdate : handleSubmit} className="flex flex-col flex-1">
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
                            <option disabled>No employees found</option>
                          ) : (
                            filteredEmployees.map(emp => (
                              <option key={emp._id} value={emp._id}>
                                {emp.name} ({emp.employeeId}) - {emp.employeeType}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label>Entry Mode</label>
                    <select 
                      value={bulkEntryMode ? 'bulk' : 'single'}
                      onChange={(e) => {
                        setBulkEntryMode(e.target.value === 'bulk');
                        if (e.target.value === 'bulk') {
                          setSelectedDates([]);
                        } else {
                          setEntryDate(new Date().toISOString().split('T')[0]);
                        }
                      }}
                    >
                      <option value="single">Single Date</option>
                      <option value="bulk">Multiple Dates (Bulk Entry)</option>
                    </select>
                  </div>

                  {!bulkEntryMode ? (
                    <div className="form-group">
                      <label>Date *</label>
                      <input 
                        type="date" 
                        value={entryDate} 
                        onChange={(e) => setEntryDate(e.target.value)} 
                        required 
                      />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>Add Date</label>
                      <div className="flex gap-2">
                        <input 
                          type="date" 
                          id="datePicker"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          className="btn btn-secondary px-4"
                          onClick={(e) => {
                            e.preventDefault();
                            const dateInput = document.getElementById('datePicker');
                            if (dateInput && dateInput.value) {
                              const newDate = dateInput.value;
                              if (!selectedDates.includes(newDate)) {
                                const sortedDates = [...selectedDates, newDate].sort();
                                setSelectedDates(sortedDates);
                                
                                // Initialize bulk entries for this date with all categories
                                const newBulkEntries = { ...bulkEntries };
                                if (!newBulkEntries[newDate]) {
                                  newBulkEntries[newDate] = {};
                                  // Initialize with available categories
                                  diamondPrices.forEach(price => {
                                    newBulkEntries[newDate][price.category] = '';
                                  });
                                }
                                setBulkEntries(newBulkEntries);
                                
                                dateInput.value = '';
                              } else {
                                toast.error('This date is already added');
                              }
                            }
                          }}
                        >
                          Add Date
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Click "Add Date" to add a date and show entry table
                      </p>
                    </div>
                  )}
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
                      {editingEntry ? 'Diamond Entry' : bulkEntryMode ? 'Bulk Diamond Entries' : 'Diamond Entries'}
                    </h3>
                    {!editingEntry && !bulkEntryMode && (
                      <button 
                        type="button" 
                        className="btn btn-secondary px-4 py-2 text-sm"
                        onClick={handleAddRow} 
                      >
                        <span>+</span>
                        <span>Add Row</span>
                      </button>
                    )}
                  </div>
                  
                  {bulkEntryMode && selectedDates.length > 0 ? (
                    /* Bulk Entry Table - Dates as rows, Categories as columns */
                    <div className="overflow-x-auto border-2 border-gray-300 rounded-lg">
                      <table className="w-full border-collapse bg-white">
                        <thead>
                          <tr>
                            <th className="border-2 border-gray-400 bg-blue-200 px-4 py-3 text-sm font-bold text-center sticky left-0 z-10">
                              Date
                            </th>
                            {diamondPrices.map((price, idx) => (
                              <th 
                                key={idx}
                                className="border-2 border-gray-400 bg-green-200 px-3 py-3 text-xs font-semibold text-center"
                                title={`${price.category} - ₹${price.price.toFixed(2)}`}
                              >
                                <div>{price.category}</div>
                                <div className="text-xs text-gray-600">₹{price.price.toFixed(2)}</div>
                              </th>
                            ))}
                            <th className="border-2 border-gray-400 bg-gray-200 px-3 py-3 text-xs font-semibold text-center">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDates.map((date, dateIdx) => (
                            <tr key={dateIdx}>
                              <td className="border-2 border-gray-400 bg-blue-50 px-4 py-3 text-sm font-medium text-center sticky left-0 z-10">
                                {formatDate(date)}
                              </td>
                              {diamondPrices.map((price, catIdx) => (
                                <td key={catIdx} className="border-2 border-gray-400 bg-white px-2 py-2">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    value={bulkEntries[date]?.[price.category] || ''}
                                    onChange={(e) => {
                                      const newBulkEntries = { ...bulkEntries };
                                      if (!newBulkEntries[date]) {
                                        newBulkEntries[date] = {};
                                      }
                                      newBulkEntries[date][price.category] = e.target.value;
                                      setBulkEntries(newBulkEntries);
                                    }}
                                    className="w-full p-2 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </td>
                              ))}
                              <td className="border-2 border-gray-400 bg-gray-50 px-2 py-2 text-center">
                                <button
                                  type="button"
                                  className="btn btn-danger px-2 py-1 text-xs"
                                  onClick={() => {
                                    const newDates = selectedDates.filter((_, i) => i !== dateIdx);
                                    setSelectedDates(newDates);
                                    const newBulkEntries = { ...bulkEntries };
                                    delete newBulkEntries[date];
                                    setBulkEntries(newBulkEntries);
                                  }}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
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
                            {!editingEntry && entryRows.length > 1 && (
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
                  )}
                </div>
              </div>
              <div className="pt-5 border-t-2 border-gray-200 mt-auto">
                <button 
                  type="submit" 
                  className="btn btn-primary w-full py-3.5 text-base font-semibold"
                >
                  {editingEntry ? 'Update Entry' : 'Save Entries'}
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
