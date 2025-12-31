const Employee = require('../models/Employee');
const BankDetail = require('../models/BankDetail');
const SalaryPayment = require('../models/SalaryPayment');
const DiamondEntry = require('../models/DiamondEntry');
const PDFDocument = require('pdfkit');

// Function to convert number to Indian Rupee words
function numberToWords(amount) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convertHundreds(num) {
    let result = '';
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    if (num > 0) {
      result += ones[num] + ' ';
    }
    return result.trim();
  }
  
  if (amount === 0) return 'Zero';
  
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  let words = '';
  
  if (rupees >= 10000000) {
    words += convertHundreds(Math.floor(rupees / 10000000)) + ' Crore ';
    rupees %= 10000000;
  }
  if (rupees >= 100000) {
    words += convertHundreds(Math.floor(rupees / 100000)) + ' Lakh ';
    rupees %= 100000;
  }
  if (rupees >= 1000) {
    words += convertHundreds(Math.floor(rupees / 1000)) + ' Thousand ';
    rupees %= 1000;
  }
  if (rupees > 0) {
    words += convertHundreds(rupees);
  }
  
  words = words.trim() || 'Zero';
  words += ' Rupee' + (rupees !== 1 ? 's' : '');
  
  if (paise > 0) {
    words += ' and ' + convertHundreds(paise) + ' Paise';
  }
  
  return words + ' Only';
}

