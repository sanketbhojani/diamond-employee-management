import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Reports = () => {
  const [reportType, setReportType] = useState('department');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let response;
      switch (reportType) {
        case 'department':
          response = await api.get('/reports/department-wise');
          break;
        case 'monthly':
          response = await api.get(`/reports/monthly?month=${month}&year=${year}`);
          break;
        case 'yearly':
          response = await api.get(`/reports/yearly?year=${year}`);
          break;
        case 'employees':
          response = await api.get('/reports/employees');
          break;
        default:
          return;
      }
      setReportData(response.data.report);
    } catch (error) {
      toast.error('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const exportEmployeesExcel = async () => {
    try {
      const response = await api.get('/reports/export/employees/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employees.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Employees exported to Excel successfully');
    } catch (error) {
      toast.error('Failed to export employees');
    }
  };

  const exportEmployeesPDF = async () => {
    try {
      const response = await api.get('/reports/export/employees/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employees.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Employees exported to PDF successfully');
    } catch (error) {
      toast.error('Failed to export employees');
    }
  };

  const exportDepartmentsExcel = async () => {
    try {
      const response = await api.get('/reports/export/departments/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'departments.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Departments exported to Excel successfully');
    } catch (error) {
      toast.error('Failed to export departments');
    }
  };

  const exportDepartmentsPDF = async () => {
    try {
      const response = await api.get('/reports/export/departments/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'departments.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Departments exported to PDF successfully');
    } catch (error) {
      toast.error('Failed to export departments');
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ 
        fontSize: 'clamp(24px, 4vw, 32px)',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span>📈</span>
        Reports
      </h1>

      {/* Report Type Selection */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Report Type</label>
            <select value={reportType} onChange={(e) => { setReportType(e.target.value); setReportData(null); }}>
              <option value="department">Department-wise Report</option>
              <option value="monthly">Monthly Report</option>
              <option value="yearly">Yearly Report</option>
              <option value="employees">Total Employee Report</option>
            </select>
          </div>
          {(reportType === 'monthly' || reportType === 'yearly') && (
            <>
              {reportType === 'monthly' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Month</label>
                  <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Year</label>
                <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} min="2000" max="2100" />
              </div>
            </>
          )}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" onClick={fetchReport} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px' }}>Export Data</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-success" onClick={exportEmployeesExcel}>
            Export Employees (Excel)
          </button>
          <button className="btn btn-success" onClick={exportEmployeesPDF}>
            Export Employees (PDF)
          </button>
          <button className="btn btn-success" onClick={exportDepartmentsExcel}>
            Export Departments (Excel)
          </button>
          <button className="btn btn-success" onClick={exportDepartmentsPDF}>
            Export Departments (PDF)
          </button>
        </div>
      </div>

      {/* Report Display */}
      {reportData && (
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>
            {reportType === 'department' && 'Department-wise Report'}
            {reportType === 'monthly' && `Monthly Report - ${new Date(2000, month - 1).toLocaleString('default', { month: 'long' })} ${year}`}
            {reportType === 'yearly' && `Yearly Report - ${year}`}
            {reportType === 'employees' && 'Total Employee Report'}
          </h2>

          {reportType === 'department' && Array.isArray(reportData) && (
            <table className="table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Employee Count</th>
                  <th>Total Salary</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.department}</td>
                    <td>{item.employeeCount}</td>
                    <td>₹{parseFloat(item.totalSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'monthly' && (
            <div>
              <p><strong>Total Employees:</strong> {reportData.totalEmployees}</p>
              <p><strong>Total Salary:</strong> ₹{parseFloat(reportData.totalSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p><strong>Diamond Entries:</strong> {reportData.diamondEntries}</p>
            </div>
          )}

          {reportType === 'yearly' && (
            <div>
              <p><strong>Total Employees:</strong> {reportData.totalEmployees}</p>
              <p><strong>Total Salary:</strong> ₹{parseFloat(reportData.totalSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p><strong>Diamond Entries:</strong> {reportData.diamondEntries}</p>
            </div>
          )}

          {reportType === 'employees' && (
            <div>
              <p><strong>Total Employees:</strong> {reportData.totalEmployees}</p>
              <p><strong>Total Departments:</strong> {reportData.totalDepartments}</p>
              <table className="table" style={{ marginTop: '20px' }}>
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Department</th>
                    <th>Sub-Department</th>
                    <th>Type</th>
                    <th>Salary</th>
                    <th>Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.employees?.map((emp, index) => (
                    <tr key={index}>
                      <td>{emp.employeeId}</td>
                      <td>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.mobile}</td>
                      <td>{emp.department}</td>
                      <td>{emp.subDepartment}</td>
                      <td>{emp.employeeType}</td>
                      <td>₹{emp.salary?.toFixed(2) || '0.00'}</td>
                      <td>₹{emp.netSalary?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;

