const DiamondPrice = require('../models/DiamondPrice');
const Department = require('../models/Department');

// @desc    Get all diamond prices
// @route   GET /api/diamond-prices
// @access  Private
exports.getDiamondPrices = async (req, res) => {
  try {
    const { department, subDepartment } = req.query;
    
    let query = {};
    if (department) {
      query.department = department;
    }
    if (subDepartment) {
      query.subDepartment = subDepartment;
    }

    const prices = await DiamondPrice.find(query).populate('department', 'name');
    res.json({
      success: true,
      prices
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get diamond price for employee's department
// @route   GET /api/diamond-prices/employee/:employeeId
// @access  Private
exports.getDiamondPriceForEmployee = async (req, res) => {
  try {
    const Employee = require('../models/Employee');
    const employee = await Employee.findById(req.params.employeeId).populate('department');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Try to find department/sub-department specific price first
    let price = await DiamondPrice.findOne({
      department: employee.department._id,
      subDepartment: employee.subDepartment
    });

    // If not found, try department-specific price
    if (!price) {
      price = await DiamondPrice.findOne({
        department: employee.department._id,
        subDepartment: null
      });
    }

    // If still not found, get default price
    if (!price) {
      price = await DiamondPrice.findOne({
        isDefault: true
      });
    }

    res.json({
      success: true,
      price
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create diamond price
// @route   POST /api/diamond-prices
// @access  Private
exports.createDiamondPrice = async (req, res) => {
  try {
    const { category, price, department, subDepartment, isDefault } = req.body;

    // If setting as default, unset other defaults for same category
    if (isDefault) {
      await DiamondPrice.updateMany(
        { category, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const diamondPrice = await DiamondPrice.create({
      category: category.toUpperCase(),
      price,
      department: department || null,
      subDepartment: subDepartment || null,
      isDefault: isDefault || false
    });

    res.status(201).json({
      success: true,
      price: diamondPrice
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update diamond price
// @route   PUT /api/diamond-prices/:id
// @access  Private
exports.updateDiamondPrice = async (req, res) => {
  try {
    const { category, price, department, subDepartment, isDefault } = req.body;

    // If setting as default, unset other defaults for same category
    if (isDefault) {
      await DiamondPrice.updateMany(
        { category, isDefault: true, _id: { $ne: req.params.id } },
        { $set: { isDefault: false } }
      );
    }

    const diamondPrice = await DiamondPrice.findByIdAndUpdate(
      req.params.id,
      {
        category: category ? category.toUpperCase() : undefined,
        price,
        department: department || null,
        subDepartment: subDepartment || null,
        isDefault
      },
      { new: true, runValidators: true }
    ).populate('department', 'name');

    if (!diamondPrice) {
      return res.status(404).json({ message: 'Diamond price not found' });
    }

    res.json({
      success: true,
      price: diamondPrice
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete diamond price
// @route   DELETE /api/diamond-prices/:id
// @access  Private
exports.deleteDiamondPrice = async (req, res) => {
  try {
    const diamondPrice = await DiamondPrice.findByIdAndDelete(req.params.id);
    if (!diamondPrice) {
      return res.status(404).json({ message: 'Diamond price not found' });
    }

    res.json({
      success: true,
      message: 'Diamond price deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Initialize default diamond prices
// @route   POST /api/diamond-prices/initialize
// @access  Private
exports.initializeDefaultPrices = async (req, res) => {
  try {
    const defaultPrices = [
      { category: 'A', price: 2.60, isDefault: true },
      { category: 'B', price: 3.0, isDefault: true },
      { category: 'C', price: 3.60, isDefault: true },
      { category: 'D', price: 4.0, isDefault: true }
    ];

    // Check if defaults already exist
    const existingDefaults = await DiamondPrice.find({ isDefault: true });
    if (existingDefaults.length > 0) {
      return res.status(400).json({ message: 'Default prices already exist' });
    }

    const prices = await DiamondPrice.insertMany(defaultPrices);

    res.status(201).json({
      success: true,
      prices
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};







