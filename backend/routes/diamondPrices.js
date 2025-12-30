const express = require('express');
const router = express.Router();
const {
  getDiamondPrices,
  getDiamondPriceForEmployee,
  createDiamondPrice,
  updateDiamondPrice,
  deleteDiamondPrice,
  initializeDefaultPrices
} = require('../controllers/diamondPriceController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDiamondPrices);
router.get('/employee/:employeeId', protect, getDiamondPriceForEmployee);
router.post('/', protect, createDiamondPrice);
router.post('/initialize', protect, initializeDefaultPrices);
router.put('/:id', protect, updateDiamondPrice);
router.delete('/:id', protect, deleteDiamondPrice);

module.exports = router;








