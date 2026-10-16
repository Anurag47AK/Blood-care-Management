/**
 * Blood Care Management System - Database Seeder Script
 * Pre-populates the database with realistic, fictional college demonstration data.
 * All donor names, phone numbers, and patient details are fictional placeholders.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const BloodRequest = require('../models/BloodRequest');
const BloodInventory = require('../models/BloodInventory');
const DonationRecord = require('../models/DonationRecord');
const InventoryTransaction = require('../models/InventoryTransaction');
const AuditLog = require('../models/AuditLog');

const seedData = async () => {
  try {
    console.log('[Seeder] Connecting to database...');
    await connectDB();

    console.log('[Seeder] Clearing existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      DonorProfile.deleteMany({}),
      BloodRequest.deleteMany({}),
      BloodInventory.deleteMany({}),
      DonationRecord.deleteMany({}),
      InventoryTransaction.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log('[Seeder] 1. Creating Users (Admin, Donors, Requesters)...');

    // 1. Admin Account
    const admin = await User.create({
      name: 'Dr. Sunita Sharma',
      email: 'admin@bloodcare.org',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 98765 43210',
      city: 'Mumbai',
      state: 'Maharashtra',
      status: 'active'
    });

    // 2. Fictional Donors
    const donor1User = await User.create({
      name: 'Rahul Verma',
      email: 'rahul.donor@example.com',
      password: 'Donor@123',
      role: 'donor',
      phone: '+91 98111 22334',
      city: 'Mumbai',
      state: 'Maharashtra',
      status: 'active'
    });

    const donor2User = await User.create({
      name: 'Pooja Iyer',
      email: 'pooja.donor@example.com',
      password: 'Donor@123',
      role: 'donor',
      phone: '+91 98222 33445',
      city: 'Pune',
      state: 'Maharashtra',
      status: 'active'
    });

    const donor3User = await User.create({
      name: 'Amit Patel',
      email: 'amit.donor@example.com',
      password: 'Donor@123',
      role: 'donor',
      phone: '+91 98333 44556',
      city: 'Mumbai',
      state: 'Maharashtra',
      status: 'active'
    });

    const donor4User = await User.create({
      name: 'Sneha Kulkarni',
      email: 'sneha.donor@example.com',
      password: 'Donor@123',
      role: 'donor',
      phone: '+91 98444 55667',
      city: 'Mumbai',
      state: 'Maharashtra',
      status: 'active'
    });

    const donor5User = await User.create({
      name: 'Mohammed Arshad',
      email: 'arshad.donor@example.com',
      password: 'Donor@123',
      role: 'donor',
      phone: '+91 98555 66778',
      city: 'Thane',
      state: 'Maharashtra',
      status: 'active'
    });

    // 3. Fictional Requesters / Patients
    const requester1User = await User.create({
      name: 'Vikram Malhotra',
      email: 'vikram.requester@example.com',
      password: 'Patient@123',
      role: 'requester',
      phone: '+91 97111 88990',
      city: 'Mumbai',
      state: 'Maharashtra',
      status: 'active'
    });

    const requester2User = await User.create({
      name: 'Meera Deshmukh',
      email: 'meera.requester@example.com',
      password: 'Patient@123',
      role: 'requester',
      phone: '+91 97222 99001',
      city: 'Pune',
      state: 'Maharashtra',
      status: 'active'
    });

    console.log('[Seeder] 2. Creating Donor Profiles with eligibility data...');

    // Last donation dates (some eligible > 90 days, some recent < 90 days)
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setDate(fourMonthsAgo.getDate() - 120);

    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    const donorProfile1 = await DonorProfile.create({
      user: donor1User._id,
      bloodGroup: 'O+',
      age: 26,
      gender: 'Male',
      weight: 68,
      city: 'Mumbai',
      address: 'Andheri West, Mumbai',
      isAvailable: true,
      lastDonationDate: fourMonthsAgo,
      eligibilityStatus: 'Eligible',
      eligibilityNotes: 'Standard 90-day whole blood interval met. Verified fit.',
      totalDonations: 3
    });

    const donorProfile2 = await DonorProfile.create({
      user: donor2User._id,
      bloodGroup: 'A+',
      age: 24,
      gender: 'Female',
      weight: 54,
      city: 'Pune',
      address: 'Kothrud, Pune',
      isAvailable: true,
      lastDonationDate: null,
      eligibilityStatus: 'Eligible',
      eligibilityNotes: 'First-time voluntary donor candidate. Ready for screening.',
      totalDonations: 0
    });

    const donorProfile3 = await DonorProfile.create({
      user: donor3User._id,
      bloodGroup: 'O-', // Universal donor
      age: 32,
      gender: 'Male',
      weight: 75,
      city: 'Mumbai',
      address: 'Bandra East, Mumbai',
      isAvailable: true,
      lastDonationDate: fourMonthsAgo,
      eligibilityStatus: 'Eligible',
      eligibilityNotes: 'Universal O-Negative donor. Regularly donates at community camps.',
      totalDonations: 5
    });

    const donorProfile4 = await DonorProfile.create({
      user: donor4User._id,
      bloodGroup: 'B+',
      age: 28,
      gender: 'Female',
      weight: 58,
      city: 'Mumbai',
      address: 'Dadar, Mumbai',
      isAvailable: false, // Currently unavailable
      lastDonationDate: oneMonthAgo, // Ineligible interval
      eligibilityStatus: 'Ineligible',
      eligibilityNotes: 'Donated 30 days ago. Requires 60 more days before next donation.',
      totalDonations: 2
    });

    const donorProfile5 = await DonorProfile.create({
      user: donor5User._id,
      bloodGroup: 'AB+', // Universal RBC recipient
      age: 29,
      gender: 'Male',
      weight: 71,
      city: 'Thane',
      address: 'Ghodbunder Road, Thane',
      isAvailable: true,
      lastDonationDate: fourMonthsAgo,
      eligibilityStatus: 'Eligible',
      eligibilityNotes: 'Active registered donor.',
      totalDonations: 1
    });

    console.log('[Seeder] 3. Initializing Blood Inventory for all 8 blood groups...');
    const inventoryStock = [
      { bloodGroup: 'A+', unitsAvailable: 14, lowStockThreshold: 5, criticalThreshold: 2 },
      { bloodGroup: 'A-', unitsAvailable: 4, lowStockThreshold: 5, criticalThreshold: 2 }, // Low stock
      { bloodGroup: 'B+', unitsAvailable: 18, lowStockThreshold: 5, criticalThreshold: 2 },
      { bloodGroup: 'B-', unitsAvailable: 3, lowStockThreshold: 5, criticalThreshold: 2 }, // Low stock
      { bloodGroup: 'AB+', unitsAvailable: 8, lowStockThreshold: 5, criticalThreshold: 2 },
      { bloodGroup: 'AB-', unitsAvailable: 1, lowStockThreshold: 5, criticalThreshold: 2 }, // Critical
      { bloodGroup: 'O+', unitsAvailable: 22, lowStockThreshold: 5, criticalThreshold: 2 },
      { bloodGroup: 'O-', unitsAvailable: 2, lowStockThreshold: 5, criticalThreshold: 2 } // Critical
    ];

    for (const item of inventoryStock) {
      await BloodInventory.create({
        ...item,
        lastUpdatedBy: admin._id
      });
    }

    console.log('[Seeder] 4. Creating Blood Requests in different statuses...');

    const reqTomorrow = new Date();
    reqTomorrow.setDate(reqTomorrow.getDate() + 1);

    const reqTwoDays = new Date();
    reqTwoDays.setDate(reqTwoDays.getDate() + 2);

    const reqPast = new Date();
    reqPast.setDate(reqPast.getDate() - 10);

    // Request 1: Critical Emergency (Pending)
    const request1 = await BloodRequest.create({
      requestId: 'REQ-2026-CRIT01',
      requester: requester1User._id,
      patientName: 'Ramesh Malhotra (Age 52)',
      bloodGroup: 'O-',
      unitsRequired: 2,
      hospitalName: 'Lilavati Hospital & Research Centre',
      hospitalAddress: 'Bandra West, Mumbai',
      city: 'Mumbai',
      urgency: 'Critical',
      requiredDate: reqTomorrow,
      contactName: 'Vikram Malhotra',
      contactPhone: '+91 97111 88990',
      reason: 'Emergency aortic vascular reconstruction surgery',
      status: 'Pending'
    });

    // Request 2: Urgent Request (Approved)
    const request2 = await BloodRequest.create({
      requestId: 'REQ-2026-URG02',
      requester: requester2User._id,
      patientName: 'Ananya Deshmukh (Age 8)',
      bloodGroup: 'A+',
      unitsRequired: 2,
      hospitalName: 'Ruby Hall Clinic',
      hospitalAddress: 'Sassoon Road, Pune',
      city: 'Pune',
      urgency: 'Urgent',
      requiredDate: reqTwoDays,
      contactName: 'Meera Deshmukh',
      contactPhone: '+91 97222 99001',
      reason: 'Chemotherapy supportive transfusion for pediatric leukemia',
      status: 'Approved',
      approvedBy: admin._id,
      approvalDate: new Date()
    });

    // Request 3: Normal Request (Fulfilled)
    const request3 = await BloodRequest.create({
      requestId: 'REQ-2026-FUL03',
      requester: requester1User._id,
      patientName: 'Kavita Joshi (Age 34)',
      bloodGroup: 'B+',
      unitsRequired: 1,
      hospitalName: 'Hinduja Hospital',
      hospitalAddress: 'Mahim, Mumbai',
      city: 'Mumbai',
      urgency: 'Normal',
      requiredDate: reqPast,
      contactName: 'Kavita Joshi',
      contactPhone: '+91 97111 88990',
      reason: 'Scheduled orthopedic hip joint surgery',
      status: 'Fulfilled',
      approvedBy: admin._id,
      approvalDate: reqPast,
      fulfilledDate: reqPast
    });

    console.log('[Seeder] 5. Creating Donation Records & Transactions...');

    // Donation 1: Approved
    const donation1 = await DonationRecord.create({
      donationId: 'DON-2026-001',
      donor: donor1User._id,
      donorProfile: donorProfile1._id,
      bloodGroup: 'O+',
      units: 1,
      donationDate: fourMonthsAgo,
      status: 'Approved',
      hospitalOrCamp: 'Red Cross Community Blood Drive, Andheri',
      diseaseOrHealthNotes: 'BP 120/80, Hb 14.2 g/dL. Fit for donation.',
      reviewedBy: admin._id,
      inventoryUpdated: true
    });

    // Donation 2: Pending
    const donation2 = await DonationRecord.create({
      donationId: 'DON-2026-002',
      donor: donor3User._id,
      donorProfile: donorProfile3._id,
      bloodGroup: 'O-',
      units: 1,
      donationDate: new Date(),
      status: 'Pending',
      hospitalOrCamp: 'Central Blood Bank Mumbai Main Branch',
      diseaseOrHealthNotes: 'Hb 15.0 g/dL. No recent travel or fever.'
    });

    // Inventory Transaction Record for past fulfillment
    await InventoryTransaction.create({
      transactionId: 'TXN-2026-00101',
      bloodGroup: 'B+',
      type: 'DEDUCTION',
      units: 1,
      previousStock: 19,
      newStock: 18,
      reason: 'Fulfilled blood request REQ-2026-FUL03 for patient Kavita Joshi',
      relatedRequest: request3._id,
      performedBy: admin._id
    });

    // Audit logs
    await AuditLog.create({
      action: 'SYSTEM_INITIALIZED',
      performedBy: admin._id,
      userEmail: admin.email,
      userRole: 'admin',
      targetEntity: 'System',
      targetId: 'SEED_01',
      details: { message: 'Database populated with initial demo records.' }
    });

    console.log('=======================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!                       ');
    console.log('=======================================================');
    console.log(' DEMONSTRATION CREDENTIALS:                            ');
    console.log(' ----------------------------------------------------- ');
    console.log(' 1. Administrator:                                     ');
    console.log('    Email:    admin@bloodcare.org                      ');
    console.log('    Password: Admin@123                                ');
    console.log('                                                       ');
    console.log(' 2. Registered Donor:                                  ');
    console.log('    Email:    rahul.donor@example.com                  ');
    console.log('    Password: Donor@123                                ');
    console.log('                                                       ');
    console.log(' 3. Blood Requester / Patient:                         ');
    console.log('    Email:    vikram.requester@example.com             ');
    console.log('    Password: Patient@123                              ');
    console.log('=======================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error populating database:', error);
    process.exit(1);
  }
};

seedData();
