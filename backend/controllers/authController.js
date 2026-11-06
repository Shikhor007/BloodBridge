const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../models/dbAdapter');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const { sendNotificationEmail } = require('../config/mailer');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      await db.logAudit({
        action: 'FAILED_LOGIN',
        userEmail: email,
        ipAddress: req.ip,
        details: 'Attempted login with non-existent email.'
      });
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by system administration.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await db.logAudit({
        userId: user.user_id,
        userEmail: user.email,
        action: 'FAILED_LOGIN',
        ipAddress: req.ip,
        details: 'Password mismatch.'
      });
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const roles = await db.find('roles');
    const role = roles.find(r => r.role_id === user.role_id);
    const roleName = role ? role.role_name : 'UNKNOWN';

    // If Hospital, check approval status
    let hospitalInfo = null;
    if (roleName === 'HOSPITAL') {
      hospitalInfo = await db.findOne('hospitals', h => h.user_id === user.user_id);
      if (hospitalInfo && hospitalInfo.approval_status === 'PENDING') {
        return res.status(403).json({
          success: false,
          message: 'Your hospital registration is currently under review by the System Administrator. You will be notified once approved.'
        });
      }
      if (hospitalInfo && hospitalInfo.approval_status === 'REJECTED') {
        return res.status(403).json({
          success: false,
          message: `Hospital registration rejected: ${hospitalInfo.rejection_reason || 'Does not meet accreditation standards.'}`
        });
      }
      if (hospitalInfo && hospitalInfo.approval_status === 'SUSPENDED') {
        return res.status(403).json({
          success: false,
          message: 'This hospital blood bank account is temporarily suspended.'
        });
      }
    }

    let donorInfo = null;
    if (roleName === 'DONOR') {
      donorInfo = await db.findOne('donorProfiles', d => d.user_id === user.user_id);
    }

    let patientInfo = null;
    if (roleName === 'PATIENT') {
      patientInfo = await db.findOne('patientProfiles', p => p.user_id === user.user_id);
    }

    // Update last login
    await db.update('users', u => u.user_id === user.user_id, u => {
      u.last_login = new Date().toISOString();
    });

    const token = jwt.sign(
      { userId: user.user_id, roleId: user.role_id, roleName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await db.logAudit({
      userId: user.user_id,
      userEmail: user.email,
      action: 'LOGIN_SUCCESS',
      ipAddress: req.ip,
      details: `User logged in with role ${roleName}`
    });

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        roleName,
        status: user.status,
        lastLogin: user.last_login,
        donor: donorInfo,
        patient: patientInfo,
        hospital: hospitalInfo
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};

exports.registerDonor = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      district,
      city,
      emergencyContact,
      lastDonationDate
    } = req.body;

    if (!fullName || !email || !phone || !password || !bloodGroup || !dateOfBirth || !gender || !city) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }

    const existingUser = await db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const database = await db.getDb();
    const newUserId = (database.users.length > 0 ? Math.max(...database.users.map(u => u.user_id)) : 0) + 1;
    const newDonorId = (database.donorProfiles.length > 0 ? Math.max(...database.donorProfiles.map(d => d.donor_id)) : 0) + 1;

    const newUser = {
      user_id: newUserId,
      role_id: 3, // DONOR
      email: email.toLowerCase(),
      password_hash: passwordHash,
      full_name: fullName,
      phone,
      status: 'ACTIVE',
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newDonor = {
      donor_id: newDonorId,
      user_id: newUserId,
      blood_group: bloodGroup,
      gender,
      date_of_birth: dateOfBirth,
      address: address || '',
      district: district || city,
      city,
      emergency_contact: emergencyContact || phone,
      last_donation_date: lastDonationDate || null,
      total_donations: lastDonationDate ? 1 : 0,
      verification_status: 'PENDING',
      allow_shortage_alerts: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.insert('users', newUser);
    await db.insert('donorProfiles', newDonor);

    await db.createNotification({
      userId: newUserId,
      title: 'Welcome to BloodBridge!',
      message: `Thank you for registering as a ${bloodGroup} blood donor. Your profile is ready. Check your 3-month eligibility anytime before booking appointments.`,
      type: 'SUCCESS'
    });

    await db.logAudit({
      userId: newUserId,
      userEmail: email,
      action: 'DONOR_REGISTRATION',
      entityName: 'DONOR_PROFILES',
      entityId: newDonorId,
      ipAddress: req.ip,
      details: `New donor registered: ${fullName} (${bloodGroup})`
    });

    sendNotificationEmail(
      email,
      'Welcome to BloodBridge - Donation Community',
      `<h2>Welcome ${fullName}!</h2><p>Thank you for becoming a registered blood donor with BloodBridge. Your generosity saves lives.</p>`
    );

    const token = jwt.sign(
      { userId: newUserId, roleId: 3, roleName: 'DONOR' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Donor account created successfully.',
      token,
      user: {
        userId: newUserId,
        email: newUser.email,
        fullName: newUser.full_name,
        phone: newUser.phone,
        roleName: 'DONOR',
        status: newUser.status,
        donor: newDonor
      }
    });
  } catch (error) {
    console.error('Donor registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during donor registration.' });
  }
};

