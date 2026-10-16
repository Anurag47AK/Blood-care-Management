const mongoose = require('mongoose');

const donationRecordSchema = new mongoose.Schema(
  {
    donationId: {
      type: String,
      unique: true,
      index: true
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    donorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonorProfile',
      required: true
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    units: {
      type: Number,
      default: 1,
      min: 1
    },
    donationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true
    },
    hospitalOrCamp: {
      type: String,
      default: 'Central Blood Bank'
    },
    diseaseOrHealthNotes: {
      type: String,
      default: 'None reported / Standard donor screening completed'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    inventoryUpdated: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

donationRecordSchema.pre('save', function (next) {
  if (!this.donationId) {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    this.donationId = `DON-${Date.now().toString().slice(-6)}-${randomHex}`;
  }
  next();
});

module.exports = mongoose.model('DonationRecord', donationRecordSchema);
