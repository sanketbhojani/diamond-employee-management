const Employee = require('../models/Employee');
const DiamondEntry = require('../models/DiamondEntry');

// Recalculate gross and net salary for Chutak employees based on diamond entries
const recalculateChutakEmployeeSalary = async (employee) => {
  if (employee.employeeType === 'Chutak') {
    const allEntries = await DiamondEntry.find({ employee: employee._id });
    const totalDailySalary = allEntries.reduce((sum, e) => sum + (e.dailySalary || 0), 0);
    
    // Gross salary = base salary + total daily salary from entries
    const newGrossSalary = (employee.salary || 0) + totalDailySalary;
    const deductions = (employee.advancedSalary || 0) + (employee.pf || 0) + (employee.pt || 0);
    const newNetSalary = newGrossSalary - deductions;
    
    return {
      grossSalary: newGrossSalary,
      netSalary: newNetSalary
    };
  }
  
  // For Fix employees, use base salary
  const deductions = (employee.advancedSalary || 0) + (employee.pf || 0) + (employee.pt || 0);
  return {
    grossSalary: employee.salary || 0,
    netSalary: (employee.salary || 0) - deductions
  };
};

// Update employee salaries in database (if needed)
const updateEmployeeSalaries = async (employeeId) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) return null;
  
  const calculated = await recalculateChutakEmployeeSalary(employee);
  
  // Only update if there's a difference
  if (employee.grossSalary !== calculated.grossSalary || employee.netSalary !== calculated.netSalary) {
    await Employee.findByIdAndUpdate(
      employeeId,
      {
        grossSalary: calculated.grossSalary,
        netSalary: calculated.netSalary
      },
      { runValidators: false }
    );
    return calculated;
  }
  
  return {
    grossSalary: employee.grossSalary,
    netSalary: employee.netSalary
  };
};

module.exports = {
  recalculateChutakEmployeeSalary,
  updateEmployeeSalaries
};






