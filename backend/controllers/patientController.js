const { db } = require('../models/dbAdapter');

exports.getPatientDashboard = async (req, res) => {
  try {
    const patientProfile = await db.findOne('patientProfiles', p => p.user_id === req.user.userId);
    if (!patientProfile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const allRequests = await db.find('bloodRequests', r => r.patient_id === patientProfile.patient_id);
    const hospitals = await db.find('hospitals');

    const totalRequests = allRequests.length;
    const pendingRequests = allRequests.filter(r => ['SUBMITTED', 'UNDER_REVIEW'].includes(r.status)).length;
    const approvedRequests = allRequests.filter(r => ['APPROVED', 'BLOOD_ASSIGNED', 'READY_FOR_COLLECTION'].includes(r.status)).length;
    const completedRequests = allRequests.filter(r => r.status === 'COMPLETED').length;
    const rejectedRequests = allRequests.filter(r => r.status === 'REJECTED').length;

    // Enrich requests with hospital name
    const enrichedRequests = allRequests.map(r => {
      const hosp = hospitals.find(h => h.hospital_id === r.hospital_id);
      return {
        ...r,
        hospital_name: hosp ? hosp.hospital_name : 'Unknown Hospital',
        hospital_phone: hosp ? hosp.phone : '',
        hospital_city: hosp ? hosp.city : ''
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Future requests / waitlist
    const futureRequests = await db.find('futureRequests', f => f.patient_id === patientProfile.patient_id);

    return res.json({
      success: true,
      data: {
        profile: patientProfile,
        metrics: {
          totalRequests,
          pendingRequests,
          approvedRequests,
          completedRequests,
          rejectedRequests
        },
        recentRequests: enrichedRequests.slice(0, 5),
        allRequests: enrichedRequests,
        futureRequests
      }
    });
  } catch (error) {
    console.error('Patient dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load patient dashboard.' });
  }
};

exports.submitBloodRequest = async (req, res) => {
  try {
    const patientProfile = await db.findOne('patientProfiles', p => p.user_id === req.user.userId);
    if (!patientProfile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const {
      hospitalId,
      bloodGroup,
      requiredUnits,
      requiredDate,
      priority,
      patientName,
      patientAge,
      treatmentLocation,
      doctorName,
      doctorContact,
      additionalNotes
    } = req.body;

    if (!hospitalId || !bloodGroup || !requiredUnits || !requiredDate || !patientName || !treatmentLocation || !doctorName) {
      return res.status(400).json({ success: false, message: 'Please provide all mandatory request details.' });
    }

    const hospital = await db.findOne('hospitals', h => h.hospital_id === Number(hospitalId) && h.approval_status === 'APPROVED');
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Selected hospital not found or not approved.' });
    }

    // Calculate transparent service charge
    const charges = await db.find('serviceCharges', c => c.is_active === 1);
    const unitCharge = charges.reduce((acc, c) => acc + Number(c.amount), 0);
    const totalServiceCharge = unitCharge * Number(requiredUnits);

    const database = await db.getDb();
    const newRequestId = (database.bloodRequests.length > 0 ? Math.max(...database.bloodRequests.map(r => r.request_id)) : 0) + 1;

    const newRequest = {
      request_id: newRequestId,
      patient_id: patientProfile.patient_id,
      hospital_id: Number(hospitalId),
      blood_group: bloodGroup,
      required_units: Number(requiredUnits),
      required_date: requiredDate,
      priority: priority === 'EMERGENCY' ? 'EMERGENCY' : 'NORMAL',
      patient_name: patientName,
      patient_age: Number(patientAge || 30),
      treatment_location: treatmentLocation,
      doctor_name: doctorName,
      doctor_contact: doctorContact || '',
      additional_notes: additionalNotes || '',
      service_charge: totalServiceCharge,
      assigned_units: [],
      status: 'SUBMITTED',
      rejection_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.insert('bloodRequests', newRequest);

    // Save medical document if uploaded
    if (req.file) {
      const docId = (database.requestDocuments.length > 0 ? Math.max(...database.requestDocuments.map(d => d.document_id)) : 0) + 1;
      await db.insert('requestDocuments', {
        document_id: docId,
        request_id: newRequestId,
        document_type: 'Doctor Prescription / Medical Report',
        file_path: `/uploads/prescriptions/${req.file.filename}`,
        original_name: req.file.originalname,
        uploaded_at: new Date().toISOString()
      });
    }

    // Record initial status history
    const histId = (database.requestStatusHistory.length > 0 ? Math.max(...database.requestStatusHistory.map(h => h.history_id)) : 0) + 1;
    await db.insert('requestStatusHistory', {
      history_id: histId,
      request_id: newRequestId,
      status: 'SUBMITTED',
      comments: `Request submitted by patient ${req.user.fullName} with ${priority || 'NORMAL'} priority.`,
      changed_by_user_id: req.user.userId,
      changed_at: new Date().toISOString()
    });

    // Increment patient request count
    await db.update('patientProfiles', p => p.patient_id === patientProfile.patient_id, p => {
      p.total_requests = (p.total_requests || 0) + 1;
      p.updated_at = new Date().toISOString();
    });

    // Notify Hospital Admin
    await db.createNotification({
      userId: hospital.user_id,
      title: priority === 'EMERGENCY' ? '🚨 Urgent Emergency Blood Request' : 'New Blood Request Submitted',
      message: `Request #${newRequestId} received for ${requiredUnits} unit(s) of ${bloodGroup} for patient ${patientName}.`,
      type: priority === 'EMERGENCY' ? 'EMERGENCY' : 'INFORMATION'
    });

    // Notify Patient
    await db.createNotification({
      userId: req.user.userId,
      title: 'Blood Request Submitted Successfully',
      message: `Your request #${newRequestId} for ${requiredUnits} unit(s) of ${bloodGroup} at ${hospital.hospital_name} is now under review.`,
      type: 'SUCCESS'
    });

    await db.logAudit({
      userId: req.user.userId,
      userEmail: req.user.email,
      action: 'BLOOD_REQUEST_SUBMITTED',
      entityName: 'BLOOD_REQUESTS',
      entityId: newRequestId,
      ipAddress: req.ip,
      details: `Request #${newRequestId}: ${requiredUnits} units of ${bloodGroup} at ${hospital.hospital_name}`
    });

    return res.status(201).json({
      success: true,
      message: 'Blood request submitted successfully.',
      requestId: newRequestId,
      serviceCharge: totalServiceCharge
    });
  } catch (error) {
    console.error('Submit blood request error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit blood request.' });
  }
};

exports.getRequestTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const patientProfile = await db.findOne('patientProfiles', p => p.user_id === req.user.userId);
    if (!patientProfile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const request = await db.findOne('bloodRequests', r => r.request_id === Number(id));
    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found.' });
    }

    // Security check: Must belong to current patient
    if (request.patient_id !== patientProfile.patient_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this request.' });
    }

    const hospital = await db.findOne('hospitals', h => h.hospital_id === request.hospital_id);
    const documents = await db.find('requestDocuments', d => d.request_id === request.request_id);
    const history = await db.find('requestStatusHistory', h => h.request_id === request.request_id);
    const sortedHistory = history.sort((a, b) => new Date(a.changed_at) - new Date(b.changed_at));

    return res.json({
      success: true,
      data: {
        request,
        hospital: {
          hospitalName: hospital?.hospital_name,
          phone: hospital?.phone,
          address: hospital?.address,
          city: hospital?.city,
          contactPerson: hospital?.contact_person
        },
        documents,
        timeline: sortedHistory
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load request tracking details.' });
  }
};

exports.registerFutureRequest = async (req, res) => {
  try {
    const patientProfile = await db.findOne('patientProfiles', p => p.user_id === req.user.userId);
    if (!patientProfile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const { bloodGroup, requiredUnits, preferredCity, notes } = req.body;
    if (!bloodGroup) {
      return res.status(400).json({ success: false, message: 'Blood group is required.' });
    }

    const database = await db.getDb();
    const newId = (database.futureRequests.length > 0 ? Math.max(...database.futureRequests.map(f => f.future_request_id || 0)) : 0) + 1;

    const futureReq = {
      future_request_id: newId,
      patient_id: patientProfile.patient_id,
      blood_group: bloodGroup,
      required_units: Number(requiredUnits || 1),
      preferred_city: preferredCity || patientProfile.city || 'Any',
      status: 'SEARCHING',
      notes: notes || '',
      created_at: new Date().toISOString()
    };

    await db.insert('futureRequests', futureReq);

    await db.createNotification({
      userId: req.user.userId,
      title: 'Waitlist Registered for ' + bloodGroup,
      message: `You have been added to the shortage waitlist for ${bloodGroup}. We will notify you immediately when matching blood units become available.`,
      type: 'INFORMATION'
    });

    return res.status(201).json({
      success: true,
      message: 'Future request registered. You will be alerted as soon as matching blood units enter inventory.',
      data: futureReq
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to register future blood request.' });
  }
};
