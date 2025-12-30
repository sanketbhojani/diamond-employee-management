const Employee = require('../models/Employee');
const Department = require('../models/Department');
const DiamondEntry = require('../models/DiamondEntry');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

// @desc    Generate department-wise report
// @route   GET /api/reports/department-wise
// @access  Private
exports.getDepartmentWiseReport = async (req, res) => {
  try {
    const departments = await Department.find();
    const employees = await Employee.find({ isActive: true }).populate('department', 'name');

    const report = departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.department._id.toString() === dept._id.toString());
      const totalSalary = deptEmployees.reduce((sum, emp) => sum + (emp.netSalary || 0), 0);

      return {
        department: dept.name,
        employeeCount: deptEmployees.length,
        totalSalary: totalSalary.toFixed(2)
      };
    });

    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate monthly report
// @route   GET /api/reports/monthly
// @access  Private
exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const employees = await Employee.find({ isActive: true });
    const totalEmployees = employees.length;
    const totalSalary = employees.reduce((sum, emp) => sum + (emp.netSalary || 0), 0);

    const diamondEntries = await DiamondEntry.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('employee');

    res.json({
      success: true,
      report: {
        month: targetMonth,
        year: targetYear,
        totalEmployees,
        totalSalary: totalSalary.toFixed(2),
        diamondEntries: diamondEntries.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate yearly report
// @route   GET /api/reports/yearly
// @access  Private
exports.getYearlyReport = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const employees = await Employee.find({ isActive: true });
    const totalEmployees = employees.length;
    const totalSalary = employees.reduce((sum, emp) => sum + (emp.netSalary || 0), 0) * 12;

    const diamondEntries = await DiamondEntry.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('employee');

    res.json({
      success: true,
      report: {
        year: targetYear,
        totalEmployees,
        totalSalary: totalSalary.toFixed(2),
        diamondEntries: diamondEntries.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate total employee report
// @route   GET /api/reports/employees
// @access  Private
exports.getTotalEmployeeReport = async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true }).populate('department', 'name');
    const departments = await Department.find();

    const report = {
      totalEmployees: employees.length,
      totalDepartments: departments.length,
      employees: employees.map(emp => ({
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        mobile: emp.mobile,
        department: emp.department.name,
        subDepartment: emp.subDepartment,
        employeeType: emp.employeeType,
        salary: emp.salary,
        netSalary: emp.netSalary,
        grossSalary: emp.grossSalary
      }))
    };

    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Export employees to Excel
// @route   GET /api/reports/export/employees/excel
// @access  Private
exports.exportEmployeesExcel = async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true }).populate('department', 'name');

    const data = employees.map(emp => ({
      'Employee ID': emp.employeeId,
      'Name': emp.name,
      'Email': emp.email,
      'Mobile': emp.mobile,
      'Department': emp.department.name,
      'Sub-Department': emp.subDepartment,
      'Employee Type': emp.employeeType,
      'Salary': emp.salary,
      'Advanced Salary': emp.advancedSalary,
      'Gross Salary': emp.grossSalary,
      'Net Salary': emp.netSalary,
      'Aadhar': emp.aadhar,
      'PAN': emp.pan
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Export employees to PDF
// @route   GET /api/reports/export/employees/pdf
// @access  Private
exports.exportEmployeesPDF = async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true }).populate('department', 'name');

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.pdf');
    
    doc.pipe(res);
    doc.fontSize(20).text('Employee List', { align: 'center' });
    doc.moveDown();

    employees.forEach((emp, index) => {
      doc.fontSize(12);
      doc.text(`${index + 1}. ${emp.name} (${emp.employeeId})`);
      doc.text(`   Department: ${emp.department.name} - ${emp.subDepartment}`);
      doc.text(`   Email: ${emp.email} | Mobile: ${emp.mobile}`);
      doc.text(`   Salary: ₹${emp.netSalary} | Type: ${emp.employeeType}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Export departments to Excel
// @route   GET /api/reports/export/departments/excel
// @access  Private
exports.exportDepartmentsExcel = async (req, res) => {
  try {
    const departments = await Department.find();
    const employees = await Employee.find({ isActive: true }).populate('department', 'name');

    const data = departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.department._id.toString() === dept._id.toString());
      return {
        'Department': dept.name,
        'Sub-Departments': dept.subDepartments.map(sub => sub.name).join(', '),
        'Total Employees': deptEmployees.length
      };
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Departments');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=departments.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Export departments to PDF
// @route   GET /api/reports/export/departments/pdf
// @access  Private
exports.exportDepartmentsPDF = async (req, res) => {
  try {
    const departments = await Department.find();
    const employees = await Employee.find({ isActive: true }).populate('department', 'name');

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=departments.pdf');
    
    doc.pipe(res);
    doc.fontSize(20).text('Department List', { align: 'center' });
    doc.moveDown();

    departments.forEach((dept, index) => {
      const deptEmployees = employees.filter(emp => emp.department._id.toString() === dept._id.toString());
      doc.fontSize(12);
      doc.text(`${index + 1}. ${dept.name}`);
      doc.text(`   Sub-Departments: ${dept.subDepartments.map(sub => sub.name).join(', ') || 'None'}`);
      doc.text(`   Total Employees: ${deptEmployees.length}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};






