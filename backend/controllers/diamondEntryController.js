const DiamondEntry = require('../models/DiamondEntry');
const Employee = require('../models/Employee');
const DiamondPrice = require('../models/DiamondPrice');

// @desc    Get all diamond entries
// @route   GET /api/diamond-entries
// @access  Private
exports.getDiamondEntries = async (req, res) => {
  try {
    const { employee, startDate, endDate, department } = req.query;
    
    let query = {};
    if (employee) {
      query.employee = employee;
    }
    if (department) {
      const employees = await Employee.find({ department, isActive: true });
      query.employee = { $in: employees.map(emp => emp._id) };
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await DiamondEntry.find(query)
      .populate('employee', 'name employeeId department subDepartment employeeType grossSalary netSalary')
      .populate('employee.department', 'name')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: entries.length,
      entries
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single diamond entry
// @route   GET /api/diamond-entries/:id
// @access  Private
exports.getDiamondEntry = async (req, res) => {
  try {
    const entry = await DiamondEntry.findById(req.params.id).populate('employee');
    if (!entry) {
      return res.status(404).json({ message: 'Diamond entry not found' });
    }
    res.json({
      success: true,
      entry
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create diamond entry
// @route   POST /api/diamond-entries
// @access  Private
exports.createDiamondEntry = async (req, res) => {
  try {
    const { employee, date, category, quantity } = req.body;

    // Get employee details
    const employeeDoc = await Employee.findById(employee).populate('department');
    if (!employeeDoc) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get diamond price for employee's department
    let diamondPrice = await DiamondPrice.findOne({
      department: employeeDoc.department._id,
      subDepartment: employeeDoc.subDepartment,
      category: category.toUpperCase()
    });

    if (!diamondPrice) {
      diamondPrice = await DiamondPrice.findOne({
        department: employeeDoc.department._id,
        subDepartment: null,
        category: category.toUpperCase()
      });
    }

    if (!diamondPrice) {
      diamondPrice = await DiamondPrice.findOne({
        category: category.toUpperCase(),
        isDefault: true
      });
    }

    if (!diamondPrice) {
      return res.status(400).json({ message: `Diamond price not found for category ${category}` });
    }

    const entry = await DiamondEntry.create({
      employee,
      date: date || new Date(),
      category: category.toUpperCase(),
      quantity,
      diamondPrice: diamondPrice.price
    });

    // Update employee gross salary for Chutak employees
    if (employeeDoc.employeeType === 'Chutak') {
      const allEntries = await DiamondEntry.find({ employee: employeeDoc._id });
      const totalDailySalary = allEntries.reduce((sum, e) => sum + (e.dailySalary || 0), 0);
      
      // Gross salary = base salary + total daily salary from entries
      const newGrossSalary = (employeeDoc.salary || 0) + totalDailySalary;
      const deductions = (employeeDoc.advancedSalary || 0) + (employeeDoc.pf || 0) + (employeeDoc.pt || 0);
      const newNetSalary = newGrossSalary - deductions;
      
      await Employee.findByIdAndUpdate(
        employeeDoc._id,
        {
          grossSalary: newGrossSalary,
          netSalary: newNetSalary
        },
        { runValidators: false }
      );
    }

    const populatedEntry = await DiamondEntry.findById(entry._id)
      .populate('employee', 'name employeeId department subDepartment employeeType grossSalary netSalary')
      .populate('employee.department', 'name');

    res.status(201).json({
      success: true,
      entry: populatedEntry
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update diamond entry
// @route   PUT /api/diamond-entries/:id
// @access  Private
exports.updateDiamondEntry = async (req, res) => {
  try {
    const { employee, date, category, quantity } = req.body;

    const entry = await DiamondEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Diamond entry not found' });
    }

    // Get diamond price if category changed
    let diamondPrice = entry.diamondPrice;
    if (category && category !== entry.category) {
      const employeeDoc = await Employee.findById(employee || entry.employee).populate('department');
      if (employeeDoc) {
        let priceDoc = await DiamondPrice.findOne({
          department: employeeDoc.department._id,
          subDepartment: employeeDoc.subDepartment,
          category: category.toUpperCase()
        });

        if (!priceDoc) {
          priceDoc = await DiamondPrice.findOne({
            category: category.toUpperCase(),
            isDefault: true
          });
        }

        if (priceDoc) {
          diamondPrice = priceDoc.price;
        }
      }
    }

    await DiamondEntry.findByIdAndUpdate(
      req.params.id,
      {
        employee: employee || entry.employee,
        date: date || entry.date,
        category: category ? category.toUpperCase() : entry.category,
        quantity: quantity !== undefined ? quantity : entry.quantity,
        diamondPrice
      },
      { new: true, runValidators: true }
    );

    // Update employee salary for Chutak employees after entry update
    const employeeId = employee || entry.employee;
    const employeeDoc = await Employee.findById(employeeId);
    if (employeeDoc && employeeDoc.employeeType === 'Chutak') {
      const allEntries = await DiamondEntry.find({ employee: employeeDoc._id });
      const totalDailySalary = allEntries.reduce((sum, e) => sum + (e.dailySalary || 0), 0);
      
      const newGrossSalary = (employeeDoc.salary || 0) + totalDailySalary;
      const deductions = (employeeDoc.advancedSalary || 0) + (employeeDoc.pf || 0) + (employeeDoc.pt || 0);
      const newNetSalary = newGrossSalary - deductions;
      
      await Employee.findByIdAndUpdate(
        employeeDoc._id,
        {
          grossSalary: newGrossSalary,
          netSalary: newNetSalary
        },
        { runValidators: false }
      );
    }

    const updatedEntry = await DiamondEntry.findById(req.params.id).populate('employee');

    res.json({
      success: true,
      entry: updatedEntry
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete diamond entry
// @route   DELETE /api/diamond-entries/:id
// @access  Private
exports.deleteDiamondEntry = async (req, res) => {
  try {
    const entry = await DiamondEntry.findById(req.params.id).populate('employee');
    if (!entry) {
      return res.status(404).json({ message: 'Diamond entry not found' });
    }

    const employeeDoc = entry.employee;
    
    await DiamondEntry.findByIdAndDelete(req.params.id);

    // Update employee gross salary for Chutak employees after deletion
    if (employeeDoc && employeeDoc.employeeType === 'Chutak') {
      const allEntries = await DiamondEntry.find({ employee: employeeDoc._id });
      const totalDailySalary = allEntries.reduce((sum, e) => sum + (e.dailySalary || 0), 0);
      
      // Gross salary = base salary + total daily salary from remaining entries
      const newGrossSalary = (employeeDoc.salary || 0) + totalDailySalary;
      const deductions = (employeeDoc.advancedSalary || 0) + (employeeDoc.pf || 0) + (employeeDoc.pt || 0);
      const newNetSalary = newGrossSalary - deductions;
      
      await Employee.findByIdAndUpdate(
        employeeDoc._id,
        {
          grossSalary: newGrossSalary,
          netSalary: newNetSalary
        },
        { runValidators: false }
      );
    }

    res.json({
      success: true,
      message: 'Diamond entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get salary summary for Chutak employee
// @route   GET /api/diamond-entries/employee/:employeeId/salary
// @access  Private
exports.getEmployeeSalarySummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const employee = await Employee.findById(req.params.employeeId);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.employeeType !== 'Chutak') {
      return res.status(400).json({ message: 'Employee is not a Chutak type employee' });
    }

    let query = { employee: req.params.employeeId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await DiamondEntry.find(query);
    
    const summary = {
      totalEntries: entries.length,
      totalDailySalary: entries.reduce((sum, e) => sum + (e.dailySalary || 0), 0),
      totalMonthlySalary: entries.reduce((sum, e) => sum + (e.monthlySalary || 0), 0),
      totalYearlySalary: entries.reduce((sum, e) => sum + (e.yearlySalary || 0), 0)
    };

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get monthly salary summary for Chutak employees by department
// @route   GET /api/diamond-entries/department/:departmentId/monthly-salary
// @access  Private
exports.getDepartmentMonthlySalary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const departmentId = req.params.departmentId;
    
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();
    
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    
    // Get all Chutak employees in the department
    const employees = await Employee.find({
      department: departmentId,
      employeeType: 'Chutak',
      isActive: true
    }).populate('department', 'name');
    
    const monthlySalaries = [];
    
    for (const employee of employees) {
      const entries = await DiamondEntry.find({
        employee: employee._id,
        date: { $gte: startDate, $lte: endDate }
      });
      
      // Calculate actual monthly salary from daily entries (sum of all daily salaries in the month)
      const totalMonthlySalary = entries.reduce((sum, e) => {
        return sum + (e.dailySalary || 0);
      }, 0);
      
      monthlySalaries.push({
        employeeId: employee.employeeId,
        name: employee.name,
        department: employee.department.name,
        subDepartment: employee.subDepartment,
        totalEntries: entries.length,
        monthlySalary: totalMonthlySalary
      });
    }
    
    const totalSalary = monthlySalaries.reduce((sum, emp) => sum + emp.monthlySalary, 0);
    
    res.json({
      success: true,
      month: targetMonth,
      year: targetYear,
      department: employees[0]?.department?.name || 'Unknown',
      employees: monthlySalaries,
      totalSalary: totalSalary.toFixed(2),
      employeeCount: monthlySalaries.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
