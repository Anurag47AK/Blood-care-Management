const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');

const API_BASE = process.env.TEST_API_URL || 'http://127.0.0.1:5000/api';

test('=== End-to-End QA Audit & Live API Verification ===', async (t) => {
  // Shared state across sequential test steps
  let testDonorToken = '';
  let testDonorUser = null;
  let testRequesterToken = '';
  let testRequesterUser = null;
  let adminToken = '';
  let createdRequestId = '';
  let createdRequestCode = '';

  // -------------------------------------------------------------
  // 1. STARTUP, BUILD & HEALTH
  // -------------------------------------------------------------
  await t.test('1. System Startup & Health Endpoint Verification', async () => {
    const res = await fetch(`${API_BASE}/health`);
    assert.strictEqual(res.status, 200, 'Health endpoint should return HTTP 200');
    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
    assert.ok(data.timestamp, 'Health response should include timestamp');
  });

  await t.test('1b. Public Live Computed Database Stats', async () => {
    const res = await fetch(`${API_BASE}/stats/public`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(typeof data.stats.totalDonors === 'number', 'totalDonors should be a number');
    assert.ok(typeof data.stats.totalUnitsInStock === 'number', 'totalUnitsInStock should be a number');
    assert.ok(typeof data.stats.activeRequests === 'number', 'activeRequests should be a number');
    // Ensure donors are not counted as inventory units
    assert.notStrictEqual(
      data.stats.totalDonors,
      data.stats.totalUnitsInStock,
      'Donor profile count must NOT be equal to physical blood bank units'
    );
  });

  // -------------------------------------------------------------
  // 2. AUTHENTICATION & ACCESS CONTROL
  // -------------------------------------------------------------
  const uniqueTimestamp = Date.now();
  const donorEmail = `qa.donor.${uniqueTimestamp}@example.com`;
  const requesterEmail = `qa.requester.${uniqueTimestamp}@example.com`;
  const testPassword = 'Password@123';

  await t.test('2a. Register New Voluntary Donor with Profile Data', async () => {
    const payload = {
      name: 'QA Test Donor',
      email: donorEmail,
      password: testPassword,
      role: 'donor',
      phone: '9876543210',
      city: 'Pune',
      state: 'Maharashtra',
      bloodGroup: 'B+',
      age: 26,
      gender: 'male',
      weight: 68
    };

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201, `Donor registration failed: ${JSON.stringify(data)}`);
    assert.strictEqual(data.success, true);
    assert.ok(data.token, 'Registration must return a JWT token');
    assert.strictEqual(data.user.role, 'donor');
    assert.strictEqual(data.user.email, donorEmail);
    assert.strictEqual(data.user.password, undefined, 'Password must not be returned in API response');
    testDonorToken = data.token;
    testDonorUser = data.user;
  });

  await t.test('2b. Prevent Duplicate Account Registration', async () => {
    const duplicatePayload = {
      name: 'Duplicate QA Donor',
      email: donorEmail, // Same email
      password: testPassword,
      role: 'donor',
      phone: '9876543211',
      city: 'Pune',
      bloodGroup: 'B+',
      age: 26,
      gender: 'Male',
      weight: 68
    };

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(duplicatePayload)
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400, 'Duplicate email registration should be rejected with 400');
    assert.strictEqual(data.success, false);
    assert.ok(
      data.message.toLowerCase().includes('already exists') ||
      data.message.toLowerCase().includes('already registered')
    );
  });

  await t.test('2c. Register New Requester Account', async () => {
    const payload = {
      name: 'QA Test Requester',
      email: requesterEmail,
      password: testPassword,
      role: 'requester',
      phone: '9123456789',
      city: 'Pune',
      state: 'Maharashtra'
    };

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.role, 'requester');
    testRequesterToken = data.token;
    testRequesterUser = data.user;
  });

  await t.test('2d. Reject Invalid Login Credentials', async () => {
    // Wrong password
    const wrongPassRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: donorEmail, password: 'WrongPassword@123' })
    });
    assert.strictEqual(wrongPassRes.status, 401, 'Wrong password must return 401 Unauthorized');
    const wrongPassData = await wrongPassRes.json();
    assert.strictEqual(wrongPassData.success, false);

    // Non-existent user
    const nonUserRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent.user@example.com', password: testPassword })
    });
    assert.strictEqual(nonUserRes.status, 401, 'Non-existent user must return 401 Unauthorized');
  });

  await t.test('2e. Authenticate Admin Credentials & Retrieve Token', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@bloodcare.org', password: 'Admin@123' })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200, `Admin login failed: ${JSON.stringify(data)}`);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.role, 'admin');
    assert.ok(data.token);
    adminToken = data.token;
  });

  await t.test('2f. Enforce Role-Based Permissions (Regular Users Blocked From Admin APIs)', async () => {
    // Donor attempting to access Admin Overview
    const donorAccessRes = await fetch(`${API_BASE}/stats/admin`, {
      headers: { Authorization: `Bearer ${testDonorToken}` }
    });
    assert.strictEqual(donorAccessRes.status, 403, 'Donor must be forbidden (403) from accessing admin stats');

    // Requester attempting to access Admin Audit Logs
    const reqAccessRes = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${testRequesterToken}` }
    });
    assert.strictEqual(reqAccessRes.status, 403, 'Requester must be forbidden (403) from accessing audit logs');

    // Requester attempting to issue inventory
    const invIssueRes = await fetch(`${API_BASE}/inventory/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testRequesterToken}`
      },
      body: JSON.stringify({ bloodGroup: 'B+', units: 1, reason: 'Illicit issue' })
    });
    assert.strictEqual(invIssueRes.status, 403, 'Requester must be forbidden (403) from modifying inventory');
  });

  await t.test('2g. Handle Tampered or Expired Token Gracefully', async () => {
    const tamperedRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: 'Bearer this.is.a.tampered.token' }
    });
    assert.strictEqual(tamperedRes.status, 401, 'Tampered JWT must return 401');
    const data = await tamperedRes.json();
    assert.strictEqual(data.success, false);
  });

  // -------------------------------------------------------------
  // 3. DONOR MANAGEMENT & PUBLIC SEARCH PRIVACY
  // -------------------------------------------------------------
  await t.test('3a. Fetch & Update Donor Profile & Availability', async () => {
    // 1. Fetch profile
    const profileRes = await fetch(`${API_BASE}/donors/profile/me`, {
      headers: { Authorization: `Bearer ${testDonorToken}` }
    });
    assert.strictEqual(profileRes.status, 200);
    const profileData = await profileRes.json();
    assert.strictEqual(profileData.success, true);
    assert.strictEqual(profileData.profile.bloodGroup, 'B+');
    assert.strictEqual(profileData.profile.isAvailable, true);

    // 2. Toggle availability to false
    const toggleRes = await fetch(`${API_BASE}/donors/availability`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testDonorToken}`
      },
      body: JSON.stringify({ isAvailable: false })
    });
    assert.strictEqual(toggleRes.status, 200);
    const toggleData = await toggleRes.json();
    assert.strictEqual(toggleData.success, true);
    assert.strictEqual(toggleData.isAvailable ?? toggleData.profile?.isAvailable, false);

    // 3. Toggle back to true
    await fetch(`${API_BASE}/donors/availability`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testDonorToken}`
      },
      body: JSON.stringify({ isAvailable: true })
    });
  });

  await t.test('3b. Search Donors with Privacy Masking for Unauthenticated Visitors', async () => {
    // Public unauthenticated request with standard encoded plus
    const pubSearchRes = await fetch(`${API_BASE}/donors/search?bloodGroup=${encodeURIComponent('B+')}&city=Pune`);
    assert.strictEqual(pubSearchRes.status, 200);
    const pubData = await pubSearchRes.json();
    assert.strictEqual(pubData.success, true);
    assert.ok(pubData.donors.length > 0, 'Should find at least 1 donor in Pune with B+');

    const foundDonor = pubData.donors.find((d) => d.bloodGroup === 'B+');
    assert.ok(foundDonor, 'Must locate donor');
    // Verify phone is masked for public
    assert.ok(
      foundDonor.phone.includes('*') || foundDonor.phone.length <= 4,
      `Public phone must be masked, received: ${foundDonor.phone}`
    );

    // Authenticated request should receive unmasked contact
    const authSearchRes = await fetch(`${API_BASE}/donors/search?bloodGroup=B+&city=Pune`, {
      headers: { Authorization: `Bearer ${testRequesterToken}` }
    });
    const authData = await authSearchRes.json();
    const unmaskedDonor = authData.donors.find((d) => d.bloodGroup === 'B+');
    assert.strictEqual(
      unmaskedDonor.phone,
      '9876543210',
      'Authenticated user should see full unmasked phone number'
    );
  });

  await t.test('3c. Donor Input Validation for Missing & Invalid Fields', async () => {
    // Missing required fields
    const invalidRegRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Incomplete Donor',
        email: 'incomplete@example.com',
        password: '123', // Too short
        role: 'donor'
        // Missing bloodGroup, phone
      })
    });
    assert.strictEqual(invalidRegRes.status, 400, 'Invalid registration payload must be rejected with 400');
    const invalidData = await invalidRegRes.json();
    assert.strictEqual(invalidData.success, false);
  });

  // -------------------------------------------------------------
  // 4. BLOOD REQUESTS & LIFECYCLE
  // -------------------------------------------------------------
  await t.test('4a. Submit Blood Request with Unique Request ID', async () => {
    const requiredDate = new Date();
    requiredDate.setDate(requiredDate.getDate() + 3);

    const requestPayload = {
      patientName: 'Master QA Patient',
      bloodGroup: 'B+',
      unitsRequired: 2,
      hospitalName: 'Ruby Hall Medical Center',
      hospitalAddress: 'Plot 40, Medical Campus Ward B',
      city: 'Pune',
      state: 'Maharashtra',
      urgency: 'Urgent',
      contactName: 'Dr. Jane Smith',
      contactPhone: '9123456789',
      requiredDate: requiredDate.toISOString(),
      reason: 'Post-operative recovery blood requirement'
    };

    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testRequesterToken}`
      },
      body: JSON.stringify(requestPayload)
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201, `Failed to create request: ${JSON.stringify(data)}`);
    assert.strictEqual(data.success, true);
    const createdReq = data.request || data.bloodRequest;
    assert.ok(createdReq._id);
    assert.ok(
      createdReq.requestId.startsWith('REQ-'),
      `Request ID should follow standard prefix format, received: ${createdReq.requestId}`
    );
    assert.strictEqual(createdReq.status, 'Pending');
    assert.strictEqual(createdReq.unitsRequired, 2);

    createdRequestId = createdReq._id;
    createdRequestCode = createdReq.requestId;
  });

  await t.test('4b. Verify Blood Request Appears in Requester and Admin Lists', async () => {
    // In Requester's own requests
    const myReqRes = await fetch(`${API_BASE}/requests/my`, {
      headers: { Authorization: `Bearer ${testRequesterToken}` }
    });
    assert.strictEqual(myReqRes.status, 200);
    const myData = await myReqRes.json();
    const hasMyReq = myData.requests.some((r) => r._id === createdRequestId);
    assert.strictEqual(hasMyReq, true, 'Created request must appear in Requester history');

    // In Admin's requests queue
    const adminReqRes = await fetch(`${API_BASE}/admin/requests`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(adminReqRes.status, 200);
    const adminData = await adminReqRes.json();
    const hasAdminReq = adminData.requests.some((r) => r._id === createdRequestId);
    assert.strictEqual(hasAdminReq, true, 'Created request must appear in Admin requests queue');
  });

  await t.test('4c. Smart Match Candidates Evaluated for Request', async () => {
    const matchRes = await fetch(`${API_BASE}/requests/${createdRequestId}`, {
      headers: { Authorization: `Bearer ${testRequesterToken}` }
    });
    assert.strictEqual(matchRes.status, 200);
    const matchData = await matchRes.json();
    assert.strictEqual(matchData.success, true);
    assert.ok(Array.isArray(matchData.matchedDonors), 'matchedDonors must be an array');

    // Our newly registered Pune B+ donor should appear in the match candidates
    const ourDonorMatch = matchData.matchedDonors.find(
      (m) => m.name === 'QA Test Donor' || m.donor?.user?.name === 'QA Test Donor'
    );
    assert.ok(ourDonorMatch, 'Newly registered Pune B+ donor should be matched for B+ Pune request');
    assert.ok(ourDonorMatch.score >= 80, `Compatible local donor should receive high score, got: ${ourDonorMatch.score}`);
  });

  await t.test('4d. Admin Approves Blood Request', async () => {
    const approveRes = await fetch(`${API_BASE}/admin/requests/${createdRequestId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(approveRes.status, 200);
    const approveData = await approveRes.json();
    assert.strictEqual(approveData.success, true);
    assert.strictEqual(approveData.request.status, 'Approved');
  });

  // -------------------------------------------------------------
  // 5. INVENTORY & CONCURRENCY PROTECTION
  // -------------------------------------------------------------
  await t.test('5a. Check All 8 Blood Groups In Inventory', async () => {
    const res = await fetch(`${API_BASE}/inventory`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.inventory.length, 8, 'Inventory must contain exactly all 8 ABO/Rh blood groups');

    const groups = data.inventory.map((i) => i.bloodGroup).sort();
    const expected = ['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-'].sort();
    assert.deepStrictEqual(groups, expected, 'All 8 groups must match clinical ABO/Rh types');
  });

  await t.test('5b. Admin Fulfills Blood Request & Atomically Deducts Stock', async () => {
    // 1. Get current stock for B+
    const invBefore = await fetch(`${API_BASE}/inventory`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const invBeforeData = await invBefore.json();
    const bPlusStockBefore = invBeforeData.inventory.find((i) => i.bloodGroup === 'B+').unitsAvailable;

    // 2. Fulfill request of 2 units
    const fulfillRes = await fetch(`${API_BASE}/admin/requests/${createdRequestId}/fulfill`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(fulfillRes.status, 200, 'Fulfillment should succeed when sufficient units are in stock');
    const fulfillData = await fulfillRes.json();
    assert.strictEqual(fulfillData.success, true);
    assert.strictEqual(fulfillData.request.status, 'Fulfilled');

    // 3. Verify exactly 2 units deducted
    const invAfter = await fetch(`${API_BASE}/inventory`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const invAfterData = await invAfter.json();
    const bPlusStockAfter = invAfterData.inventory.find((i) => i.bloodGroup === 'B+').unitsAvailable;
    assert.strictEqual(
      bPlusStockAfter,
      bPlusStockBefore - 2,
      `Inventory must decrease by exactly 2 units. Was ${bPlusStockBefore}, now ${bPlusStockAfter}`
    );
  });

  await t.test('5c. Prevent Duplicate Fulfillment of Already Fulfilled Request', async () => {
    const duplicateFulfillRes = await fetch(`${API_BASE}/admin/requests/${createdRequestId}/fulfill`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(
      duplicateFulfillRes.status,
      400,
      'Duplicate fulfillment must return 400 Bad Request'
    );
    const data = await duplicateFulfillRes.json();
    assert.ok(
      data.message.toLowerCase().includes('already') ||
      data.message.toLowerCase().includes('fulfilled') ||
      data.message.toLowerCase().includes('cannot')
    );
  });

  await t.test('5d. Prevent Negative Inventory When Units Exceed Available Stock', async () => {
    // Check current stock of AB- (seeded as low/critical)
    const invRes = await fetch(`${API_BASE}/inventory`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const invData = await invRes.json();
    const abMinusStock = invData.inventory.find((i) => i.bloodGroup === 'AB-').unitsAvailable;

    // Attempt to issue more units than exist in stock
    const excessiveUnits = abMinusStock + 999;
    const issueRes = await fetch(`${API_BASE}/inventory/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        bloodGroup: 'AB-',
        units: excessiveUnits,
        reason: 'Illegal excessive test deduction'
      })
    });

    assert.strictEqual(
      issueRes.status,
      400,
      'Attempting to deduct more stock than available must return 400 Insufficient Stock'
    );
    const issueData = await issueRes.json();
    assert.strictEqual(issueData.success, false);
    assert.ok(issueData.message.toLowerCase().includes('insufficient') || issueData.message.toLowerCase().includes('cannot'));

    // Verify stock did not become negative
    const verifyRes = await fetch(`${API_BASE}/inventory`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const verifyData = await verifyRes.json();
    const verifyStock = verifyData.inventory.find((i) => i.bloodGroup === 'AB-').unitsAvailable;
    assert.strictEqual(verifyStock, abMinusStock, 'Stock level must remain completely unchanged');
    assert.ok(verifyStock >= 0, 'Stock level must never be negative');
  });

  await t.test('5e. Verify Inventory Transactions Audit Log', async () => {
    const txnRes = await fetch(`${API_BASE}/inventory/transactions`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(txnRes.status, 200);
    const txnData = await txnRes.json();
    assert.strictEqual(txnData.success, true);
    assert.ok(txnData.transactions.length > 0, 'Must record inventory transactions in ledger');

    const latestTxn = txnData.transactions[0];
    assert.ok(latestTxn.bloodGroup);
    assert.ok(latestTxn.type);
    assert.ok(typeof latestTxn.units === 'number');
    assert.ok(typeof latestTxn.previousStock === 'number');
    assert.ok(typeof latestTxn.newStock === 'number');
  });

  // -------------------------------------------------------------
  // 6. CANCELLATION RULES & REQUEST CLEANUP
  // -------------------------------------------------------------
  await t.test('6a. Request Cancellation Rules', async () => {
    // 1. Create a request to test cancellation
    const cancelReqRes = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testRequesterToken}`
      },
      body: JSON.stringify({
        patientName: 'Test Cancel Patient',
        bloodGroup: 'A+',
        unitsRequired: 1,
        hospitalName: 'Apollo Hospital',
        hospitalAddress: 'Block 2, Emergency Ward',
        city: 'Pune',
        urgency: 'Normal',
        contactName: 'Staff Nurse',
        contactPhone: '9123456789',
        requiredDate: new Date().toISOString(),
        reason: 'Elective surgery post-op observation'
      })
    });
    const cancelReqData = await cancelReqRes.json();
    const reqToCancelId = cancelReqData.request?._id || cancelReqData.bloodRequest?._id;

    // 2. Cancel the pending request
    const cancelRes = await fetch(`${API_BASE}/requests/${reqToCancelId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testRequesterToken}`
      },
      body: JSON.stringify({ reason: 'Patient discharged' })
    });
    assert.strictEqual(cancelRes.status, 200);
    const cancelResultData = await cancelRes.json();
    assert.strictEqual(cancelResultData.request.status, 'Cancelled');

    // 3. Attempt to cancel an already fulfilled request (createdRequestId)
    const invalidCancelRes = await fetch(`${API_BASE}/requests/${createdRequestId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${testRequesterToken}` }
    });
    assert.strictEqual(
      invalidCancelRes.status,
      400,
      'Already fulfilled request cannot be cancelled'
    );
  });

  // -------------------------------------------------------------
  // 7. NOTIFICATIONS SYSTEM
  // -------------------------------------------------------------
  await t.test('7a. Notifications Flow & Mark as Read', async () => {
    // Fetch notifications for donor (who received a match notification)
    const notifRes = await fetch(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${testDonorToken}` }
    });
    assert.strictEqual(notifRes.status, 200);
    const notifData = await notifRes.json();
    assert.strictEqual(notifData.success, true);
    assert.ok(typeof notifData.unreadCount === 'number');

    // Mark all read
    const markAllRes = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${testDonorToken}` }
    });
    assert.strictEqual(markAllRes.status, 200);
    const markAllData = await markAllRes.json();
    assert.strictEqual(markAllData.success, true);
  });

  // -------------------------------------------------------------
  // 8. SECURITY AUDIT & IMMUTABLE LOGS
  // -------------------------------------------------------------
  await t.test('8a. Immutable Administrative Audit Trail', async () => {
    const auditRes = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(auditRes.status, 200);
    const auditData = await auditRes.json();
    assert.strictEqual(auditData.success, true);
    assert.ok(auditData.logs.length > 0, 'Audit trail must record admin operations');

    // Verify fields
    const log = auditData.logs[0];
    assert.ok(log.action, 'Audit log must contain action name');
    assert.ok(log.createdAt, 'Audit log must contain timestamp');
  });
});
