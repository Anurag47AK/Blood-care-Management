const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  isRBCCompatible,
  getCompatibleDonorGroups,
  checkDonationEligibility,
  scoreAndRankDonors
} = require('../services/matchingService');

test('=== Blood Care Management System - Test Suite ===', async (t) => {
  await t.test('1. RBC ABO & Rh Blood Compatibility Engine', () => {
    // Universal donor tests
    assert.strictEqual(isRBCCompatible('O-', 'AB+'), true, 'O- should be compatible with AB+');
    assert.strictEqual(isRBCCompatible('O-', 'O-'), true, 'O- should be compatible with O-');
    assert.strictEqual(isRBCCompatible('O-', 'A+'), true, 'O- should be compatible with A+');
    assert.strictEqual(isRBCCompatible('O-', 'B+'), true, 'O- should be compatible with B+');

    // Universal recipient tests
    assert.strictEqual(isRBCCompatible('A+', 'AB+'), true, 'AB+ should receive A+');
    assert.strictEqual(isRBCCompatible('B+', 'AB+'), true, 'AB+ should receive B+');
    assert.strictEqual(isRBCCompatible('AB-', 'AB+'), true, 'AB+ should receive AB-');

    // Incompatible pairs
    assert.strictEqual(isRBCCompatible('A+', 'O+'), false, 'O+ recipient cannot receive A+');
    assert.strictEqual(isRBCCompatible('B+', 'A+'), false, 'A+ recipient cannot receive B+');
    assert.strictEqual(isRBCCompatible('AB+', 'O-'), false, 'O- recipient cannot receive AB+');

    // Specific donor groups for O-
    const oMinusDonors = getCompatibleDonorGroups('O-');
    assert.deepStrictEqual(oMinusDonors, ['O-'], 'O- can only receive from O-');

    // Specific donor groups for A+
    const aPlusDonors = getCompatibleDonorGroups('A+');
    assert.deepStrictEqual(
      aPlusDonors.sort(),
      ['A+', 'A-', 'O+', 'O-'].sort(),
      'A+ can receive from O-, O+, A-, A+'
    );
  });

  await t.test('2. Donor Interval Eligibility Check (90 Days rule)', () => {
    // Case 1: First time donor (no previous donation)
    const firstTime = checkDonationEligibility(null);
    assert.strictEqual(firstTime.isEligible, true, 'First-time donor should be eligible');

    // Case 2: Donated 100 days ago (> 90 days)
    const hundredDaysAgo = new Date();
    hundredDaysAgo.setDate(hundredDaysAgo.getDate() - 100);
    const eligibleDonor = checkDonationEligibility(hundredDaysAgo);
    assert.strictEqual(eligibleDonor.isEligible, true, 'Donor over 90 days should be eligible');
    assert.ok(eligibleDonor.daysSinceLastDonation >= 99);

    // Case 3: Donated 30 days ago (< 90 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const ineligibleDonor = checkDonationEligibility(thirtyDaysAgo);
    assert.strictEqual(ineligibleDonor.isEligible, false, 'Donor under 90 days should be ineligible');
    assert.strictEqual(ineligibleDonor.daysRemaining, 60, 'Should require 60 more days');
  });

  await t.test('3. Smart Donor Matching and Ranking Algorithm', () => {
    const fakeRequest = {
      bloodGroup: 'A+',
      city: 'Mumbai',
      urgency: 'Urgent'
    };

    const hundredDaysAgo = new Date();
    hundredDaysAgo.setDate(hundredDaysAgo.getDate() - 100);

    const candidateDonors = [
      {
        _id: '1',
        bloodGroup: 'A+', // Exact match + same city + available + eligible
        city: 'Mumbai',
        isAvailable: true,
        lastDonationDate: hundredDaysAgo,
        user: { name: 'Donor Top Match', city: 'Mumbai', phone: '9999999999' }
      },
      {
        _id: '2',
        bloodGroup: 'O+', // Compatible (not exact) + same city
        city: 'Mumbai',
        isAvailable: true,
        lastDonationDate: hundredDaysAgo,
        user: { name: 'Donor Compatible', city: 'Mumbai', phone: '8888888888' }
      },
      {
        _id: '3',
        bloodGroup: 'B+', // Incompatible blood group
        city: 'Mumbai',
        isAvailable: true,
        lastDonationDate: hundredDaysAgo,
        user: { name: 'Donor Incompatible', city: 'Mumbai', phone: '7777777777' }
      }
    ];

    const ranked = scoreAndRankDonors(fakeRequest, candidateDonors);

    // Incompatible donor should be excluded
    assert.strictEqual(ranked.length, 2, 'Only compatible donors should be returned');

    // First ranked donor should be the exact match
    assert.strictEqual(ranked[0].donor.bloodGroup, 'A+');
    assert.strictEqual(ranked[0].isExactMatch, true);
    assert.ok(ranked[0].score > ranked[1].score, 'Exact match should outscore alternative match');
  });

  await t.test('4. Security & Cryptography: Password Hashing & Verification', async () => {
    const rawPassword = 'SecurePassword@2026';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    assert.notStrictEqual(hash, rawPassword, 'Password must not be stored in plain text');
    const isCorrect = await bcrypt.compare(rawPassword, hash);
    const isWrong = await bcrypt.compare('WrongPassword', hash);

    assert.strictEqual(isCorrect, true, 'Valid password must match hash');
    assert.strictEqual(isWrong, false, 'Invalid password must not match hash');
  });

  await t.test('5. JWT Generation & Role Payload Verification', () => {
    const secret = 'test_jwt_secret_key';
    const token = jwt.sign({ id: 'user123', role: 'admin' }, secret, { expiresIn: '1h' });

    const decoded = jwt.verify(token, secret);
    assert.strictEqual(decoded.id, 'user123');
    assert.strictEqual(decoded.role, 'admin');
  });

  await t.test('6. Inventory Threshold Business Rules', () => {
    const bloodStocks = [
      { bloodGroup: 'A+', units: 10, lowThreshold: 5, criticalThreshold: 2 },
      { bloodGroup: 'B-', units: 4, lowThreshold: 5, criticalThreshold: 2 },
      { bloodGroup: 'O-', units: 1, lowThreshold: 5, criticalThreshold: 2 }
    ];

    const lowStock = bloodStocks.filter(
      (b) => b.units > b.criticalThreshold && b.units <= b.lowThreshold
    );
    const criticalStock = bloodStocks.filter((b) => b.units <= b.criticalThreshold);

    assert.strictEqual(lowStock.length, 1);
    assert.strictEqual(lowStock[0].bloodGroup, 'B-');
    assert.strictEqual(criticalStock.length, 1);
    assert.strictEqual(criticalStock[0].bloodGroup, 'O-');
  });
});
