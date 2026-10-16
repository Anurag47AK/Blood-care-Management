const express = require('express');
const router = express.Router();
const {
  getInventory,
  addStock,
  issueStock,
  adjustStock,
  getInventoryTransactions
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validateInventoryOperation } = require('../middleware/validator');

// Public overview of inventory status
router.get('/', getInventory);

// Admin operations
router.post('/add', protect, authorize('admin'), validateInventoryOperation, addStock);
router.post('/issue', protect, authorize('admin'), validateInventoryOperation, issueStock);
router.patch('/adjust', protect, authorize('admin'), validateInventoryOperation, adjustStock);
router.get('/transactions', protect, authorize('admin'), getInventoryTransactions);

module.exports = router;
