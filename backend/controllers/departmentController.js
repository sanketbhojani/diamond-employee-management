const mongoose = require('mongoose');
const Department = require('../models/Department');
const Employee = require('../models/Employee');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('subDepartments.employees')
      .populate('manager', 'name employeeId email');
    res.json({
      success: true,
      departments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('subDepartments.employees')
      .populate('manager', 'name employeeId email');
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json({
      success: true,
      department
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private
exports.createDepartment = async (req, res) => {
  try {
    const { name, subDepartments } = req.body;

    const department = await Department.create({
      name,
      subDepartments: subDepartments || []
    });

    res.status(201).json({
      success: true,
      department
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Department already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private
exports.updateDepartment = async (req, res) => {
  try {
    const { name, subDepartments } = req.body;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, subDepartments },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({
      success: true,
      department
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private
exports.deleteDepartment = async (req, res) => {
  try {
    // Check if department has employees
    const employeesCount = await Employee.countDocuments({ department: req.params.id });
    if (employeesCount > 0) {
      return res.status(400).json({ message: 'Cannot delete department with employees. Please reassign employees first.' });
    }

    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add sub-department
// @route   POST /api/departments/:id/subdepartments
// @access  Private
exports.addSubDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    department.subDepartments.push({ name });
    await department.save();

    res.json({
      success: true,
      department
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update sub-department
// @route   PUT /api/departments/:id/subdepartments/:subId
// @access  Private
exports.updateSubDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const subDept = department.subDepartments.id(req.params.subId);
    if (!subDept) {
      return res.status(404).json({ message: 'Sub-department not found' });
    }

    subDept.name = name;
    await department.save();

    res.json({
      success: true,
      department
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete sub-department
// @route   DELETE /api/departments/:id/subdepartments/:subId
// @access  Private
exports.deleteSubDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if sub-department has employees
    const subDept = department.subDepartments.id(req.params.subId);
    if (!subDept) {
      return res.status(404).json({ message: 'Sub-department not found' });
    }

    const employeesCount = await Employee.countDocuments({
      department: req.params.id,
      subDepartment: subDept.name
    });

    if (employeesCount > 0) {
      return res.status(400).json({ message: 'Cannot delete sub-department with employees. Please reassign employees first.' });
    }

    department.subDepartments.pull(req.params.subId);
    await department.save();

    res.json({
      success: true,
      department
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Assign manager to department
// @route   PUT /api/departments/:id/manager
// @access  Private
exports.assignManager = async (req, res) => {
  try {
    const { managerId } = req.body;
    const departmentId = req.params.id;
    
    console.log('Assign Manager - Request received:', {
      departmentId,
      managerId,
      body: req.body
    });

    // Validate department ID format
    if (!departmentId || departmentId === 'undefined' || departmentId === 'null') {
      return res.status(400).json({ message: 'Invalid department ID' });
    }

    // Validate MongoDB ObjectId format for department
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: 'Invalid department ID format' });
    }

    // Find department
    const department = await Department.findById(departmentId);
    if (!department) {
      console.log('Department not found:', departmentId);
      return res.status(404).json({ message: 'Department not found. Please refresh the page and try again.' });
    }

    // If managerId is provided, verify the employee exists and belongs to this department
    if (managerId && managerId !== 'null' && managerId !== '' && managerId !== 'undefined') {
      // Validate employee ID format - must be valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(managerId)) {
        return res.status(400).json({ message: 'Invalid employee ID format' });
      }

      const employee = await Employee.findById(managerId);
      if (!employee) {
        console.log('Employee not found:', managerId);
        return res.status(404).json({ message: 'Employee not found. Please refresh the page and try again.' });
      }
      
      // Get employee's department ID (handle both populated and non-populated)
      if (!employee.department) {
        return res.status(400).json({ 
          message: 'Employee does not have a department assigned' 
        });
      }
      
      // Normalize department ID to string for comparison
      // Since Employee.findById doesn't populate, department will be an ObjectId
      // Convert both IDs to strings for reliable comparison
      const employeeDeptId = employee.department.toString();
      const deptIdStr = departmentId.toString();
      
      console.log('Comparing department IDs:', {
        employeeDeptId,
        deptIdStr,
        employeeDeptIdType: typeof employeeDeptId,
        deptIdStrType: typeof deptIdStr,
        match: employeeDeptId === deptIdStr
      });
      
      if (employeeDeptId !== deptIdStr) {
        console.log('Department ID mismatch - Employee department:', employeeDeptId, 'Target department:', deptIdStr);
        return res.status(400).json({ 
          message: 'Employee must belong to this department to be assigned as manager' 
        });
      }
      
      department.manager = managerId;
      console.log('Setting manager:', managerId);
    } else {
      // Remove manager if managerId is empty/null
      department.manager = null;
      console.log('Removing manager');
    }

    await department.save();
    await department.populate('manager', 'name employeeId email');

    console.log('Manager assignment successful:', {
      departmentId: department._id,
      manager: department.manager ? department.manager.name : 'None'
    });

    res.json({
      success: true,
      message: department.manager ? 'Manager assigned successfully' : 'Manager removed successfully',
      department
    });
  } catch (error) {
    console.error('Error in assignManager:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};