// @desc    Generate salary receipt for employee
// @route   GET /api/salary-transfer/receipt/:employeeId
// @access  Private
exports.generateSalaryReceipt = async (req, res) => {
  try {
    const { month, year } = req.query;
    const employeeId = req.params.employeeId;
    
    const employee = await Employee.findById(employeeId).populate('department', 'name');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentDate = new Date();
    const payDate = new Date(targetYear, targetMonth, 0); // Last day of the month
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    
    const formattedDate = currentDate.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
    
    const payDateFormatted = payDate.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });

    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Payslip_${employee.employeeId}_${targetMonth}_${targetYear}.pdf`);
    
    doc.pipe(res);

    // Calculate values
    const grossSalary = employee.grossSalary || 0;
    const advancedSalary = employee.advancedSalary || 0;
    const pf = employee.pf || 0;
    const pt = employee.pt || 0;
    const totalDeductions = advancedSalary + pf + pt;
    const netSalary = employee.netSalary || 0;
    
    // Calculate Basic (50% of gross) and Allowances (50% of gross) for display
    const basic = grossSalary * 0.5;
    const allowances = grossSalary * 0.5;
    
    // Get date of joining from createdAt or use current date
    const dateOfJoining = employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) : 'N/A';

    let currentY = 50;

    // ========== HEADER SECTION ==========
    // Company Name (Left)
    doc.fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#1e293b')
      .text('GOMUKH DIAMOND', 50, currentY);
    
    // Location (Right)
    doc.fontSize(10)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('Gujarat, India', 450, currentY, { align: 'right' });
    
    currentY += 35;
    
    // Payslip Title
    doc.fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#1e293b')
      .text(`Payslip for the month of ${monthNames[targetMonth - 1]} ${targetYear}`, 50, currentY, {
        width: 500
      });

    currentY += 30;

    // ========== EMPLOYEE PAY SUMMARY SECTION ==========
    doc.fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#1e293b')
      .text('Employee Pay Summary', 50, currentY);
    
    currentY += 20;
    
    // Employee Pay Summary Box
    doc.rect(50, currentY, 500, 80)
      .stroke('#cbd5e1');
    
    doc.fontSize(10)
      .font('Helvetica')
      .fillColor('#475569');
    
    // Left Column
    doc.text(`Employee Name: ${employee.name}, ${employee.employeeId}`, 60, currentY + 10);
    doc.text(`Designation: ${employee.department?.name || 'N/A'}${employee.subDepartment ? ' - ' + employee.subDepartment : ''}`, 60, currentY + 25);
    doc.text(`Date of Joining: ${dateOfJoining}`, 60, currentY + 40);
    doc.text(`Pay Period: ${monthNames[targetMonth - 1]} ${targetYear}`, 60, currentY + 55);
    doc.text(`Pay Date: ${payDateFormatted}`, 60, currentY + 70);
    
    currentY += 100;
    
    // ========== EMPLOYEE NET PAY SECTION (PROMINENT) ==========
    doc.rect(50, currentY, 500, 60)
      .fillAndStroke('#e0f2fe', '#0284c7');
    
    doc.fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#0c4a6e')
      .text('Employee Net Pay', 60, currentY + 10);
    
    doc.fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#0c4a6e')
      .text(`₹${netSalary.toFixed(2)}`, 60, currentY + 30);
    
    doc.fontSize(10)
      .font('Helvetica')
      .fillColor('#0c4a6e')
      .text(`Paid Days: ${daysInMonth}`, 400, currentY + 20);
    doc.text(`LOP Days: 0`, 400, currentY + 40);
    
    currentY += 80;

    // ========== EARNINGS TABLE ==========
    doc.fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#1e293b')
      .text('Earnings', 50, currentY);
    
    currentY += 20;
    
    const earningsTableY = currentY;
    const rowHeight = 25;
    const colWidths = { desc: 250, amount: 125, ytd: 125 };
    
    // Earnings Table Header
    doc.rect(50, earningsTableY, 500, rowHeight)
      .fillAndStroke('#1e293b', '#1e293b');
    
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('EARNINGS', 60, earningsTableY + 8);
    doc.text('AMOUNT', 60 + colWidths.desc, earningsTableY + 8);
    doc.text('YTD', 60 + colWidths.desc + colWidths.amount, earningsTableY + 8);
    
    currentY = earningsTableY + rowHeight;
    
    // Basic
    doc.rect(50, currentY, 500, rowHeight)
      .stroke('#e2e8f0');
    doc.fontSize(10)
      .font('Helvetica')
      .fillColor('#1e293b')
      .text('Basic', 60, currentY + 8);
    doc.text(`₹${basic.toFixed(2)}`, 60 + colWidths.desc, currentY + 8);
    doc.text(`₹${basic.toFixed(2)}`, 60 + colWidths.desc + colWidths.amount, currentY + 8);
    currentY += rowHeight;
    
    // Allowances (if any)
    if (allowances > 0) {
      doc.rect(50, currentY, 500, rowHeight)
        .stroke('#e2e8f0');
      doc.text('Fixed Allowance', 60, currentY + 8);
      doc.text(`₹${allowances.toFixed(2)}`, 60 + colWidths.desc, currentY + 8);
      doc.text(`₹${allowances.toFixed(2)}`, 60 + colWidths.desc + colWidths.amount, currentY + 8);
      currentY += rowHeight;
    }
    
    // Gross Earnings
    doc.rect(50, currentY, 500, rowHeight)
      .fillAndStroke('#e0f2fe', '#0284c7');
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#0c4a6e')
      .text('Gross Earnings', 60, currentY + 8);
    doc.text(`₹${grossSalary.toFixed(2)}`, 60 + colWidths.desc, currentY + 8);
    doc.text(`₹${grossSalary.toFixed(2)}`, 60 + colWidths.desc + colWidths.amount, currentY + 8);
    
    currentY += rowHeight + 20;
    
    // ========== DEDUCTIONS TABLE ==========
    doc.fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#1e293b')
      .text('Deductions', 50, currentY);
    
    currentY += 20;
    
    const deductionsTableY = currentY;
    
    // Deductions Table Header
    doc.rect(50, deductionsTableY, 500, rowHeight)
      .fillAndStroke('#1e293b', '#1e293b');
    
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('DEDUCTIONS', 60, deductionsTableY + 8);
    doc.text('AMOUNT', 60 + colWidths.desc, deductionsTableY + 8);
    doc.text('YTD', 60 + colWidths.desc + colWidths.amount, deductionsTableY + 8);
    
    currentY = deductionsTableY + rowHeight;
    
    // Professional Tax
    if (pt > 0) {
      doc.rect(50, currentY, 500, rowHeight)
        .stroke('#e2e8f0');
      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#1e293b')
        .text('Professional Tax', 60, currentY + 8);
      doc.text(`₹${pt.toFixed(2)}`, 60 + colWidths.desc, currentY + 8);
      doc.text(`₹${pt.toFixed(2)}`, 60 + colWidths.desc + colWidths.amount, currentY + 8);
      currentY += rowHeight;
    }
    
    // Advanced Salary
    if (advancedSalary > 0) {
      doc.rect(50, currentY, 500, rowHeight)
        .stroke('#e2e8f0');
      doc.text('Advanced Salary', 60, currentY + 8);
      doc.text(`₹${advancedSalary.toFixed(2)}`, 60 + colWidths.desc, currentY + 8);
      doc.text(`₹${advancedSalary.toFixed(2)}`, 60 + colWidths.desc + colWidths.amount, currentY + 8);
      currentY += rowHeight;
    }
    
    // PF
    if (pf > 0) {
      doc.rect(50, currentY, 500, rowHeight)
        .stroke('#e2e8f0');
      doc.text('Provident Fund (PF)', 60, currentY + 8);
      doc.text(`₹${pf.toFixed(2)}`, 60 + colWidths.desc, currentY + 8);
      doc.text(`₹${pf.toFixed(2)}`, 60 + colWidths.desc + colWidths.amount, currentY + 8);
      currentY += rowHeight;
    }
    
    // Total Deductions
    doc.rect(50, currentY, 500, rowHeight)
      .fillAndStroke('#fee2e2', '#dc2626');
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#991b1b')
      .text('Total Deductions', 60, currentY + 8);
    doc.text(`₹${totalDeductions.toFixed(2)}`, 60 + colWidths.desc, currentY + 8);
    doc.text(`₹${totalDeductions.toFixed(2)}`, 60 + colWidths.desc + colWidths.amount, currentY + 8);
    
    currentY += rowHeight + 20;
    
    // ========== NET PAY SUMMARY TABLE ==========
    doc.fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#1e293b')
      .text('Net Pay', 50, currentY);
    
    currentY += 20;
    
    const netPayTableY = currentY;
    const netPayRowHeight = 30;
    
    // Net Pay Table
    doc.rect(50, netPayTableY, 500, netPayRowHeight * 3)
      .stroke('#cbd5e1');
    
    // Gross Earnings Row
    doc.rect(50, netPayTableY, 500, netPayRowHeight)
      .stroke('#cbd5e1');
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#1e293b')
      .text('NET PAY', 60, netPayTableY + 10);
    doc.text('AMOUNT', 400, netPayTableY + 10);
    
    currentY = netPayTableY + netPayRowHeight;
    
    // Gross Earnings
    doc.rect(50, currentY, 500, netPayRowHeight)
      .stroke('#cbd5e1');
    doc.fontSize(10)
      .font('Helvetica')
      .fillColor('#475569')
      .text('Gross Earnings', 60, currentY + 10);
    doc.text(`₹${grossSalary.toFixed(2)}`, 400, currentY + 10);
    
    currentY += netPayRowHeight;
    
    // Total Deductions
    doc.rect(50, currentY, 500, netPayRowHeight)
      .stroke('#cbd5e1');
    doc.text('Total Deductions', 60, currentY + 10);
    doc.font('Helvetica-Bold')
      .fillColor('#dc2626')
      .text(`(-) ₹${totalDeductions.toFixed(2)}`, 400, currentY + 10);
    
    currentY += netPayRowHeight;
    
    // Total Net Payable
    doc.rect(50, currentY, 500, netPayRowHeight)
      .fillAndStroke('#dcfce7', '#16a34a');
    doc.fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#166534')
      .text('Total Net Payable', 60, currentY + 10);
    doc.text(`₹${netSalary.toFixed(2)}`, 400, currentY + 10);
    
    currentY += netPayRowHeight + 20;
    
    // ========== AMOUNT IN WORDS ==========
    const amountInWords = numberToWords(netSalary);
    doc.fontSize(10)
      .font('Helvetica')
      .fillColor('#475569')
      .text('Total Net Payable', 50, currentY);
    doc.font('Helvetica-Bold')
      .fillColor('#1e293b')
      .text(`₹${netSalary.toFixed(2)}`, 180, currentY);
    doc.font('Helvetica')
      .fillColor('#64748b')
      .text(`(Indian Rupee ${amountInWords})`, 250, currentY);
    
    currentY += 30;
    
    // ========== FORMULA ==========
    doc.fontSize(9)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('Total Net Payable = Gross Earnings - Total Deductions', 50, currentY);
    
    currentY += 30;

    // ========== FOOTER SECTION ==========
    // Payment Method Info (if bank transfer)
    const hasBankDetails = employee.salaryType === 'bank' && 
                          employee.bankDetails && 
                          employee.bankDetails.accountNumber && 
                          employee.bankDetails.accountNumber.trim() !== '';
    
    if (hasBankDetails) {
      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#64748b')
        .text(`Payment Method: Bank Transfer | Account: ${employee.bankDetails.accountNumber} | IFSC: ${employee.bankDetails.ifscCode || 'N/A'}`, 50, currentY, {
          width: 500
        });
      currentY += 15;
    } else {
      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#64748b')
        .text('Payment Method: Cash', 50, currentY);
      currentY += 15;
    }
    
    // Disclaimer
    doc.fontSize(8)
      .font('Helvetica')
      .fillColor('#94a3b8')
      .text('This is a computer-generated payslip.', 50, currentY, { 
        width: 500, 
        align: 'center' 
      });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark salary as paid (set net salary to zero)
// @route   POST /api/salary-transfer/pay/:employeeId
// @access  Private
exports.markSalaryAsPaid = async (req, res) => {
  try {
    const { month, year, bankDetailId } = req.body;
    const employeeId = req.params.employeeId;
    
    const employee = await Employee.findById(employeeId).populate('department', 'name');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const paidAmount = employee.netSalary || 0;

    // Deduct amount from company bank if bankDetailId is provided
    let updatedBank = null;
    if (bankDetailId) {
      const bankDetail = await BankDetail.findById(bankDetailId);
      if (bankDetail) {
        const currentAmount = bankDetail.amount || 0;
        const newAmount = Math.max(0, currentAmount - paidAmount); // Ensure it doesn't go negative
        
        await BankDetail.findByIdAndUpdate(
          bankDetailId,
          { amount: newAmount },
          { runValidators: false }
        );
        
        updatedBank = await BankDetail.findById(bankDetailId);
      }
    }

    // Create payment record
    const payment = await SalaryPayment.create({
      employee: employeeId,
      month: targetMonth,
      year: targetYear,
      amount: paidAmount,
      paymentMethod: employee.salaryType || 'bank',
      fromBank: bankDetailId || null
    });

    // Delete diamond entries for the paid month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    await DiamondEntry.deleteMany({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Reset all salary-related data to zero
    await Employee.findByIdAndUpdate(
      employeeId,
      {
        salary: 0,
        advancedSalary: 0,
        pf: 0,
        pt: 0,
        grossSalary: 0,
        netSalary: 0
      },
      { runValidators: false }
    );

    // Get updated employee data
    const updatedEmployee = await Employee.findById(employeeId)
      .populate('department', 'name')
      .select('-password');

    res.json({
      success: true,
      message: 'Salary marked as paid successfully',
      payment: {
        receiptNumber: payment.receiptNumber,
        amount: paidAmount,
        date: payment.paymentDate
      },
      updatedBank: updatedBank ? {
        _id: updatedBank._id,
        amount: updatedBank.amount,
        accountNumber: updatedBank.accountNumber,
        companyName: updatedBank.companyName
      } : null,
      updatedEmployee: updatedEmployee
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Bulk salary transfer to all employees
// @route   POST /api/salary-transfer/bulk
// @access  Private
exports.bulkSalaryTransfer = async (req, res) => {
  try {
    const { bankDetailId, markAsPaid } = req.body;
    
    const bankDetail = await BankDetail.findById(bankDetailId);
    if (!bankDetail) {
      return res.status(404).json({ message: 'Bank detail not found' });
    }

    const employees = await Employee.find({ isActive: true }).populate('department', 'name');
    const targetMonth = new Date().getMonth() + 1;
    const targetYear = new Date().getFullYear();
    
    const transferSummary = [];
    const paymentRecords = [];
    let totalAmountPaid = 0;

    for (const emp of employees) {
      const transferInfo = {
        employeeId: emp.employeeId,
        name: emp.name,
        department: emp.department?.name || 'N/A',
        netSalary: emp.netSalary || 0,
        accountNumber: emp.bankDetails?.accountNumber || 'Cash',
        ifscCode: emp.bankDetails?.ifscCode || 'N/A',
        bankName: emp.bankDetails?.bankName || 'N/A',
        status: 'Success'
      };

      // Check if employee has bank account (for bank transfer employees)
      if (emp.salaryType === 'bank' && !emp.bankDetails?.accountNumber) {
        transferInfo.status = 'Failed - No Bank Details';
      } else {
        // If markAsPaid is true, mark salary as paid
        if (markAsPaid) {
          try {
            const paidAmount = emp.netSalary || 0;
            totalAmountPaid += paidAmount;

            const payment = await SalaryPayment.create({
              employee: emp._id,
              month: targetMonth,
              year: targetYear,
              amount: paidAmount,
              paymentMethod: emp.salaryType || 'bank',
              fromBank: bankDetailId || null
            });

            // Delete diamond entries for the paid month
            const startDate = new Date(targetYear, targetMonth - 1, 1);
            const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
            await DiamondEntry.deleteMany({
              employee: emp._id,
              date: { $gte: startDate, $lte: endDate }
            });

            // Reset all salary-related data to zero
            await Employee.findByIdAndUpdate(
              emp._id,
              {
                salary: 0,
                advancedSalary: 0,
                pf: 0,
                pt: 0,
                grossSalary: 0,
                netSalary: 0
              },
              { runValidators: false }
            );

            paymentRecords.push({
              employeeId: emp.employeeId,
              receiptNumber: payment.receiptNumber
            });
          } catch (error) {
            transferInfo.status = 'Failed - Payment Record Error';
          }
        }
      }

      transferSummary.push(transferInfo);
    }

    // Deduct total amount from company bank if markAsPaid is true
    let updatedBank = null;
    if (markAsPaid && bankDetailId && totalAmountPaid > 0) {
      const currentAmount = bankDetail.amount || 0;
      const newAmount = Math.max(0, currentAmount - totalAmountPaid); // Ensure it doesn't go negative
      
      await BankDetail.findByIdAndUpdate(
        bankDetailId,
        { amount: newAmount },
        { runValidators: false }
      );
      
      updatedBank = await BankDetail.findById(bankDetailId);
    }

    const totalAmount = employees.reduce((sum, emp) => sum + (emp.netSalary || 0), 0);

    res.json({
      success: true,
      message: markAsPaid 
        ? 'Bulk salary transfer processed and marked as paid (UI only - no actual banking transaction)'
        : 'Bulk salary transfer processed (UI only - no actual banking transaction)',
      summary: {
        totalEmployees: employees.length,
        totalAmount: totalAmount.toFixed(2),
        totalAmountPaid: markAsPaid ? totalAmountPaid.toFixed(2) : '0.00',
        fromBank: bankDetail.companyName,
        fromAccount: bankDetail.accountNumber,
        transfers: transferSummary,
        paymentsMarked: markAsPaid ? paymentRecords.length : 0,
        paymentRecords: markAsPaid ? paymentRecords : []
      },
      updatedBank: updatedBank ? {
        _id: updatedBank._id,
        amount: updatedBank.amount,
        accountNumber: updatedBank.accountNumber,
        companyName: updatedBank.companyName
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get payment history for employee
// @route   GET /api/salary-transfer/payments/:employeeId
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await SalaryPayment.find({ employee: req.params.employeeId })
      .populate('fromBank', 'companyName accountNumber')
      .sort({ paymentDate: -1 });

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
