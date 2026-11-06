const { db } = require('../models/dbAdapter');

exports.getAdminDashboard = async (req, res) => {
  try {
    const users = await db.find('users');
    const donors = await db.find('donorProfiles');
    const patients = await db.find('patientProfiles');
    const hospitals = await db.find('hospitals');
    const requests = await db.find('bloodRequests');
    const units = await db.find('bloodUnits');
    const donations = await db.find('donationRecords');

    const pendingHospitals = hospitals.filter(h => h.approval_status === 'PENDING').length;
    const completedRequests = requests.filter(r => r.status === 'COMPLETED').length;
    const totalBagsDistributed = requests
      .filter(r => ['BLOOD_ASSIGNED', 'READY_FOR_COLLECTION', 'COMPLETED'].includes(r.status))
      .reduce((acc, curr) => acc + (curr.assigned_units ? curr.assigned_units.length : curr.required_units), 0);

    // Platform Analytics
    const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const demandVsSupply = allGroups.map(grp => {
      const demandCount = requests.filter(r => r.blood_group === grp).reduce((acc, r) => acc + r.required_units, 0);
      const supplyCount = units.filter(u => u.blood_group === grp && u.status === 'AVAILABLE').length;
      return {
        bloodGroup: grp,
        demand: demandCount,
        available: supplyCount
      };
    });

    const userTrends = [
      { month: 'Jun', donors: 12, patients: 8, hospitals: 1 },
      { month: 'Jul', donors: 18, patients: 14, hospitals: 1 },
      { month: 'Aug', donors: 25, patients: 20, hospitals: 2 },
      { month: 'Sep', donors: 32, patients: 28, hospitals: 1 },
      { month: 'Oct', donors: 45, patients: 35, hospitals: 2 },
      { month: 'Nov', donors: donors.length, patients: patients.length, hospitals: hospitals.length }
    ];

    const hospitalUsage = hospitals.filter(h => h.approval_status === 'APPROVED').map(h => {
      const hospRequests = requests.filter(r => r.hospital_id === h.hospital_id && r.status === 'COMPLETED');
      const unitsUsed = hospRequests.reduce((acc, r) => acc + (r.required_units || 1), 0);
      return {
        hospitalName: h.hospital_name,
        unitsDistributed: unitsUsed,
        city: h.city
      };
    });

    return res.json({
      success: true,
      metrics: {
        totalUsers: users.length,
        totalDonors: donors.length,
        totalPatients: patients.length,
        totalHospitals: hospitals.length,
        pendingHospitalApprovals: pendingHospitals,
        totalRequests: requests.length,
        completedRequests,
        totalBagsDistributed
      },
      demandVsSupply,
      userTrends,
      hospitalUsage,
      recentUsers: users.slice(-5).reverse(),
      recentAuditLogs: (await db.find('auditLogs')).slice(-6).reverse()
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load system admin dashboard.' });
  }
};

// Hospital Management
exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await db.find('hospitals');
    const documents = await db.find('hospitalDocuments');
    const users = await db.find('users');

    const enriched = hospitals.map(h => {
      const user = users.find(u => u.user_id === h.user_id);
      const docs = documents.filter(d => d.hospital_id === h.hospital_id);
      return {
        ...h,
        adminEmail: user ? user.email : h.hospital_email,
        adminStatus: user ? user.status : 'ACTIVE',
        documents: docs
      };
    });

    return res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch hospitals.' });
  }
};