exports.registerPatient = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      address,
      district,
      city,
      emergencyContact
    } = req.body;

    if (!fullName || !email || !phone || !password || !gender || !city) {
      return res.status(400).json({ success: false, message: 'All required patient fields must be provided.' });
    }

    const existingUser = await db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const database = await db.getDb();
    const newUserId = (database.users.length > 0 ? Math.max(...database.users.map(u => u.user_id)) : 0) + 1;
    const newPatientId = (database.patientProfiles.length > 0 ? Math.max(...database.patientProfiles.map(p => p.patient_id)) : 0) + 1;

    const newUser = {
      user_id: newUserId,
      role_id: 4, // PATIENT
      email: email.toLowerCase(),
      password_hash: passwordHash,
      full_name: fullName,
      phone,
      status: 'ACTIVE',
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newPatient = {
      patient_id: newPatientId,
      user_id: newUserId,
      gender,
      date_of_birth: dateOfBirth || '2000-01-01',
      address: address || '',
      district: district || city,
      city,
      emergency_contact: emergencyContact || phone,
      total_requests: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.insert('users', newUser);
    await db.insert('patientProfiles', newPatient);

    await db.createNotification({
      userId: newUserId,
      title: 'Welcome to BloodBridge Patient Portal',
      message: 'You can now search hospital blood inventories in real-time, submit verified requests, and track blood availability.',
      type: 'INFORMATION'
    });

    await db.logAudit({
      userId: newUserId,
      userEmail: email,
      action: 'PATIENT_REGISTRATION',
      entityName: 'PATIENT_PROFILES',
      entityId: newPatientId,
      ipAddress: req.ip,
      details: `New patient registered: ${fullName}`
    });

    const token = jwt.sign(
      { userId: newUserId, roleId: 4, roleName: 'PATIENT' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Patient account created successfully.',
      token,
      user: {
        userId: newUserId,
        email: newUser.email,
        fullName: newUser.full_name,
        phone: newUser.phone,
        roleName: 'PATIENT',
        status: newUser.status,
        patient: newPatient
      }
    });
  } catch (error) {
    console.error('Patient registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during patient registration.' });
  }
};

