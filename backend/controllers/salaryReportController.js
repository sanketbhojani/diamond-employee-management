const Employee = require('../models/Employee');
const Department = require('../models/Department');
const DiamondEntry = require('../models/DiamondEntry');
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');

// Helper function to calculate salary from diamond entries for a specific month
const calculateMonthlySalaryFromEntries = async (employee, targetMonth, targetYear) => {
  if (employee.employeeType === 'Chutak') {
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    
    const entries = await DiamondEntry.find({
      employee: employee._id,
      date: { $gte: startDate, $lte: endDate }
    });
    
    const totalDailySalary = entries.reduce((sum, e) => sum + (e.dailySalary || 0), 0);
    const baseSalary = employee.salary || 0;
    const grossSalary = baseSalary + totalDailySalary;
    const deductions = (employee.advancedSalary || 0) + (employee.pf || 0) + (employee.pt || 0);
    const netSalary = grossSalary - deductions;
    
    return {
      grossSalary,
      netSalary,
      monthlyEntries: entries.length
    };
  } else {
    // For Fix employees, use their stored grossSalary (or salary as fallback)
    const grossSalary = employee.grossSalary || employee.salary || 0;
    const deductions = (employee.advancedSalary || 0) + (employee.pf || 0) + (employee.pt || 0);
    const netSalary = grossSalary - deductions;
    return {
      grossSalary: grossSalary,
      netSalary: netSalary,
      monthlyEntries: 0
    };
  }
};

