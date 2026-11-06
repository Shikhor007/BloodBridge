const { db } = require('../models/dbAdapter');

// Helper to get authenticated hospital entity
async function getHospitalForUser(userId) {
  const hospital = await db.findOne('hospitals', h => h.user_id === userId);
  return hospital;
}

exports.getHospitalDashboard = async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user.userId);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital record not found.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0];

    // Hospital's Blood Units
    const units = await db.find('bloodUnits', u => u.hospital_id === hospital.hospital_id);
    const availableUnits = units.filter(u => u.status === 'AVAILABLE' && u.expiry_date >= todayStr);
    const expiringSoonUnits = units.filter(u => u.status === 'AVAILABLE' && u.expiry_date >= todayStr && u.expiry_date <= sevenDaysStr);
    const expiredUnits = units.filter(u => u.status === 'EXPIRED' || (u.status === 'AVAILABLE' && u.expiry_date < todayStr));
    const discardedUnits = units.filter(u => u.status === 'DISCARDED');

    // Hospital's Patient Requests
    const requests = await db.find('bloodRequests', r => r.hospital_id === hospital.hospital_id);
    const pendingRequests = requests.filter(r => ['SUBMITTED', 'UNDER_REVIEW'].includes(r.status));
    const approvedRequests = requests.filter(r => ['APPROVED', 'BLOOD_ASSIGNED', 'READY_FOR_COLLECTION'].includes(r.status));
    const completedRequests = requests.filter(r => r.status === 'COMPLETED');

    // Hospital's Donor Appointments
    const appointments = await db.find('donationAppointments', a => a.hospital_id === hospital.hospital_id);
    const upcomingAppointments = appointments.filter(a => ['PENDING', 'CONFIRMED'].includes(a.status));

    // Blood Group Inventory Distribution
    const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const groupDistribution = allGroups.map(grp => {
      const count = availableUnits.filter(u => u.blood_group === grp).length;
      return {
        bloodGroup: grp,
        units: count,
        shortage: count < 2
      };
    });

    const currentShortages = groupDistribution.filter(g => g.shortage).map(g => g.bloodGroup);

    // Monthly Analytics Mock / Aggregated from history
    const monthlyData = [
      { month: 'Jun', collected: 24, used: 20, discarded: 1 },
      { month: 'Jul', collected: 28, used: 22, discarded: 2 },
      { month: 'Aug', collected: 32, used: 29, discarded: 1 },
      { month: 'Sep', collected: 30, used: 26, discarded: 0 },
      { month: 'Oct', collected: 35, used: 31, discarded: 2 },
      { month: 'Nov', collected: 14, used: 9, discarded: 1 }
    ];

    return res.json({
      success: true,
      hospital,
      metrics: {
        totalAvailableBags: availableUnits.length,
        totalInventoryRecords: units.length,
        pendingRequests: pendingRequests.length,
        approvedRequests: approvedRequests.length,
        completedRequests: completedRequests.length,
        upcomingAppointments: upcomingAppointments.length,
        expiringSoonCount: expiringSoonUnits.length,
        expiredCount: expiredUnits.length,
        discardedCount: discardedUnits.length,
        currentShortages
      },
      groupDistribution,
      monthlyAnalytics: monthlyData,
      recentRequests: requests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
    });
  } catch (error) {
    console.error('Hospital dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load hospital dashboard.' });
  }
};

// Unit-Level Blood Inventory
exports.getInventory = async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user.userId);
    const { bloodGroup, status } = req.query;

    let units = await db.find('bloodUnits', u => u.hospital_id === hospital.hospital_id);

    if (bloodGroup && bloodGroup !== 'ALL') {
      units = units.filter(u => u.blood_group === bloodGroup);
    }
    if (status && status !== 'ALL') {
      units = units.filter(u => u.status === status);
    }

    units.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));

    return res.json({ success: true, count: units.length, data: units });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch inventory.' });
  }
};