exports.registerHospital = async (req, res) => {
  try {
    const {
      hospitalName,
      hospitalEmail,
      phone,
      registrationNumber,
      address,
      district,
      city,
      contactPerson,
      password
    } = req.body;

    if (!hospitalName || !hospitalEmail || !phone || !registrationNumber || !city || !contactPerson || !password) {
      return res.status(400).json({ success: false, message: 'All hospital credentials and registration numbers are required.' });
    }

    const existingUser = await db.findOne('users', u => u.email.toLowerCase() === hospitalEmail.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this hospital email already exists.' });
    }

    const existingReg = await db.findOne('hospitals', h => h.registration_number.toLowerCase() === registrationNumber.toLowerCase());
    if (existingReg) {
      return res.status(409).json({ success: false, message: 'Hospital registration license number already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const database = await db.getDb();
    const newUserId = (database.users.length > 0 ? Math.max(...database.users.map(u => u.user_id)) : 0) + 1;
    const newHospId = (database.hospitals.length > 0 ? Math.max(...database.hospitals.map(h => h.hospital_id)) : 0) + 1;

    const newUser = {
      user_id: newUserId,
      role_id: 2, // HOSPITAL
      email: hospitalEmail.toLowerCase(),
      password_hash: passwordHash,
      full_name: contactPerson,
      phone,
      status: 'ACTIVE',
      last_login: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newHospital = {
      hospital_id: newHospId,
      user_id: newUserId,
      hospital_name: hospitalName,
      hospital_email: hospitalEmail.toLowerCase(),
      phone,
      registration_number: registrationNumber,
      address: address || '',
      district: district || city,
      city,
      contact_person: contactPerson,
      approval_status: 'PENDING',
      rejection_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.insert('users', newUser);
    await db.insert('hospitals', newHospital);

    if (req.file) {
      const docId = (database.hospitalDocuments.length > 0 ? Math.max(...database.hospitalDocuments.map(d => d.document_id)) : 0) + 1;
      await db.insert('hospitalDocuments', {
        document_id: docId,
        hospital_id: newHospId,
        document_type: 'Accreditation / Health Department License',
        file_path: `/uploads/hosp_docs/${req.file.filename}`,
        original_name: req.file.originalname,
        uploaded_at: new Date().toISOString()
      });
    }

    // Alert system admins
    const admins = await db.find('users', u => u.role_id === 1);
    for (const admin of admins) {
      await db.createNotification({
        userId: admin.user_id,
        title: 'New Hospital Registration Pending',
        message: `${hospitalName} (Reg: ${registrationNumber}) registered and awaits System Admin review.`,
        type: 'WARNING'
      });
    }

    await db.logAudit({
      userId: newUserId,
      userEmail: hospitalEmail,
      action: 'HOSPITAL_REGISTRATION_SUBMITTED',
      entityName: 'HOSPITALS',
      entityId: newHospId,
      ipAddress: req.ip,
      details: `Hospital registered with PENDING status: ${hospitalName}`
    });

    return res.status(201).json({
      success: true,
      message: 'Hospital application submitted successfully. An administrator will verify your credentials shortly before your dashboard is activated.'
    });
  } catch (error) {
    console.error('Hospital registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during hospital registration.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await db.findOne('users', u => u.user_id === req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let donor = null;
    let patient = null;
    let hospital = null;

    if (req.user.roleName === 'DONOR') {
      donor = await db.findOne('donorProfiles', d => d.user_id === user.user_id);
    } else if (req.user.roleName === 'PATIENT') {
      patient = await db.findOne('patientProfiles', p => p.user_id === user.user_id);
    } else if (req.user.roleName === 'HOSPITAL') {
      hospital = await db.findOne('hospitals', h => h.user_id === user.user_id);
    }

    return res.json({
      success: true,
      user: {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        roleName: req.user.roleName,
        status: user.status,
        lastLogin: user.last_login,
        donor,
        patient,
        hospital
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, district, city, emergencyContact, allowShortageAlerts } = req.body;

    await db.update('users', u => u.user_id === req.user.userId, u => {
      if (fullName) u.full_name = fullName;
      if (phone) u.phone = phone;
      u.updated_at = new Date().toISOString();
    });

    if (req.user.roleName === 'DONOR') {
      await db.update('donorProfiles', d => d.user_id === req.user.userId, d => {
        if (address !== undefined) d.address = address;
        if (district !== undefined) d.district = district;
        if (city !== undefined) d.city = city;
        if (emergencyContact !== undefined) d.emergency_contact = emergencyContact;
        if (allowShortageAlerts !== undefined) d.allow_shortage_alerts = allowShortageAlerts ? 1 : 0;
        d.updated_at = new Date().toISOString();
      });
    } else if (req.user.roleName === 'PATIENT') {
      await db.update('patientProfiles', p => p.user_id === req.user.userId, p => {
        if (address !== undefined) p.address = address;
        if (district !== undefined) p.district = district;
        if (city !== undefined) p.city = city;
        if (emergencyContact !== undefined) p.emergency_contact = emergencyContact;
        p.updated_at = new Date().toISOString();
      });
    } else if (req.user.roleName === 'HOSPITAL') {
      await db.update('hospitals', h => h.user_id === req.user.userId, h => {
        if (address !== undefined) h.address = address;
        if (district !== undefined) h.district = district;
        if (city !== undefined) h.city = city;
        if (phone !== undefined) h.phone = phone;
        h.updated_at = new Date().toISOString();
      });
    }

    await db.logAudit({
      userId: req.user.userId,
      userEmail: req.user.email,
      action: 'PROFILE_UPDATED',
      details: 'User updated personal profile details'
    });

    return res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating profile.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = await db.findOne('users', u => u.user_id === req.user.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.update('users', u => u.user_id === req.user.userId, u => {
      u.password_hash = newHash;
      u.updated_at = new Date().toISOString();
    });

    await db.logAudit({
      userId: req.user.userId,
      userEmail: req.user.email,
      action: 'PASSWORD_CHANGED',
      details: 'User changed password.'
    });

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error changing password.' });
  }
};