// @desc    Generate salary report (PDF)
// @route   GET /api/salary-report/pdf
// @access  Private
exports.generateSalaryReportPDF = async (req, res) => {
  try {
    const { month, year, departmentId } = req.query;
    
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Build query
    let query = { isActive: true };
    if (departmentId && departmentId !== 'all') {
      query.department = departmentId;
    }

    // Get employees - show all active employees for the selected month
    let employees = await Employee.find(query)
      .populate('department', 'name')
      .sort({ employeeId: 1 });
    
    // Ensure employees array exists
    if (!employees || !Array.isArray(employees)) {
      employees = [];
    }

    // Calculate salaries based on diamond entries for the selected month
    const employeesWithMonthlySalaries = await Promise.all(
      employees.map(async (emp) => {
        const monthlyData = await calculateMonthlySalaryFromEntries(emp, targetMonth, targetYear);
        return {
          ...emp.toObject(),
          grossSalary: monthlyData.grossSalary,
          netSalary: monthlyData.netSalary
        };
      })
    );

    // Create PDF
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Salary_Report_${monthNames[targetMonth - 1]}_${targetYear}.pdf`);
    doc.pipe(res);

    // Clean Header Design
    const headerY = 50;
    doc.rect(50, headerY, 500, 85).fillAndStroke('#f8f9fa', '#2c3e50');
    doc.fontSize(26).font('Helvetica-Bold').fillColor('#2c3e50');
    doc.text('GOMUKH DIAMOND', 60, headerY + 12, { width: 480, align: 'center' });
    doc.fontSize(16).font('Helvetica');
    doc.fillColor('#495057');
    doc.text('Monthly Salary Report', 60, headerY + 40, { width: 480, align: 'center' });
    doc.fontSize(13);
    doc.text(`Period: ${monthNames[targetMonth - 1]} ${targetYear}`, 60, headerY + 65, { width: 480, align: 'center' });
    
    // Report Info Section
    let currentY = headerY + 105;
    doc.rect(50, currentY, 500, 45).stroke('#dee2e6');
    doc.fontSize(10).font('Helvetica').fillColor('#495057');
    
    if (departmentId && departmentId !== 'all') {
      const department = await Department.findById(departmentId);
      doc.text(`Department: ${department?.name || 'N/A'}`, 60, currentY + 8);
    } else {
      doc.text('Department: All Departments', 60, currentY + 8);
    }
    
    doc.text(`Report Generated: ${new Date().toLocaleDateString('en-IN')}`, 60, currentY + 25);
    doc.font('Helvetica-Bold');
    doc.text(`Total Employees: ${employeesWithMonthlySalaries.length}`, 450, currentY + 8, { align: 'right' });
    
    currentY += 55;

    // Clean Table Configuration
    const tableStartY = currentY;
    const rowHeight = 28;
    const headerHeight = 32;
    const tableX = 50;
    
    const colWidths = { 
      sr: 30,      // Serial Number
      id: 65,      // Employee ID
      name: 125,   // Name
      dept: 115,   // Department
      gross: 85,   // Gross Salary
      net: 85,     // Net Salary
      signature: 110  // Signature
    };
    
    // Helper function to draw cell with border and text
    const drawCell = (x, y, width, height, text, options = {}) => {
      // Don't draw border if it's part of a merged header cell
      if (!options.noBorder) {
        doc.rect(x, y, width, height).stroke('#dee2e6');
      }
      
      // Draw text
      if (text) {
        const fontSize = options.fontSize || 9;
        const align = options.align || 'left';
        const font = options.font || 'Helvetica';
        const textColor = options.color || '#212529';
        
        doc.fontSize(fontSize).font(font).fillColor(textColor);
        
        if (align === 'center') {
          doc.text(text, x, y + (height / 2) - (fontSize / 3), { 
            width: width, 
            align: 'center' 
          });
        } else if (align === 'right') {
          doc.text(text, x, y + (height / 2) - (fontSize / 3), { 
            width: width - 5, 
            align: 'right' 
          });
        } else {
          doc.text(text, x + 5, y + (height / 2) - (fontSize / 3), { 
            width: width - 10 
          });
        }
        doc.fillColor('#000000'); // Reset color
      }
    };

    // Draw clean header row with better styling
    let xPos = tableX;
    
    // Draw header background
    doc.rect(tableX, tableStartY, colWidths.sr + colWidths.id + colWidths.name + colWidths.dept + colWidths.gross + colWidths.net + colWidths.signature, headerHeight)
       .fillAndStroke('#2c3e50', '#2c3e50');
    
    // Draw header text
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff');
    
    doc.text('Sr.', xPos + colWidths.sr/2, tableStartY + headerHeight/2 - 3, { width: colWidths.sr, align: 'center' });
    xPos += colWidths.sr;
    
    doc.text('ID', xPos + colWidths.id/2, tableStartY + headerHeight/2 - 3, { width: colWidths.id, align: 'center' });
    xPos += colWidths.id;
    
    doc.text('Name', xPos + colWidths.name/2, tableStartY + headerHeight/2 - 3, { width: colWidths.name, align: 'center' });
    xPos += colWidths.name;
    
    doc.text('Department', xPos + colWidths.dept/2, tableStartY + headerHeight/2 - 3, { width: colWidths.dept, align: 'center' });
    xPos += colWidths.dept;
    
    doc.text('Gross Salary', xPos + colWidths.gross/2, tableStartY + headerHeight/2 - 3, { width: colWidths.gross, align: 'center' });
    xPos += colWidths.gross;
    
    doc.text('Net Salary', xPos + colWidths.net/2, tableStartY + headerHeight/2 - 3, { width: colWidths.net, align: 'center' });
    xPos += colWidths.net;
    
    doc.text('Signature', xPos + colWidths.signature/2, tableStartY + headerHeight/2 - 3, { width: colWidths.signature, align: 'center' });
    
    doc.fillColor('#000000'); // Reset to black for data rows

    // Draw data rows
    currentY = tableStartY + headerHeight;
    let totalGross = 0;
    let totalNet = 0;

    employeesWithMonthlySalaries.forEach((emp, index) => {
      // Check if we need a new page
      if (currentY + rowHeight > 750) {
        doc.addPage();
        currentY = 50;
      }

      xPos = tableX;
      
      // Alternating row background for better readability
      if (index % 2 === 0) {
        doc.rect(tableX, currentY, colWidths.sr + colWidths.id + colWidths.name + colWidths.dept + colWidths.gross + colWidths.net + colWidths.signature, rowHeight)
           .fill('#f8f9fa');
      }
      
      // Serial Number
      drawCell(xPos, currentY, colWidths.sr, rowHeight, (index + 1).toString(), { align: 'center' });
      xPos += colWidths.sr;
      
      // Employee ID
      drawCell(xPos, currentY, colWidths.id, rowHeight, emp.employeeId || 'N/A');
      xPos += colWidths.id;
      
      // Name
      drawCell(xPos, currentY, colWidths.name, rowHeight, emp.name || 'N/A');
      xPos += colWidths.name;
      
      // Department
      const deptText = `${emp.department?.name || 'N/A'}${emp.subDepartment ? ' - ' + emp.subDepartment : ''}`;
      drawCell(xPos, currentY, colWidths.dept, rowHeight, deptText);
      xPos += colWidths.dept;
      
      // Gross Salary
      drawCell(xPos, currentY, colWidths.gross, rowHeight, `₹${(emp.grossSalary || 0).toFixed(2)}`, { align: 'right' });
      xPos += colWidths.gross;
      
      // Net Salary (highlighted in green)
      doc.fillColor('#28a745');
      drawCell(xPos, currentY, colWidths.net, rowHeight, `₹${(emp.netSalary || 0).toFixed(2)}`, { align: 'right', color: '#28a745' });
      doc.fillColor('#000000');
      xPos += colWidths.net;
      
      // Signature (empty space with border)
      doc.rect(xPos, currentY, colWidths.signature, rowHeight).stroke('#dee2e6');
      
      totalGross += emp.grossSalary || 0;
      totalNet += emp.netSalary || 0;
      currentY += rowHeight;
    });

    // Draw clean total row
    currentY += 5;
    xPos = tableX;
    
    // Total row with better styling
    doc.rect(xPos, currentY, colWidths.sr + colWidths.id + colWidths.name + colWidths.dept, rowHeight + 5)
       .fillAndStroke('#28a745', '#28a745');
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff');
    doc.text('TOTAL', xPos, currentY + (rowHeight + 5)/2 - 3, { 
      width: colWidths.sr + colWidths.id + colWidths.name + colWidths.dept, 
      align: 'center' 
    });
    
    xPos += colWidths.sr + colWidths.id + colWidths.name + colWidths.dept;
    doc.rect(xPos, currentY, colWidths.gross, rowHeight + 5).fillAndStroke('#28a745', '#28a745');
    doc.text(`₹${totalGross.toFixed(2)}`, xPos, currentY + (rowHeight + 5)/2 - 3, { width: colWidths.gross, align: 'center' });
    
    xPos += colWidths.gross;
    doc.rect(xPos, currentY, colWidths.net, rowHeight + 5).fillAndStroke('#28a745', '#28a745');
    doc.text(`₹${totalNet.toFixed(2)}`, xPos, currentY + (rowHeight + 5)/2 - 3, { width: colWidths.net, align: 'center' });
    
    xPos += colWidths.net;
    doc.rect(xPos, currentY, colWidths.signature, rowHeight + 5).fillAndStroke('#28a745', '#28a745');
    doc.fillColor('#000000'); // Reset color

    currentY += rowHeight + 30;

    // Clean Footer with signature
    currentY += 20;
    doc.fontSize(9).fillColor('#6c757d');
    doc.text('This is a computer-generated report.', 50, currentY, { width: 500, align: 'center' });
    currentY += 30;

    // Authorized signatory section
    doc.fontSize(10).fillColor('#212529');
    doc.text('_________________________', 430, currentY);
    doc.font('Helvetica-Bold');
    doc.text('Authorized Signatory', 430, currentY + 18, { align: 'right' });
    doc.text('GOMUKH DIAMOND', 430, currentY + 35, { align: 'right' });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate salary report (Excel)
// @route   GET /api/salary-report/excel
// @access  Private
exports.generateSalaryReportExcel = async (req, res) => {
  try {
    const { month, year, departmentId } = req.query;
    
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Build query
    let query = { isActive: true };
    if (departmentId && departmentId !== 'all') {
      query.department = departmentId;
    }

    // Get employees
    let employees = await Employee.find(query)
      .populate('department', 'name')
      .sort({ employeeId: 1 });
    
    // Ensure employees array exists
    if (!employees || !Array.isArray(employees)) {
      employees = [];
    }

    // Calculate salaries based on diamond entries for the selected month
    const employeesWithMonthlySalaries = await Promise.all(
      employees.map(async (emp) => {
        const monthlyData = await calculateMonthlySalaryFromEntries(emp, targetMonth, targetYear);
        return {
          ...emp.toObject(),
          grossSalary: monthlyData.grossSalary,
          netSalary: monthlyData.netSalary
        };
      })
    );

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();

    // Prepare data
    const reportData = [
      ['GOMUKH DIAMOND - Monthly Salary Report'],
      [`Period: ${monthNames[targetMonth - 1]} ${targetYear}`],
      [`Report Generated: ${new Date().toLocaleDateString('en-IN')}`],
      [],
      ['Sr.', 'Employee ID', 'Name', 'Department', 'Sub-Department', 'Employee Type', 'Gross Salary', 'Net Salary', 'Signature']
    ];

    let totalGross = 0;
    let totalNet = 0;

    employeesWithMonthlySalaries.forEach((emp, index) => {
      reportData.push([
        index + 1,
        emp.employeeId || 'N/A',
        emp.name || 'N/A',
        emp.department?.name || 'N/A',
        emp.subDepartment || 'N/A',
        emp.employeeType || 'N/A',
        emp.grossSalary || 0,
        emp.netSalary || 0,
        ''
      ]);
      totalGross += emp.grossSalary || 0;
      totalNet += emp.netSalary || 0;
    });

    reportData.push([]);
    reportData.push(['TOTAL', '', '', '', '', '', totalGross, totalNet, '']);

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(reportData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },  // Sr.
      { wch: 12 }, // ID
      { wch: 25 }, // Name
      { wch: 15 }, // Department
      { wch: 18 }, // Sub-Department
      { wch: 15 }, // Employee Type
      { wch: 15 }, // Gross Salary
      { wch: 15 }, // Net Salary
      { wch: 20 }  // Signature
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Salary Report');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Salary_Report_${monthNames[targetMonth - 1]}_${targetYear}.xlsx`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get salary report data (JSON)
// @route   GET /api/salary-report
// @access  Private
exports.getSalaryReport = async (req, res) => {
  try {
    const { month, year, departmentId } = req.query;
    
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();

    // Build query
    let query = { isActive: true };
    if (departmentId && departmentId !== 'all') {
      query.department = departmentId;
    }

    // Get employees - show all active employees for the selected month
    let employees = await Employee.find(query)
      .populate('department', 'name')
      .sort({ employeeId: 1 })
      .select('-password');
    
    // Ensure employees array exists
    if (!employees || !Array.isArray(employees)) {
      employees = [];
    }

    // Calculate salaries based on diamond entries for the selected month
    const employeesWithMonthlySalaries = await Promise.all(
      employees.map(async (emp) => {
        const monthlyData = await calculateMonthlySalaryFromEntries(emp, targetMonth, targetYear);
        return {
          ...emp.toObject(),
          grossSalary: monthlyData.grossSalary,
          netSalary: monthlyData.netSalary,
          monthlyEntries: monthlyData.monthlyEntries
        };
      })
    );

    // Calculate totals
    const totalGross = employeesWithMonthlySalaries.reduce((sum, emp) => sum + (emp.grossSalary || 0), 0);
    const totalNet = employeesWithMonthlySalaries.reduce((sum, emp) => sum + (emp.netSalary || 0), 0);

    res.json({
      success: true,
      report: {
        month: targetMonth,
        year: targetYear,
        departmentId: departmentId || 'all',
        employees: employeesWithMonthlySalaries,
        summary: {
          totalEmployees: employeesWithMonthlySalaries.length,
          totalGrossSalary: totalGross,
          totalNetSalary: totalNet
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
