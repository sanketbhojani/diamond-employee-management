const express = require('express');
const router = express.Router();
const {
  getBankDetails,
  getBankDetail,
  createBankDetail,
  updateBankDetail,
  deleteBankDetail
} = require('../controllers/bankDetailController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getBankDetails);
router.get('/:id', protect, getBankDetail);
router.post('/', protect, createBankDetail);
router.put('/:id', protect, updateBankDetail);
router.delete('/:id', protect, deleteBankDetail);

module.exports = router;








