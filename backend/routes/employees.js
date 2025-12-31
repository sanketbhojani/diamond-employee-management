const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByDepartment,
  assignEmployeeToSubDepartment
} = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getEmployees);
router.get('/department/:departmentId', protect, getEmployeesByDepartment);
router.get('/:id', protect, getEmployee);
router.post('/', protect, createEmployee);
router.put('/:id', protect, updateEmployee);
router.delete('/:id', protect, deleteEmployee);
router.put('/:id/assign', protect, assignEmployeeToSubDepartment);

module.exports = router;













