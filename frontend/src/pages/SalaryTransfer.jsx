import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const SalaryTransfer = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      // Only show employees with net salary > 0
      const employeesWithSalary = response.data.employees.filter(
        emp => (emp.netSalary || 0) > 0 && (emp.grossSalary || 0) > 0
      );
      setEmployees(employeesWithSalary);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    if (selectedEmployee.netSalary <= 0) {
      toast.warning('Employee salary is already zero');
      return;
    }

    if (!window.confirm(`Mark salary of ₹${selectedEmployee.netSalary?.toFixed(2)} as paid for ${selectedEmployee.name}?`)) {
      return;
    }

    setProcessing(true);
    try {
      const currentDate = new Date();
      const response = await api.post(`/salary-transfer/pay/${selectedEmployee._id}`, {
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      });
      
      toast.success(`Salary marked as paid! Amount: ₹${selectedEmployee.netSalary?.toFixed(2)}`);
      
      // Refresh employees list
      await fetchEmployees();
      
      // Clear selection
      setSelectedEmployee(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark salary as paid');
    } finally {
      setProcessing(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
          <span>💰</span>
          Salary Transfer
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-5">Select Employee</h2>
          <div className="form-group">
            <label>Search Employee</label>
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="mt-5 max-h-[600px] overflow-y-auto">
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-500">
                  {employees.length === 0 
                    ? 'No employees with pending salary' 
                    : 'No employees found matching your search'}
                </p>
              </div>
            ) : (
              filteredEmployees.map((emp) => (
                <div
                  key={emp._id}
                  onClick={() => handleEmployeeSelect(emp)}
                  className={`p-4 mb-3 rounded-lg cursor-pointer transition-all ${
                    selectedEmployee?._id === emp._id
                      ? 'border-2 border-indigo-500 bg-indigo-50'
                      : 'border border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  <div className="font-bold text-gray-800">{emp.name} ({emp.employeeId})</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {emp.department?.name} - {emp.subDepartment}
                  </div>
                  <div className="text-sm font-semibold text-green-600 mt-2">
                    Net Salary: ₹{emp.netSalary?.toFixed(2) || '0.00'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Salary Details */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-5">Salary Details</h2>

          {selectedEmployee ? (
            <div className="space-y-5">
              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Employee Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {selectedEmployee.name}</p>
                  <p><strong>ID:</strong> {selectedEmployee.employeeId}</p>
                  <p><strong>Department:</strong> {selectedEmployee.department?.name} - {selectedEmployee.subDepartment}</p>
                  <p><strong>Type:</strong> {selectedEmployee.employeeType}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
                <h3 className="font-semibold text-lg mb-3">Salary Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross Salary:</span>
                    <span className="font-semibold">₹{selectedEmployee.grossSalary?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Advanced Salary:</span>
                    <span className="font-semibold">₹{selectedEmployee.advancedSalary?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">PF:</span>
                    <span className="font-semibold">₹{selectedEmployee.pf?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">PT:</span>
                    <span className="font-semibold">₹{selectedEmployee.pt?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="border-t-2 border-blue-300 pt-2 mt-3 flex justify-between">
                    <span className="text-lg font-bold text-gray-800">Net Salary:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{selectedEmployee.netSalary?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-success w-full py-4 text-lg font-semibold"
                onClick={handleMarkAsPaid}
                disabled={processing || selectedEmployee.netSalary <= 0}
              >
                {processing ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    <span>Mark as Paid - ₹{selectedEmployee.netSalary?.toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <div className="text-5xl mb-4">👤</div>
              <p className="text-lg">Please select an employee from the list</p>
              <p className="text-sm mt-2">Only employees with pending salary are shown</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryTransfer;