exports.addBloodUnit = async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user.userId);
    const { bloodGroup, collectionDate, expiryDate, donationReference, storageStatus } = req.body;

    if (!bloodGroup || !collectionDate || !expiryDate) {
      return res.status(400).json({ success: false, message: 'Blood group, collection date, and expiry date are required.' });
    }

    const uniqueUnitId = `UNIT-H${hospital.hospital_id}-${bloodGroup.replace('+', 'P').replace('-', 'N')}-${Date.now().toString().slice(-6)}`;

    const newUnit = {
      unit_id: uniqueUnitId,
      hospital_id: hospital.hospital_id,
      blood_group: bloodGroup,
      collection_date: collectionDate,
      expiry_date: expiryDate,
      donation_reference: donationReference || 'DIRECT_ADDITION',
      storage_status: storageStatus || 'Main Cold Room - Shelf A',
      status: 'AVAILABLE',
      discard_reason: null,
      created_at: new Date().toISOString()
    };

    await db.insert('bloodUnits', newUnit);

    // Check future requests / waitlist to alert matching patients
    const futureWaitlist = await db.find('futureRequests', f => f.blood_group === bloodGroup && f.status === 'SEARCHING');
    for (const wait of futureWaitlist) {
      const patient = await db.findOne('patientProfiles', p => p.patient_id === wait.patient_id);
      if (patient) {
        await db.createNotification({
          userId: patient.user_id,
          title: `Match Available: ${bloodGroup} Blood Unit`,
          message: `${hospital.hospital_name} has just registered an available ${bloodGroup} unit matching your waitlist request!`,
          type: 'SUCCESS'
        });
        await db.update('futureRequests', f => f.future_request_id === wait.future_request_id, f => {
          f.status = 'MATCH_NOTIFIED';
        });
      }
    }

    await db.logAudit({
      userId: req.user.userId,
      userEmail: req.user.email,
      action: 'BLOOD_UNIT_ADDED',
      entityName: 'BLOOD_UNITS',
      entityId: uniqueUnitId,
      ipAddress: req.ip,
      details: `Added new unit ${uniqueUnitId} (${bloodGroup}) at ${hospital.hospital_name}`
    });

    return res.status(201).json({ success: true, message: 'Blood unit registered successfully.', data: newUnit });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add blood unit.' });
  }
};

