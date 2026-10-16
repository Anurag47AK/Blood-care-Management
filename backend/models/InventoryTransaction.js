const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      index: true
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    type: {
      type: String,
      required: true,
      enum: ['ADDITION', 'DEDUCTION', 'RESERVATION', 'RELEASE', 'ADJUSTMENT']
    },
    units: {
      type: Number,
      required: true
    },
    previousStock: {
      type: Number,
      required: true
    },
    newStock: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    relatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      default: null
    },
    relatedDonation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationRecord',
      default: null
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

inventoryTransactionSchema.pre('save', function (next) {
  if (!this.transactionId) {
    const randomHex = Math.floor(10000 + Math.random() * 90000);
    this.transactionId = `TXN-${Date.now().toString().slice(-6)}-${randomHex}`;
  }
  next();
});

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
