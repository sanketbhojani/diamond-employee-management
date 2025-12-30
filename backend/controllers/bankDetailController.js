const BankDetail = require('../models/BankDetail');

// @desc    Get all bank details
// @route   GET /api/bank-details
// @access  Private
exports.getBankDetails = async (req, res) => {
  try {
    const bankDetails = await BankDetail.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      bankDetails
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single bank detail
// @route   GET /api/bank-details/:id
// @access  Private
exports.getBankDetail = async (req, res) => {
  try {
    const bankDetail = await BankDetail.findById(req.params.id);
    if (!bankDetail) {
      return res.status(404).json({ message: 'Bank detail not found' });
    }
    res.json({
      success: true,
      bankDetail
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create bank detail
// @route   POST /api/bank-details
// @access  Private
exports.createBankDetail = async (req, res) => {
  try {
    const bankData = req.body;
    if (bankData.amount) {
      bankData.amount = parseFloat(bankData.amount);
    }
    const bankDetail = await BankDetail.create(bankData);
    res.status(201).json({
      success: true,
      bankDetail
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update bank detail
// @route   PUT /api/bank-details/:id
// @access  Private
exports.updateBankDetail = async (req, res) => {
  try {
    const bankData = req.body;
    if (bankData.amount !== undefined) {
      bankData.amount = parseFloat(bankData.amount);
    }
    const bankDetail = await BankDetail.findByIdAndUpdate(
      req.params.id,
      bankData,
      { new: true, runValidators: true }
    );

    if (!bankDetail) {
      return res.status(404).json({ message: 'Bank detail not found' });
    }

    res.json({
      success: true,
      bankDetail
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete bank detail
// @route   DELETE /api/bank-details/:id
// @access  Private
exports.deleteBankDetail = async (req, res) => {
  try {
    const bankDetail = await BankDetail.findByIdAndDelete(req.params.id);
    if (!bankDetail) {
      return res.status(404).json({ message: 'Bank detail not found' });
    }

    res.json({
      success: true,
      message: 'Bank detail deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

