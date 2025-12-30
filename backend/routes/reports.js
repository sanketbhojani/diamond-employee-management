const express = require('express');
const router = express.Router();
const {
  getDepartmentWiseReport,
  getMonthlyReport,
  getYearlyReport,
  getTotalEmployeeReport,
  exportEmployeesExcel,
  exportEmployeesPDF,
  exportDepartmentsExcel,
  exportDepartmentsPDF
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/department-wise', protect, getDepartmentWiseReport);
router.get('/monthly', protect, getMonthlyReport);
router.get('/yearly', protect, getYearlyReport);
router.get('/employees', protect, getTotalEmployeeReport);
router.get('/export/employees/excel', protect, exportEmployeesExcel);
router.get('/export/employees/pdf', protect, exportEmployeesPDF);
router.get('/export/departments/excel', protect, exportDepartmentsExcel);
router.get('/export/departments/pdf', protect, exportDepartmentsPDF);

module.exports = router;