exports.discardBloodUnit = async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user.userId);
    const { unitId } = req.params;
    const { reason } = req.body;

    const unit = await db.findOne('bloodUnits', u => u.unit_id === unitId && u.hospital_id === hospital.hospital_id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Blood unit not found in this hospital inventory.' });
    }

    if (unit.status === 'ASSIGNED') {
      return res.status(400).json({ success: false, message: 'Cannot discard unit that is already assigned to a patient.' });
    }

    await db.update('bloodUnits', u => u.unit_id === unitId, u => {
      u.status = 'DISCARDED';
      u.discard_reason = reason || 'Discarded per lab protocols';
    });

    await db.logAudit({
      userId: req.user.userId,
      userEmail: req.user.email,
      action: 'BLOOD_UNIT_DISCARDED',
      entityName: 'BLOOD_UNITS',
      entityId: unitId,
      details: `Discarded ${unitId} (${unit.blood_group}). Reason: ${reason}`
    });

    return res.json({ success: true, message: `Unit ${unitId} marked as discarded.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to discard unit.' });
  }
};

// Concurrency-Safe Blood Unit Assignment to Patient Request
exports.assignUnitsToRequest = async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user.userId);
    const { requestId } = req.params;
    const { unitIds } = req.body; // Array of unit_id strings

    if (!unitIds || !Array.isArray(unitIds) || unitIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one unit to assign.' });
    }

    // Execute within atomic database transaction lock to prevent race conditions / double assignment!
    const result = await db.runTransaction(async (database) => {
      const request = database.bloodRequests.find(r => r.request_id === Number(requestId) && r.hospital_id === hospital.hospital_id);
      if (!request) {
        throw new Error('Request not found in this hospital.');
      }

      if (['COMPLETED', 'REJECTED', 'CANCELLED'].includes(request.status)) {
        throw new Error(`Cannot assign units to request with status: ${request.status}`);
      }

      const todayStr = new Date().toISOString().split('T')[0];

      // Validate all selected units atomically
      for (const id of unitIds) {
        const unit = database.bloodUnits.find(u => u.unit_id === id && u.hospital_id === hospital.hospital_id);
        if (!unit) {
          throw new Error(`Unit ${id} not found in this hospital inventory.`);
        }
        if (unit.status !== 'AVAILABLE') {
          throw new Error(`Concurrency conflict: Unit ${id} is no longer available (current status: ${unit.status}).`);
        }
        if (unit.expiry_date < todayStr) {
          throw new Error(`Safety violation: Unit ${id} has expired on ${unit.expiry_date} and cannot be assigned.`);
        }
      }

      // Assign units
      for (const id of unitIds) {
        const unit = database.bloodUnits.find(u => u.unit_id === id);
        unit.status = 'ASSIGNED';
      }

      // Update request
      request.assigned_units = Array.from(new Set([...(request.assigned_units || []), ...unitIds]));
      if (request.assigned_units.length >= request.required_units) {
        request.status = 'READY_FOR_COLLECTION';
      } else {
        request.status = 'BLOOD_ASSIGNED';
      }
      request.updated_at = new Date().toISOString();

      // Record status history
      const histId = (database.requestStatusHistory.length > 0 ? Math.max(...database.requestStatusHistory.map(h => h.history_id)) : 0) + 1;
      database.requestStatusHistory.push({
        history_id: histId,
        request_id: request.request_id,
        status: request.status,
        comments: `Assigned unit(s): ${unitIds.join(', ')} by hospital admin. Status updated to ${request.status}.`,
        changed_by_user_id: req.user.userId,
        changed_at: new Date().toISOString()
      });

      // Find patient user id to notify
      const patient = database.patientProfiles.find(p => p.patient_id === request.patient_id);
      if (patient) {
        const notifId = (database.notifications.length > 0 ? Math.max(...database.notifications.map(n => n.notification_id)) : 0) + 1;
        database.notifications.push({
          notification_id: notifId,
          user_id: patient.user_id,
          title: request.status === 'READY_FOR_COLLECTION' ? 'Blood Ready For Collection' : 'Blood Units Assigned',
          message: `Your request #${request.request_id} has ${request.assigned_units.length} unit(s) assigned and is ${request.status.replace(/_/g, ' ')}.`,
          notification_type: 'SUCCESS',
          is_read: 0,
          created_at: new Date().toISOString()
        });
      }

      return { request, assignedUnits: unitIds };
    });

    await db.logAudit({
      userId: req.user.userId,
      userEmail: req.user.email,
      action: 'BLOOD_UNITS_ASSIGNED',
      entityName: 'BLOOD_REQUESTS',
      entityId: requestId,
      ipAddress: req.ip,
      details: `Assigned units [${unitIds.join(', ')}] to request #${requestId}`
    });

    return res.json({
      success: true,
      message: 'Units successfully assigned with concurrency validation.',
      data: result
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Patient Requests Management
exports.getHospitalRequests = async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user.userId);
    const requests = await db.find('bloodRequests', r => r.hospital_id === hospital.hospital_id);
    const patients = await db.find('patientProfiles');
    const documents = await db.find('requestDocuments');

    const enriched = requests.map(r => {
      const patient = patients.find(p => p.patient_id === r.patient_id);
      const docs = documents.filter(d => d.request_id === r.request_id);
      return {
        ...r,
        patientContact: patient ? patient.emergency_contact : 'N/A',
        documents: docs
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch patient requests.' });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user.userId);
    const { requestId } = req.params;
    const { status, comments, rejectionReason } = req.body;

    const request = await db.findOne('bloodRequests', r => r.request_id === Number(requestId) && r.hospital_id === hospital.hospital_id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    await db.update('bloodRequests', r => r.request_id === Number(requestId), r => {
      r.status = status;
      if (rejectionReason) r.rejection_reason = rejectionReason;
      r.updated_at = new Date().toISOString();
    });

    const database = await db.getDb();
    const histId = (database.requestStatusHistory.length > 0 ? Math.max(...database.requestStatusHistory.map(h => h.history_id)) : 0) + 1;
    await db.insert('requestStatusHistory', {
      history_id: histId,
      request_id: Number(requestId),
      status,
      comments: comments || (status === 'REJECTED' ? `Rejected: ${rejectionReason}` : `Status updated to ${status}`),
      changed_by_user_id: req.user.userId,
      changed_at: new Date().toISOString()
    });

    const patient = await db.findOne('patientProfiles', p => p.patient_id === request.patient_id);
    if (patient) {
      await db.createNotification({
        userId: patient.user_id,
        title: `Request #${request.request_id} Updated: ${status.replace(/_/g, ' ')}`,
        message: comments || (status === 'REJECTED' ? `Reason: ${rejectionReason}` : `Your blood request status has been updated to ${status}.`),
        type: status === 'REJECTED' ? 'WARNING' : 'INFORMATION'
      });
    }

    return res.json({ success: true, message: `Request status updated to ${status}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update request status.' });
  }
};

// Donor Appointment Management & Screening Completion
exports.getHospitalAppointments = async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user.userId);
    const appointments = await db.find('donationAppointments', a => a.hospital_id === hospital.hospital_id);
    const donors = await db.find('donorProfiles');
    const users = await db.find('users');

    const enriched = appointments.map(a => {
      const donor = donors.find(d => d.donor_id === a.donor_id);
      const user = donor ? users.find(u => u.user_id === donor.user_id) : null;
      return {
        ...a,
        donorName: user ? user.full_name : 'Unknown Donor',
        donorEmail: user ? user.email : '',
        donorPhone: user ? user.phone : '',
        bloodGroup: donor ? donor.blood_group : '',
        totalDonations: donor ? donor.total_donations : 0,
        lastDonationDate: donor ? donor.last_donation_date : null
      };
    }).sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));

    return res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch appointments.' });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user.userId);
    const { appointmentId } = req.params;
    const { status, reason } = req.body;

    const appointment = await db.findOne('donationAppointments', a => a.appointment_id === Number(appointmentId) && a.hospital_id === hospital.hospital_id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    await db.update('donationAppointments', a => a.appointment_id === Number(appointmentId), a => {
      a.status = status;
      if (reason) a.cancellation_reason = reason;
      a.updated_at = new Date().toISOString();
    });

    const donor = await db.findOne('donorProfiles', d => d.donor_id === appointment.donor_id);
    if (donor) {
      await db.createNotification({
        userId: donor.user_id,
        title: `Appointment ${status}`,
        message: `Your donation appointment on ${appointment.appointment_date} at ${hospital.hospital_name} has been ${status.toLowerCase()}.`,
        type: status === 'CONFIRMED' ? 'SUCCESS' : 'WARNING'
      });
    }

    return res.json({ success: true, message: `Appointment status set to ${status}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update appointment.' });
  }
};

// Record Completed Blood Donation & Medical Screening
exports.recordDonationCompletion = async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user.userId);
    const {
      appointmentId,
      donorId,
      bloodGroup,
      hemoglobinLevel,
      bloodPressure,
      pulseRate,
      screeningStatus,
      processingStatus,
      addDirectlyToInventory
    } = req.body;

    if (!donorId || !bloodGroup) {
      return res.status(400).json({ success: false, message: 'Donor and blood group are required.' });
    }

    const donor = await db.findOne('donorProfiles', d => d.donor_id === Number(donorId));
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const database = await db.getDb();
    const newRecordId = (database.donationRecords.length > 0 ? Math.max(...database.donationRecords.map(r => r.record_id)) : 0) + 1;

    let assignedUnitId = null;

    // Only add to inventory if screening passed and testing passed
    if (screeningStatus === 'PASSED' && processingStatus === 'TESTED_AND_STORED' && addDirectlyToInventory) {
      assignedUnitId = `UNIT-H${hospital.hospital_id}-${bloodGroup.replace('+', 'P').replace('-', 'N')}-${Date.now().toString().slice(-6)}`;
      
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 42); // Standard red blood cell 42-day lifespan
      
      const newUnit = {
        unit_id: assignedUnitId,
        hospital_id: hospital.hospital_id,
        blood_group: bloodGroup,
        collection_date: todayStr,
        expiry_date: expiry.toISOString().split('T')[0],
        donation_reference: `DON-REC-${newRecordId}`,
        storage_status: 'Sterile Collection Cooler Bay',
        status: 'AVAILABLE',
        discard_reason: null,
        created_at: new Date().toISOString()
      };
      await db.insert('bloodUnits', newUnit);
    }

    const newRecord = {
      record_id: newRecordId,
      appointment_id: appointmentId ? Number(appointmentId) : null,
      donor_id: Number(donorId),
      hospital_id: hospital.hospital_id,
      blood_group: bloodGroup,
      quantity_ml: 450,
      hemoglobin_level: Number(hemoglobinLevel || 13.5),
      blood_pressure: bloodPressure || '120/80',
      pulse_rate: Number(pulseRate || 72),
      screening_status: screeningStatus || 'PASSED',
      processing_status: processingStatus || 'TESTED_AND_STORED',
      unit_id: assignedUnitId,
      donation_date: todayStr,
      created_at: new Date().toISOString()
    };

    await db.insert('donationRecords', newRecord);

    // Update appointment status to COMPLETED if linked
    if (appointmentId) {
      await db.update('donationAppointments', a => a.appointment_id === Number(appointmentId), a => {
        a.status = 'COMPLETED';
        a.updated_at = new Date().toISOString();
      });
    }

    // Update donor profile: last donation date = today, increment count
    if (screeningStatus === 'PASSED') {
      await db.update('donorProfiles', d => d.donor_id === Number(donorId), d => {
        d.last_donation_date = todayStr;
        d.total_donations = (d.total_donations || 0) + 1;
        d.updated_at = new Date().toISOString();
      });

      await db.createNotification({
        userId: donor.user_id,
        title: 'Thank You For Your Blood Donation!',
        message: `Your donation of ${bloodGroup} blood at ${hospital.hospital_name} has been processed. Your generosity helps save lives!`,
        type: 'SUCCESS'
      });
    }

    await db.logAudit({
      userId: req.user.userId,
      userEmail: req.user.email,
      action: 'DONATION_RECORDED',
      entityName: 'DONATION_RECORDS',
      entityId: newRecordId,
      ipAddress: req.ip,
      details: `Recorded blood donation for donor #${donorId} (${bloodGroup}). Screening: ${screeningStatus}`
    });

    return res.status(201).json({
      success: true,
      message: 'Donation screening and record stored successfully.',
      data: newRecord
    });
  } catch (error) {
    console.error('Record donation completion error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record donation completion.' });
  }
};

