const mongoose = require('mongoose');

const bloodInventorySchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      required: true,
      unique: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    unitsAvailable: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Units available cannot be negative']
    },
    reservedUnits: {
      type: Number,
      default: 0,
      min: [0, 'Reserved units cannot be negative']
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    },
    criticalThreshold: {
      type: Number,
      default: 2
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('BloodInventory', bloodInventorySchema);
