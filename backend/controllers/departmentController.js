const Department = require('../models/Department');
const Employee = require('../models/Employee');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('subDepartments.employees');
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
    const department = await Department.findById(req.params.id).populate('subDepartments.employees');
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






