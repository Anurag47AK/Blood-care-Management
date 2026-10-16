const BloodInventory = require('../models/BloodInventory');
const InventoryTransaction = require('../models/InventoryTransaction');
const { recordAuditLog } = require('../services/auditService');
const { executeWithTransactionOrFallback } = require('../services/transactionService');
const { createNotification } = require('../services/notificationService');
const User = require('../models/User');

// @desc    Get complete blood inventory status with alert thresholds
// @route   GET /api/inventory
// @access  Public (summary) / Admin (detailed)
const getInventory = async (req, res, next) => {
  try {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    let inventory = await BloodInventory.find();

    // Ensure all 8 blood groups exist in DB
    if (inventory.length < 8) {
      for (const group of bloodGroups) {
        const exists = inventory.some((item) => item.bloodGroup === group);
        if (!exists) {
          await BloodInventory.create({ bloodGroup: group, unitsAvailable: 0 });
        }
      }
      inventory = await BloodInventory.find().sort({ bloodGroup: 1 });
    }

    const totalUnits = inventory.reduce((acc, curr) => acc + curr.unitsAvailable, 0);
    const lowStockAlerts = inventory.filter(
      (item) => item.unitsAvailable > item.criticalThreshold && item.unitsAvailable <= item.lowStockThreshold
    );
    const criticalStockAlerts = inventory.filter(
      (item) => item.unitsAvailable <= item.criticalThreshold
    );

    res.status(200).json({
      success: true,
      totalUnits,
      lowStockCount: lowStockAlerts.length,
      criticalStockCount: criticalStockAlerts.length,
      inventory: inventory.map((item) => ({
        id: item._id,
        bloodGroup: item.bloodGroup,
        unitsAvailable: item.unitsAvailable,
        reservedUnits: item.reservedUnits,
        lowStockThreshold: item.lowStockThreshold,
        criticalThreshold: item.criticalThreshold,
        status:
          item.unitsAvailable <= item.criticalThreshold
            ? 'Critical'
            : item.unitsAvailable <= item.lowStockThreshold
              ? 'Low Stock'
              : 'Sufficient',
        lastUpdated: item.lastUpdated
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add blood units to stock (Atomic / Transactional)
// @route   POST /api/inventory/add
// @access  Private (Admin)
const addStock = async (req, res, next) => {
  try {
    const { bloodGroup, units, reason = 'Direct blood bank stock intake', notes } = req.body;
    const parsedUnits = Number(units);

    if (!bloodGroup || !parsedUnits || parsedUnits <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid blood group and positive unit count.'
      });
    }

    const result = await executeWithTransactionOrFallback(async (session) => {
      const opts = session ? { session } : {};

      let item = await BloodInventory.findOne({ bloodGroup }, null, opts);
      if (!item) {
        item = new BloodInventory({ bloodGroup, unitsAvailable: 0 });
      }

      const previousStock = item.unitsAvailable;
      const newStock = previousStock + parsedUnits;

      item.unitsAvailable = newStock;
      item.lastUpdated = new Date();
      item.lastUpdatedBy = req.user._id;
      await item.save(opts);

      const [transaction] = await InventoryTransaction.create(
        [
          {
            bloodGroup,
            type: 'ADDITION',
            units: parsedUnits,
            previousStock,
            newStock,
            reason,
            performedBy: req.user._id,
            notes: notes || ''
          }
        ],
        opts
      );

      return { item, transaction, previousStock, newStock };
    });

    await recordAuditLog({
      action: 'INVENTORY_ADDITION',
      user: req.user,
      targetEntity: 'BloodInventory',
      targetId: result.item._id.toString(),
      details: {
        bloodGroup,
        units: parsedUnits,
        previousStock: result.previousStock,
        newStock: result.newStock,
        reason
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully added ${parsedUnits} unit(s) of ${bloodGroup} blood to inventory.`,
      inventory: result.item,
      transaction: result.transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Issue / deduct blood units from stock safely (Atomic / Transactional)
// @route   POST /api/inventory/issue
// @access  Private (Admin)
const issueStock = async (req, res, next) => {
  try {
    const {
      bloodGroup,
      units,
      reason = 'Issued for hospital transfusion',
      relatedRequest,
      notes
    } = req.body;

    const parsedUnits = Number(units);
    if (!bloodGroup || !parsedUnits || parsedUnits <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid blood group and positive unit count.'
      });
    }

    const result = await executeWithTransactionOrFallback(async (session) => {
      const opts = session ? { session } : {};

      // Atomic deduction check with $gte to prevent negative inventory & race conditions
      const updatedItem = await BloodInventory.findOneAndUpdate(
        { bloodGroup, unitsAvailable: { $gte: parsedUnits } },
        {
          $inc: { unitsAvailable: -parsedUnits },
          $set: { lastUpdated: new Date(), lastUpdatedBy: req.user._id }
        },
        { new: false, ...opts } // Return doc before deduction so we know exact previousStock
      );

      if (!updatedItem) {
        const current = await BloodInventory.findOne({ bloodGroup });
        const currentStock = current ? current.unitsAvailable : 0;
        const err = new Error(
          `Insufficient stock for ${bloodGroup}. Available: ${currentStock} units, Requested: ${parsedUnits} units.`
        );
        err.statusCode = 400;
        throw err;
      }

      const previousStock = updatedItem.unitsAvailable;
      const newStock = previousStock - parsedUnits;

      const [transaction] = await InventoryTransaction.create(
        [
          {
            bloodGroup,
            type: 'DEDUCTION',
            units: parsedUnits,
            previousStock,
            newStock,
            reason,
            relatedRequest: relatedRequest || null,
            performedBy: req.user._id,
            notes: notes || ''
          }
        ],
        opts
      );

      return { updatedItem, transaction, previousStock, newStock };
    });

    await recordAuditLog({
      action: 'INVENTORY_DEDUCTION',
      user: req.user,
      targetEntity: 'BloodInventory',
      targetId: result.updatedItem._id.toString(),
      details: {
        bloodGroup,
        units: parsedUnits,
        previousStock: result.previousStock,
        newStock: result.newStock,
        reason
      }
    });

    // Alert admins if stock reached low or critical threshold
    if (result.newStock <= 5) {
      const admins = await User.find({ role: 'admin' });
      for (const adm of admins) {
        await createNotification({
          recipient: adm._id,
          title: `Low Stock Warning: ${bloodGroup}`,
          message: `${bloodGroup} blood stock is now at ${result.newStock} units (Threshold: <= 5).`,
          type: 'STOCK_ALERT',
          relatedEntity: 'BloodInventory',
          relatedId: bloodGroup
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully issued ${parsedUnits} unit(s) of ${bloodGroup}. Remaining: ${result.newStock} units.`,
      previousStock: result.previousStock,
      newStock: result.newStock,
      transaction: result.transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust inventory count with recorded justification
// @route   PATCH /api/inventory/adjust
// @access  Private (Admin)
const adjustStock = async (req, res, next) => {
  try {
    const { bloodGroup, newUnits, reason } = req.body;
    const parsedUnits = Number(newUnits);

    if (!bloodGroup || isNaN(parsedUnits) || parsedUnits < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bloodGroup and non-negative target units.'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'A mandatory audit reason is required for manual stock adjustment.'
      });
    }

    const result = await executeWithTransactionOrFallback(async (session) => {
      const opts = session ? { session } : {};

      const item = await BloodInventory.findOne({ bloodGroup }, null, opts);
      const previousStock = item ? item.unitsAvailable : 0;
      const diff = parsedUnits - previousStock;

      const updated = await BloodInventory.findOneAndUpdate(
        { bloodGroup },
        {
          $set: {
            unitsAvailable: parsedUnits,
            lastUpdated: new Date(),
            lastUpdatedBy: req.user._id
          }
        },
        { new: true, upsert: true, ...opts }
      );

      const [transaction] = await InventoryTransaction.create(
        [
          {
            bloodGroup,
            type: 'ADJUSTMENT',
            units: Math.abs(diff),
            previousStock,
            newStock: parsedUnits,
            reason: `Manual Adjustment: ${reason}`,
            performedBy: req.user._id
          }
        ],
        opts
      );

      return { updated, transaction, previousStock, parsedUnits };
    });

    await recordAuditLog({
      action: 'INVENTORY_ADJUSTED',
      user: req.user,
      targetEntity: 'BloodInventory',
      targetId: result.updated._id.toString(),
      details: {
        bloodGroup,
        previousStock: result.previousStock,
        newStock: result.parsedUnits,
        reason
      }
    });

    res.status(200).json({
      success: true,
      message: `Stock for ${bloodGroup} adjusted to ${result.parsedUnits} units.`,
      inventory: result.updated,
      transaction: result.transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory transactions history with pagination, filters, sorting
// @route   GET /api/inventory/transactions
// @access  Private (Admin)
const getInventoryTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const { bloodGroup, type, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (type) query.type = type;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await InventoryTransaction.countDocuments(query);
    const transactions = await InventoryTransaction.find(query)
      .populate('performedBy', 'name email role')
      .populate('relatedRequest', 'requestId patientName hospitalName')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: transactions.length,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  addStock,
  issueStock,
  adjustStock,
  getInventoryTransactions
};
