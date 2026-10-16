const mongoose = require('mongoose');

const donorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    bloodGroup: {
      type: String,
      required: [true, 'Please select your blood group'],
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        message: '{VALUE} is not a valid blood group'
      }
    },
    age: {
      type: Number,
      required: [true, 'Please enter your age'],
      min: [18, 'Donors must be at least 18 years old'],
      max: [65, 'Donors must be under 65 years old']
    },
    gender: {
      type: String,
      required: [true, 'Please select gender'],
      enum: ['Male', 'Female', 'Other']
    },
    weight: {
      type: Number,
      required: [true, 'Please enter weight in kg'],
      min: [45, 'Weight must be at least 45 kg to donate blood']
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    lastDonationDate: {
      type: Date,
      default: null
    },
    eligibilityStatus: {
      type: String,
      enum: ['Eligible', 'Ineligible', 'Pending Medical Review'],
      default: 'Eligible'
    },
    eligibilityNotes: {
      type: String,
      default: 'Self-reported healthy. Subject to on-site hemoglobin and health verification before donation.'
    },
    totalDonations: {
      type: Number,
      default: 0,
      min: 0
    },
    medicalConditions: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Virtual calculation for days since last donation
donorProfileSchema.virtual('daysSinceLastDonation').get(function () {
  if (!this.lastDonationDate) return null;
  const diffTime = Math.abs(Date.now() - new Date(this.lastDonationDate).getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('DonorProfile', donorProfileSchema);
