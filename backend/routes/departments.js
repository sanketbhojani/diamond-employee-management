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
  deleteSubDepartment,
  assignManager
} = require('../controllers/departmentController');
const { protect } = require('../middleware/auth');

// Specific routes must come before generic :id routes
router.get('/', protect, getDepartments);
router.post('/', protect, createDepartment);
// Manager assignment route - must be before generic :id routes
router.put('/:id/manager', protect, assignManager);
router.post('/:id/subdepartments', protect, addSubDepartment);
router.put('/:id/subdepartments/:subId', protect, updateSubDepartment);
router.delete('/:id/subdepartments/:subId', protect, deleteSubDepartment);
// Generic routes come last
router.get('/:id', protect, getDepartment);
router.put('/:id', protect, updateDepartment);
router.delete('/:id', protect, deleteDepartment);

module.exports = router;