// Donation Camps
exports.getHospitalCamps = async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user.userId);
    const camps = await db.find('donationCamps', c => c.hospital_id === hospital.hospital_id);
    return res.json({ success: true, data: camps });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch camps.' });
  }
};

exports.createCamp = async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user.userId);
    const { campName, location, district, city, startDate, endDate, startTime, endTime, targetUnits } = req.body;

    if (!campName || !location || !city || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Please provide all camp details.' });
    }

    const database = await db.getDb();
    const newId = (database.donationCamps.length > 0 ? Math.max(...database.donationCamps.map(c => c.camp_id)) : 0) + 1;

    const newCamp = {
      camp_id: newId,
      hospital_id: hospital.hospital_id,
      camp_name: campName,
      location,
      district: district || city,
      city,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime || '09:00 AM',
      end_time: endTime || '04:00 PM',
      target_units: Number(targetUnits || 100),
      collected_units: 0,
      status: 'UPCOMING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.insert('donationCamps', newCamp);

    await db.logAudit({
      userId: req.user.userId,
      userEmail: req.user.email,
      action: 'DONATION_CAMP_CREATED',
      entityName: 'DONATION_CAMPS',
      entityId: newId,
      details: `Created blood donation camp "${campName}" at ${location}`
    });

    return res.status(201).json({ success: true, message: 'Donation camp created successfully.', data: newCamp });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create donation camp.' });
  }
};

