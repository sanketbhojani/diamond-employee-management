const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  addSubDepartment,
  updateSubDepartment,
  deleteSubDepartment
} = require('../controllers/departmentController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDepartments);
router.get('/:id', protect, getDepartment);
router.post('/', protect, createDepartment);
router.put('/:id', protect, updateDepartment);
router.delete('/:id', protect, deleteDepartment);
router.post('/:id/subdepartments', protect, addSubDepartment);
router.put('/:id/subdepartments/:subId', protect, updateSubDepartment);
router.delete('/:id/subdepartments/:subId', protect, deleteSubDepartment);

module.exports = router;








