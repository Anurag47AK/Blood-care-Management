/**
 * Safe Development-Only Administrator Creation CLI Script
 * Explicit configuration required. Never exposes admin creation to unauthorized public traffic.
 *
 * Usage:
 *   node scripts/createAdmin.js
 * Or with custom parameters:
 *   ADMIN_EMAIL="custom.admin@bloodcare.org" ADMIN_PASSWORD="SecurePassword@123" node scripts/createAdmin.js
 */

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    console.log('[Admin Creator] Connecting to database...');
    await connectDB();

    const name = process.env.INITIAL_ADMIN_NAME || 'Dr. Central Blood Admin';
    const email = (process.env.INITIAL_ADMIN_EMAIL || 'admin@bloodcare.org').toLowerCase().trim();
    const password = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123';
    const phone = process.env.INITIAL_ADMIN_PHONE || '+91 98765 43210';
    const city = process.env.INITIAL_ADMIN_CITY || 'Mumbai';

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.warn(`[Admin Creator] Notice: Administrator with email '${email}' already exists.`);
      console.log(`[Admin Creator] Existing Admin ID: ${existingAdmin._id}`);
      await disconnectDB();
      process.exit(0);
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
      phone,
      city,
      status: 'active'
    });

    console.log('=======================================================');
    console.log(' ADMINISTRATOR ACCOUNT CREATED SUCCESSFULLY (DEV)      ');
    console.log('=======================================================');
    console.log(` Name:    ${admin.name}`);
    console.log(` Email:   ${admin.email}`);
    console.log(` Role:    ${admin.role}`);
    console.log(` City:    ${admin.city}`);
    console.log(` User ID: ${admin._id}`);
    console.log('=======================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Admin Creator] Error creating administrator:', error.message);
    process.exit(1);
  }
};

createAdmin();
