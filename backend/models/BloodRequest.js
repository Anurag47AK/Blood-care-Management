const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      index: true
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    patientName: {
      type: String,
      required: [true, 'Please provide the patient name'],
      trim: true
    },
    bloodGroup: {
      type: String,
      required: [true, 'Please select the required blood group'],
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        message: '{VALUE} is not a valid blood group'
      }
    },
    unitsRequired: {
      type: Number,
      required: [true, 'Please specify the number of units required'],
      min: [1, 'Must request at least 1 unit'],
      max: [10, 'Single request cannot exceed 10 units']
    },
    hospitalName: {
      type: String,
      required: [true, 'Please specify the hospital or medical center'],
      trim: true
    },
    hospitalAddress: {
      type: String,
      required: [true, 'Please provide hospital address / ward details'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Please specify the city'],
      trim: true
    },
    urgency: {
      type: String,
      enum: {
        values: ['Normal', 'Urgent', 'Critical'],
        message: '{VALUE} is not a recognized urgency level'
      },
      default: 'Normal'
    },
    requiredDate: {
      type: Date,
      required: [true, 'Please specify the date blood is needed by']
    },
    contactName: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true
    },
    reason: {
      type: String,
      required: [true, 'Please state the medical reason or procedure'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Fulfilled', 'Rejected', 'Cancelled'],
      default: 'Pending',
      index: true
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvalDate: {
      type: Date,
      default: null
    },
    fulfilledDate: {
      type: Date,
      default: null
    },
    cancelledDate: {
      type: Date,
      default: null
    },
    cancellationReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate human-readable unique request ID
bloodRequestSchema.pre('save', async function (next) {
  if (!this.requestId) {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    this.requestId = `REQ-${dateStr}-${randomHex}`;
  }
  next();
});

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
