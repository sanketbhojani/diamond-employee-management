const express = require('express');
const router = express.Router();
const {
  getSalaryReport,
  generateSalaryReportPDF,
  generateSalaryReportExcel
} = require('../controllers/salaryReportController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSalaryReport);
router.get('/pdf', protect, generateSalaryReportPDF);
router.get('/excel', protect, generateSalaryReportExcel);

module.exports = router;






