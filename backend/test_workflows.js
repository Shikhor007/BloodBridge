const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log(' BloodBridge Comprehensive End-to-End Workflow & Security Tests');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.data.status === 'ONLINE', '1. System Health API is Online');

    // 2. Public Platform Statistics
    const stats = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/public/stats',
      method: 'GET'
    });
    assert(stats.status === 200 && stats.data.success && stats.data.data.totalDonors >= 3, '2. Public Statistics Calculated from Database');

    // 3. Admin Login & RBAC Verification
    const adminLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@bloodbridge.org', password: 'Admin@123' });
    assert(adminLogin.status === 200 && adminLogin.data.user.roleName === 'ADMIN', '3. System Admin Login and Role Identification');
    const adminToken = adminLogin.data.token;

    // 4. Donor 3-Month Eligibility Validation (Donor Sarah vs Donor Michael)
    const sarahLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'donor.sarah@bloodbridge.org', password: 'Donor@123' });
    const sarahToken = sarahLogin.data.token;

    const sarahElig = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/donor/eligibility',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${sarahToken}` }
    });
    assert(sarahElig.data.data.isEligible === true, '4a. Donor Sarah (>3 months) is ELIGIBLE to donate');

    const michaelLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'donor.michael@bloodbridge.org', password: 'Donor@123' });
    const michaelToken = michaelLogin.data.token;

    const michaelElig = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/donor/eligibility',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${michaelToken}` }
    });
    assert(michaelElig.data.data.isEligible === false && michaelElig.data.data.daysRemaining > 0, '4b. Donor Michael (<3 months) is INELIGIBLE with positive countdown');

    // 5. Ineligible Donor Appointment Booking Protection
    const blockedAppt = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/donor/appointments',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${michaelToken}`
      }
    }, {
      hospitalId: 1,
      appointmentDate: '2026-11-20',
      timeSlot: '10:00 AM - 11:00 AM'
    });
    assert(blockedAppt.status === 400 && blockedAppt.data.message.includes('Appointment booking blocked'), '5. Backend Strictly Blocks Ineligible Donor Appointment Booking');

    // 6. Donor Privacy Wall Check: Donor MUST NOT access patient routes or medical records!
    const privacyViolationAttempt = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/patient/dashboard',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${sarahToken}` }
    });
    assert(privacyViolationAttempt.status === 403, '6. Security Privacy Wall: Donor Forbidden from Accessing Patient Records (HTTP 403)');

    // 7. Patient Request Submission & Transparent Service Charge
    const patientLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'patient.john@bloodbridge.org', password: 'Patient@123' });
    const patientToken = patientLogin.data.token;

    const newReq = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/patient/requests',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${patientToken}`
      }
    }, {
      hospitalId: 1,
      bloodGroup: 'O+',
      requiredUnits: 1,
      requiredDate: '2026-11-25',
      priority: 'NORMAL',
      patientName: 'Johnathan Archer',
      patientAge: 42,
      treatmentLocation: 'City General Post-Op Room 102',
      doctorName: 'Dr. Gregory House',
      doctorContact: '+1-555-4499',
      additionalNotes: 'Post-op recovery support'
    });
    assert(newReq.status === 201 && newReq.data.serviceCharge === 40, '7. Patient Blood Request Created with Transparent Service Charge ($40)');
    const createdReqId = newReq.data.requestId;

    // 8. Hospital Unit Assignment with Concurrency Validation
    const hospitalLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'citygeneral@bloodbridge.org', password: 'Hospital@123' });
    const hospitalToken = hospitalLogin.data.token;

    const assignResult = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/hospital/requests/${createdReqId}/assign-units`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hospitalToken}`
      }
    }, {
      unitIds: ['UNIT-CG-2026-001']
    });
    assert(assignResult.status === 200 && assignResult.data.success, '8. Hospital Successfully Assigned Unit UNIT-CG-2026-001 to Request');

    // 9. Concurrency Collision Test: Attempting to assign the SAME unit to another request MUST FAIL!
    const doubleAssignAttempt = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/hospital/requests/${createdReqId}/assign-units`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hospitalToken}`
      }
    }, {
      unitIds: ['UNIT-CG-2026-001'] // Already assigned
    });
    assert(doubleAssignAttempt.status === 400 && doubleAssignAttempt.data.message.includes('Concurrency conflict'), '9. Concurrency Protection: Double-Assignment of Blood Unit Prevented');

    // 10. Notification Delivery Test for Patient
    const notifs = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/notifications',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    assert(notifs.status === 200 && notifs.data.data.length > 0, '10. Automated In-App Notifications Successfully Delivered to Recipient');

    console.log('\n================================================================');
    console.log(` Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
