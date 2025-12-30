const Employee = require('../models/Employee');
const Department = require('../models/Department');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ isActive: true });
    const totalDepartments = await Department.countDocuments();
    
    const employees = await Employee.find({ isActive: true });
    const totalSalaryPaid = employees.reduce((sum, emp) => {
      return sum + (emp.netSalary || 0);
    }, 0);

    res.json({
      success: true,
      stats: {
        totalEmployees,
        totalDepartments,
        totalSalaryPaid: totalSalaryPaid.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};