exports.updateHospitalApproval = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { status, rejectionReason } = req.body; // APPROVED, REJECTED, SUSPENDED

    const hospital = await db.findOne('hospitals', h => h.hospital_id === Number(hospitalId));
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }

    await db.update('hospitals', h => h.hospital_id === Number(hospitalId), h => {
      h.approval_status = status;
      if (rejectionReason) h.rejection_reason = rejectionReason;
      h.updated_at = new Date().toISOString();
    });

    // Notify Hospital User
    await db.createNotification({
      userId: hospital.user_id,
      title: status === 'APPROVED' ? 'Hospital Account Approved!' : `Hospital Application ${status}`,
      message: status === 'APPROVED'
        ? `Your hospital "${hospital.hospital_name}" has been approved. You now have full access to blood inventory management and patient requests.`
        : `Your hospital account status was changed to ${status}. ${rejectionReason ? 'Reason: ' + rejectionReason : ''}`,
      type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING'
    });

    await db.logAudit({
      userId: req.user.userId,
      userEmail: req.user.email,
      action: `HOSPITAL_${status}`,
      entityName: 'HOSPITALS',
      entityId: hospitalId,
      ipAddress: req.ip,
      details: `Hospital #${hospitalId} (${hospital.hospital_name}) marked as ${status}`
    });

    return res.json({ success: true, message: `Hospital approval status updated to ${status}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update hospital status.' });
  }
};

// User Management (Donors, Patients, Hospital Admins)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.find('users');
    const roles = await db.find('roles');
    const donors = await db.find('donorProfiles');
    const patients = await db.find('patientProfiles');
    const hospitals = await db.find('hospitals');

    const enriched = users.map(u => {
      const role = roles.find(r => r.role_id === u.role_id);
      let details = null;
      if (role?.role_name === 'DONOR') details = donors.find(d => d.user_id === u.user_id);
      else if (role?.role_name === 'PATIENT') details = patients.find(p => p.user_id === u.user_id);
      else if (role?.role_name === 'HOSPITAL') details = hospitals.find(h => h.user_id === u.user_id);

      return {
        userId: u.user_id,
        email: u.email,
        fullName: u.full_name,
        phone: u.phone,
        roleName: role ? role.role_name : 'UNKNOWN',
        status: u.status,
        lastLogin: u.last_login,
        createdAt: u.created_at,
        details
      };
    });

    return res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // ACTIVE, BLOCKED

    if (Number(userId) === req.user.userId) {
      return res.status(400).json({ success: false, message: 'Cannot block your own administrator account.' });
    }

    const user = await db.findOne('users', u => u.user_id === Number(userId));
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await db.update('users', u => u.user_id === Number(userId), u => {
      u.status = status;
      u.updated_at = new Date().toISOString();
    });

    await db.logAudit({
      userId: req.user.userId,
      userEmail: req.user.email,
      action: status === 'BLOCKED' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      entityName: 'USERS',
      entityId: userId,
      ipAddress: req.ip,
      details: `User ${user.email} status set to ${status}`
    });

    return res.json({ success: true, message: `User account status set to ${status}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
};

exports.verifyDonor = async (req, res) => {
  try {
    const { donorId } = req.params;
    const { verificationStatus } = req.body; // VERIFIED, REJECTED

    const donor = await db.findOne('donorProfiles', d => d.donor_id === Number(donorId));
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    await db.update('donorProfiles', d => d.donor_id === Number(donorId), d => {
      d.verification_status = verificationStatus;
      d.updated_at = new Date().toISOString();
    });

    await db.createNotification({
      userId: donor.user_id,
      title: 'Donor Account Verified',
      message: 'Your donor profile and credentials have been verified by system administration. Thank you for your commitment to saving lives.',
      type: 'SUCCESS'
    });

    await db.logAudit({
      userId: req.user.userId,
      userEmail: req.user.email,
      action: 'DONOR_VERIFIED',
      entityName: 'DONOR_PROFILES',
      entityId: donorId,
      details: `Donor #${donorId} verified by admin`
    });

    return res.json({ success: true, message: `Donor verification status set to ${verificationStatus}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to verify donor.' });
  }
};

// All Blood Requests System-Wide
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await db.find('bloodRequests');
    const hospitals = await db.find('hospitals');
    const patients = await db.find('patientProfiles');

    const enriched = requests.map(r => {
      const hosp = hospitals.find(h => h.hospital_id === r.hospital_id);
      const pat = patients.find(p => p.patient_id === r.patient_id);
      return {
        ...r,
        hospitalName: hosp ? hosp.hospital_name : 'Unknown Hospital',
        patientCity: pat ? pat.city : ''
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch all requests.' });
  }
};

// Blood Group Rules
exports.getBloodGroupRules = async (req, res) => {
  try {
    const rules = await db.find('bloodGroups');
    return res.json({ success: true, data: rules });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch blood group rules.' });
  }
};

// Audit Logs
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await db.find('auditLogs');
    const sorted = logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.json({ success: true, count: sorted.length, data: sorted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
};

// System Settings & Configuration
exports.getSettings = async (req, res) => {
  try {
    const settings = await db.find('systemSettings');
    const charges = await db.find('serviceCharges');
    return res.json({ success: true, settings, charges });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch system settings.' });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { settingKey, settingValue } = req.body;
    if (!settingKey) {
      return res.status(400).json({ success: false, message: 'Setting key is required.' });
    }

    await db.update('systemSettings', s => s.setting_key === settingKey, s => {
      s.setting_value = String(settingValue);
      s.updated_by_user_id = req.user.userId;
      s.updated_at = new Date().toISOString();
    });

    await db.logAudit({
      userId: req.user.userId,
      userEmail: req.user.email,
      action: 'SYSTEM_SETTING_UPDATED',
      entityName: 'SYSTEM_SETTINGS',
      entityId: settingKey,
      details: `Updated ${settingKey} to: ${settingValue}`
    });

    return res.json({ success: true, message: `Setting "${settingKey}" updated.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update system setting.' });
  }
};

exports.updateServiceCharge = async (req, res) => {
  try {
    const { chargeId } = req.params;
    const { amount, isActive, description } = req.body;

    await db.update('serviceCharges', c => c.charge_id === Number(chargeId), c => {
      if (amount !== undefined) c.amount = Number(amount);
      if (isActive !== undefined) c.is_active = isActive ? 1 : 0;
      if (description !== undefined) c.description = description;
      c.updated_by_user_id = req.user.userId;
      c.updated_at = new Date().toISOString();
    });

    await db.logAudit({
      userId: req.user.userId,
      userEmail: req.user.email,
      action: 'SERVICE_CHARGE_CONFIGURED',
      entityName: 'SERVICE_CHARGES',
      entityId: chargeId,
      details: `Service charge #${chargeId} adjusted to $${amount}`
    });

    return res.json({ success: true, message: 'Service charge updated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update service charge.' });
  }
};