// Reports and Export Data
exports.getReports = async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user.userId);
    const units = await db.find('bloodUnits', u => u.hospital_id === hospital.hospital_id);
    const requests = await db.find('bloodRequests', r => r.hospital_id === hospital.hospital_id);
    const donations = await db.find('donationRecords', d => d.hospital_id === hospital.hospital_id);

    const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const groupReport = allGroups.map(grp => {
      const totalUnits = units.filter(u => u.blood_group === grp).length;
      const availableUnits = units.filter(u => u.blood_group === grp && u.status === 'AVAILABLE').length;
      const assignedUnits = units.filter(u => u.blood_group === grp && u.status === 'ASSIGNED').length;
      const discardedUnits = units.filter(u => u.blood_group === grp && u.status === 'DISCARDED').length;
      return {
        bloodGroup: grp,
        totalBags: totalUnits,
        available: availableUnits,
        assigned: assignedUnits,
        discarded: discardedUnits
      };
    });

    return res.json({
      success: true,
      summary: {
        hospitalName: hospital.hospital_name,
        totalDonationsRecorded: donations.length,
        totalRequestsHandled: requests.length,
        totalInventoryEver: units.length,
        generatedAt: new Date().toISOString()
      },
      bloodGroupBreakdown: groupReport,
      inventoryRecords: units,
      donationRecords: donations
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to generate hospital reports.' });
  }
};
