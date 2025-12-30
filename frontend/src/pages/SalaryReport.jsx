import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const SalaryReport = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchReport();
  }, [month, year, selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      toast.error('Failed to fetch departments');
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
        departmentId: selectedDepartment
      });
      const response = await api.get(`/salary-report?${params.toString()}`);
      setReportData(response.data.report);
    } catch (error) {
      toast.error('Failed to fetch salary report');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
        departmentId: selectedDepartment
      });
      const response = await api.get(`/salary-report/pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      link.setAttribute('download', `Salary_Report_${monthNames[month - 1]}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Salary report PDF generated successfully');
    } catch (error) {
      toast.error('Failed to generate PDF report');
    }
  };

  const generateExcel = async () => {
    try {
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
        departmentId: selectedDepartment
      });
      const response = await api.get(`/salary-report/excel?${params.toString()}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      link.setAttribute('download', `Salary_Report_${monthNames[month - 1]}_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Salary report Excel generated successfully');
    } catch (error) {
      toast.error('Failed to generate Excel report');
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Navigate to next month
  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Monthly Salary Report</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={generatePDF}>
            Export PDF
          </button>
          <button className="btn btn-success" onClick={generateExcel}>
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label>Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {monthNames.map((name, index) => (
                <option key={index + 1} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              min="2020"
              max="2100"
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <button
              className="btn btn-secondary"
              onClick={goToPreviousMonth}
              style={{ padding: '10px 15px' }}
            >
              ← Previous Month
            </button>
            <button
              className="btn btn-secondary"
              onClick={goToNextMonth}
              style={{ padding: '10px 15px' }}
            >
              Next Month →
            </button>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      {reportData && (
        <div className="card" style={{ marginBottom: '20px', background: '#f0f7ff' }}>
          <h3>Report Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '15px' }}>
            <div>
              <p><strong>Period:</strong> {monthNames[month - 1]} {year}</p>
            </div>
            <div>
              <p><strong>Department:</strong> {
                selectedDepartment === 'all' 
                  ? 'All Departments' 
                  : departments.find(d => d._id === selectedDepartment)?.name || 'N/A'
              }</p>
            </div>
            <div>
              <p><strong>Total Employees:</strong> {reportData.summary.totalEmployees}</p>
            </div>
            <div>
              <p><strong>Total Gross Salary:</strong> ₹{parseFloat(reportData.summary.totalGrossSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p><strong>Total Net Salary:</strong> ₹<span style={{ color: '#28a745', fontWeight: 'bold', fontSize: '18px' }}>{parseFloat(reportData.summary.totalNetSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Report Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading report data...</div>
      ) : reportData && reportData.employees.length > 0 ? (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Employee Salary Details</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Sub-Department</th>
                  <th>Employee Type</th>
                  <th>Gross Salary</th>
                  <th>Net Salary</th>
                  <th>Signature</th>
                </tr>
              </thead>
              <tbody>
                {reportData.employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>{emp.employeeId}</td>
                    <td>{emp.name}</td>
                    <td>{emp.department?.name || 'N/A'}</td>
                    <td>{emp.subDepartment || 'N/A'}</td>
                    <td>{emp.employeeType}</td>
                    <td>₹{emp.grossSalary?.toFixed(2) || '0.00'}</td>
                    <td style={{ fontWeight: 'bold', color: '#28a745' }}>₹{emp.netSalary?.toFixed(2) || '0.00'}</td>
                    <td style={{ borderBottom: '1px solid #ddd', minWidth: '150px' }}></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#e8f5e9', fontWeight: 'bold' }}>
                  <td colSpan="5">TOTAL</td>
                  <td>₹{parseFloat(reportData.summary.totalGrossSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{ color: '#28a745', fontSize: '16px' }}>₹{parseFloat(reportData.summary.totalNetSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signature Section */}
          <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #ddd' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '50px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ borderTop: '1px solid #000', width: '200px', marginBottom: '5px', paddingTop: '5px' }}></div>
                <p style={{ fontWeight: 'bold' }}>Authorized Signatory</p>
                <p>GOMUKH DIAMOND</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>No employees found for the selected criteria.</p>
        </div>
      )}
    </div>
  );
};

export default SalaryReport;








