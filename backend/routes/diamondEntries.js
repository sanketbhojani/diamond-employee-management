const express = require('express');
const router = express.Router();
const {
  getDiamondEntries,
  getDiamondEntry,
  createDiamondEntry,
  updateDiamondEntry,
  deleteDiamondEntry,
  getEmployeeSalarySummary,
  getDepartmentMonthlySalary
} = require('../controllers/diamondEntryController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDiamondEntries);
router.get('/employee/:employeeId/salary', protect, getEmployeeSalarySummary);
router.get('/department/:departmentId/monthly-salary', protect, getDepartmentMonthlySalary);
router.get('/:id', protect, getDiamondEntry);
router.post('/', protect, createDiamondEntry);
router.put('/:id', protect, updateDiamondEntry);
router.delete('/:id', protect, deleteDiamondEntry);

module.exports = router;

