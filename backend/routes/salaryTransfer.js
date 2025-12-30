const express = require('express');
const router = express.Router();
const {
  generateSalaryReceipt,
  bulkSalaryTransfer,
  markSalaryAsPaid,
  getPaymentHistory
} = require('../controllers/salaryTransferController');
const { protect } = require('../middleware/auth');

router.get('/receipt/:employeeId', protect, generateSalaryReceipt);
router.post('/pay/:employeeId', protect, markSalaryAsPaid);
router.post('/bulk', protect, bulkSalaryTransfer);
router.get('/payments/:employeeId', protect, getPaymentHistory);

module.exports = router;

