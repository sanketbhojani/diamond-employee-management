const Employee = require('../models/Employee');
const BankDetail = require('../models/BankDetail');
const SalaryPayment = require('../models/SalaryPayment');
const DiamondEntry = require('../models/DiamondEntry');
const PDFDocument = require('pdfkit');

// @desc    Generate salary receipt/invoice for employee
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

    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Salary_Invoice_${employee.employeeId}_${targetMonth}_${targetYear}.pdf`);
    
    doc.pipe(res);

    // Generate Receipt Number
    const receiptNumber = `SR-${targetYear}-${String(Date.now()).slice(-6)}`;

    // Header with border
    doc.rect(50, 50, 500, 100).stroke();
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#1a1a1a');
    doc.text('GOMUKH DIAMOND', 60, 60, { width: 480, align: 'center' });
    doc.fontSize(14).font('Helvetica');
    doc.text('Salary Payment Invoice / Receipt', 60, 85, { width: 480, align: 'center' });
    doc.text('Registered Office Address', 60, 105, { width: 480, align: 'center' });
    doc.moveDown(2);

    // Invoice Details Box
    const startY = 180;
    doc.rect(50, startY, 240, 80).stroke();
    doc.fontSize(10).fillColor('#666');
    doc.text('Invoice To:', 60, startY + 10);
    doc.fontSize(12).fillColor('#000').font('Helvetica-Bold');
    doc.text(employee.name, 60, startY + 25);
    doc.font('Helvetica').fontSize(10);
    doc.text(`ID: ${employee.employeeId}`, 60, startY + 40);
    doc.text(`${employee.department?.name || 'N/A'} - ${employee.subDepartment}`, 60, startY + 55);
    doc.text(`Type: ${employee.employeeType}`, 60, startY + 70);

    // Invoice Info Box
    doc.rect(310, startY, 240, 80).stroke();
    doc.fontSize(10).fillColor('#666');
    doc.text('Invoice Details:', 320, startY + 10);
    doc.fontSize(12).fillColor('#000');
    doc.text(`Invoice No: ${receiptNumber}`, 320, startY + 25);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 320, startY + 40);
    doc.text(`Period: ${monthNames[targetMonth - 1]} ${targetYear}`, 320, startY + 55);
    doc.text(`Status: Paid`, 320, startY + 70);

    doc.moveDown(3);

    // Salary Breakdown Table
    const tableStartY = 300;
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Salary Breakdown', 50, tableStartY);
    
    // Table Header
    doc.rect(50, tableStartY + 20, 500, 25).fillAndStroke('#f0f0f0', '#000');
    doc.fillColor('#000');
    doc.text('Description', 60, tableStartY + 28);
    doc.text('Amount (₹)', 450, tableStartY + 28, { align: 'right' });

    // Table Rows
    let currentY = tableStartY + 45;
    const rowHeight = 25;

    // Gross Salary
    doc.rect(50, currentY, 500, rowHeight).stroke();
    doc.font('Helvetica').fontSize(11);
    doc.text('Gross Salary', 60, currentY + 8);
    doc.text(`₹${(employee.grossSalary || 0).toFixed(2)}`, 450, currentY + 8, { align: 'right' });
    currentY += rowHeight;

    // Deductions Header
    doc.rect(50, currentY, 500, rowHeight).fillAndStroke('#fff5f5', '#000');
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('Deductions:', 60, currentY + 8);
    currentY += rowHeight;

    // Advanced Salary
    doc.rect(50, currentY, 500, rowHeight).stroke();
    doc.font('Helvetica').fontSize(11);
    doc.text('  - Advanced Salary', 60, currentY + 8);
    doc.text(`₹${(employee.advancedSalary || 0).toFixed(2)}`, 450, currentY + 8, { align: 'right' });
    currentY += rowHeight;

    // PF
    doc.rect(50, currentY, 500, rowHeight).stroke();
    doc.text('  - Provident Fund (PF)', 60, currentY + 8);
    doc.text(`₹${(employee.pf || 0).toFixed(2)}`, 450, currentY + 8, { align: 'right' });
    currentY += rowHeight;

    // PT
    doc.rect(50, currentY, 500, rowHeight).stroke();
    doc.text('  - Professional Tax (PT)', 60, currentY + 8);
    doc.text(`₹${(employee.pt || 0).toFixed(2)}`, 450, currentY + 8, { align: 'right' });
    currentY += rowHeight;

    // Total Deductions
    const totalDeductions = (employee.advancedSalary || 0) + (employee.pf || 0) + (employee.pt || 0);
    doc.rect(50, currentY, 500, rowHeight).fillAndStroke('#fff5f5', '#000');
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('Total Deductions', 60, currentY + 8);
    doc.text(`₹${totalDeductions.toFixed(2)}`, 450, currentY + 8, { align: 'right' });
    currentY += rowHeight;

    // Net Salary
    doc.rect(50, currentY, 500, rowHeight + 10).fillAndStroke('#e8f5e9', '#000');
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Net Salary Payable', 60, currentY + 10);
    doc.text(`₹${(employee.netSalary || 0).toFixed(2)}`, 450, currentY + 10, { align: 'right' });

    currentY += rowHeight + 20;

    // Payment Details
    doc.moveDown();
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Payment Details', 50, currentY);
    currentY += 20;
    doc.font('Helvetica').fontSize(11);
    
    if (employee.salaryType === 'bank' && employee.bankDetails?.accountNumber) {
      doc.text(`Payment Method: Bank Transfer`, 50, currentY);
      currentY += 15;
      doc.text(`Account Number: ${employee.bankDetails.accountNumber}`, 50, currentY);
      currentY += 15;
      doc.text(`IFSC Code: ${employee.bankDetails.ifscCode}`, 50, currentY);
      currentY += 15;
      doc.text(`Bank: ${employee.bankDetails.bankName}`, 50, currentY);
      currentY += 15;
      doc.text(`Branch: ${employee.bankDetails.branchName}`, 50, currentY);
    } else {
      doc.text(`Payment Method: Cash`, 50, currentY);
    }

    currentY += 30;

    // Footer
    doc.fontSize(10).fillColor('#666');
    doc.text('This is a computer-generated invoice/receipt.', 50, currentY, { width: 500, align: 'center' });
    currentY += 20;
    doc.text('Thank you for your service!', 50, currentY, { width: 500, align: 'center' });
    currentY += 40;
    
    // Signature Line
    doc.fontSize(10).fillColor('#000');
    doc.text('_________________________', 400, currentY);
    doc.text('Authorized Signatory', 400, currentY + 15, { align: 'right' });
    doc.text('GOMUKH DIAMOND', 400, currentY + 30, { align: 'right' });

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
