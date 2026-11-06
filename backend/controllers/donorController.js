const { db } = require('../models/dbAdapter');

// 3-Month Donation Eligibility Calculator
function calculateEligibility(lastDonationDate) {
  if (!lastDonationDate) {
    return {
      isEligible: true,
      lastDonationDate: null,
      nextEligibleDate: new Date().toISOString().split('T')[0],
      daysRemaining: 0,
      statusMessage: 'Eligible for donation (First-time donor subject to medical screening)'
    };
  }

  const lastDate = new Date(lastDonationDate);
  const nextEligible = new Date(lastDate);
  nextEligible.setMonth(nextEligible.getMonth() + 3);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = nextEligible - today;
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return {
      isEligible: true,
      lastDonationDate: lastDate.toISOString().split('T')[0],
      nextEligibleDate: nextEligible.toISOString().split('T')[0],
      daysRemaining: 0,
      statusMessage: 'Eligible for blood donation (Subject to medical screening)'
    };
  } else {
    return {
      isEligible: false,
      lastDonationDate: lastDate.toISOString().split('T')[0],
      nextEligibleDate: nextEligible.toISOString().split('T')[0],
      daysRemaining,
      statusMessage: `Ineligible to donate. Minimum 3-month recovery interval active (${daysRemaining} days remaining until ${nextEligible.toISOString().split('T')[0]}).`
    };
  }
}

exports.getDonorDashboard = async (req, res) => {
  try {
    const donorProfile = await db.findOne('donorProfiles', d => d.user_id === req.user.userId);
    if (!donorProfile) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    const eligibility = calculateEligibility(donorProfile.last_donation_date);

    // Get appointments
    const appointments = await db.find('donationAppointments', a => a.donor_id === donorProfile.donor_id);
    const hospitals = await db.find('hospitals');

    const enrichedAppointments = appointments.map(a => {
      const hosp = hospitals.find(h => h.hospital_id === a.hospital_id);
      return {
        ...a,
        hospital_name: hosp ? hosp.hospital_name : 'Unknown Hospital',
        hospital_address: hosp ? hosp.address : '',
        hospital_city: hosp ? hosp.city : '',
        hospital_phone: hosp ? hosp.phone : ''
      };
    }).sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));

    // Get completed donation records
    const records = await db.find('donationRecords', r => r.donor_id === donorProfile.donor_id);
    const enrichedRecords = records.map(r => {
      const hosp = hospitals.find(h => h.hospital_id === r.hospital_id);
      return {
        ...r,
        hospital_name: hosp ? hosp.hospital_name : 'Hospital Blood Bank'
      };
    }).sort((a, b) => new Date(b.donation_date) - new Date(a.donation_date));

    // Check shortage alert for donor's blood group
    const bloodUnits = await db.find('bloodUnits', u => u.status === 'AVAILABLE' && u.blood_group === donorProfile.blood_group);
    const hasShortage = bloodUnits.length < 3;

    // Upcoming camps
    const camps = await db.find('donationCamps', c => c.status === 'UPCOMING');

    // Milestone calculation
    const totalDonations = donorProfile.total_donations || records.length;
    let badge = 'Novice Donor';
    if (totalDonations >= 10) badge = 'Platinum Lifesaver';
    else if (totalDonations >= 5) badge = 'Gold Hero';
    else if (totalDonations >= 3) badge = 'Silver Champion';
    else if (totalDonations >= 1) badge = 'Bronze Contributor';

    return res.json({
      success: true,
      data: {
        profile: donorProfile,
        eligibility,
        badge,
        metrics: {
          totalDonations,
          lastDonationDate: donorProfile.last_donation_date,
          nextEligibleDate: eligibility.nextEligibleDate,
          isEligible: eligibility.isEligible,
          verificationStatus: donorProfile.verification_status,
          upcomingAppointmentsCount: enrichedAppointments.filter(a => ['PENDING', 'CONFIRMED'].includes(a.status)).length
        },
        appointments: enrichedAppointments,
        donationHistory: enrichedRecords,
        upcomingCamps: camps.slice(0, 3),
        shortageAlert: {
          hasShortage,
          bloodGroup: donorProfile.blood_group,
          availableCount: bloodUnits.length
        }
      }
    });
  } catch (error) {
    console.error('Donor dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load donor dashboard.' });
  }
};

exports.checkEligibility = async (req, res) => {
  try {
    const donorProfile = await db.findOne('donorProfiles', d => d.user_id === req.user.userId);
    if (!donorProfile) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    const eligibility = calculateEligibility(donorProfile.last_donation_date);
    return res.json({
      success: true,
      data: {
        donorName: req.user.fullName,
        bloodGroup: donorProfile.blood_group,
        totalDonations: donorProfile.total_donations,
        ...eligibility
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to check donation eligibility.' });
  }
};

exports.getAvailableSlotsAndCamps = async (req, res) => {
  try {
    const approvedHospitals = await db.find('hospitals', h => h.approval_status === 'APPROVED');
    const camps = await db.find('donationCamps', c => c.status === 'UPCOMING');

    const defaultSlots = [
      '09:00 AM - 10:00 AM',
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '01:00 PM - 02:00 PM',
      '02:00 PM - 03:00 PM',
      '03:00 PM - 04:00 PM'
    ];

    return res.json({
      success: true,
      hospitals: approvedHospitals.map(h => ({
        hospitalId: h.hospital_id,
        hospitalName: h.hospital_name,
        address: h.address,
        district: h.district,
        city: h.city,
        phone: h.phone
      })),
      camps,
      timeSlots: defaultSlots
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load donation slots.' });
  }
};

exports.bookAppointment = async (req, res) => {
  try {
    const donorProfile = await db.findOne('donorProfiles', d => d.user_id === req.user.userId);
    if (!donorProfile) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    // STRICT CHECK: 3-month eligibility interval
    const eligibility = calculateEligibility(donorProfile.last_donation_date);
    if (!eligibility.isEligible) {
      return res.status(400).json({
        success: false,
        message: `Appointment booking blocked: You are currently ineligible to donate. ${eligibility.statusMessage}`
      });
    }

    const { hospitalId, appointmentDate, timeSlot } = req.body;
    if (!hospitalId || !appointmentDate || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Hospital, date, and time slot are required.' });
    }

    const hospital = await db.findOne('hospitals', h => h.hospital_id === Number(hospitalId) && h.approval_status === 'APPROVED');
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found or not approved.' });
    }

    const database = await db.getDb();
    const newId = (database.donationAppointments.length > 0 ? Math.max(...database.donationAppointments.map(a => a.appointment_id)) : 0) + 1;

    const newAppointment = {
      appointment_id: newId,
      donor_id: donorProfile.donor_id,
      hospital_id: Number(hospitalId),
      appointment_date: appointmentDate,
      time_slot: timeSlot,
      status: 'PENDING',
      cancellation_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.insert('donationAppointments', newAppointment);

    // Notify Hospital Admin
    await db.createNotification({
      userId: hospital.user_id,
      title: 'New Donor Appointment Scheduled',
      message: `${req.user.fullName} (${donorProfile.blood_group}) booked a donation slot on ${appointmentDate} at ${timeSlot}.`,
      type: 'INFORMATION'
    });

    // Notify Donor
    await db.createNotification({
      userId: req.user.userId,
      title: 'Appointment Request Submitted',
      message: `Your appointment request for ${appointmentDate} at ${hospital.hospital_name} is awaiting hospital confirmation.`,
      type: 'SUCCESS'
    });

    await db.logAudit({
      userId: req.user.userId,
      userEmail: req.user.email,
      action: 'DONOR_APPOINTMENT_BOOKED',
      entityName: 'DONATION_APPOINTMENTS',
      entityId: newId,
      ipAddress: req.ip,
      details: `Booked appointment #${newId} at ${hospital.hospital_name} on ${appointmentDate}`
    });

    return res.status(201).json({
      success: true,
      message: 'Donation appointment booked successfully.',
      data: newAppointment
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to book appointment.' });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const donorProfile = await db.findOne('donorProfiles', d => d.user_id === req.user.userId);

    const appointment = await db.findOne('donationAppointments', a => a.appointment_id === Number(id));
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment.donor_id !== donorProfile.donor_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this appointment.' });
    }

    await db.update('donationAppointments', a => a.appointment_id === Number(id), a => {
      a.status = 'CANCELLED';
      a.cancellation_reason = reason || 'Cancelled by donor';
      a.updated_at = new Date().toISOString();
    });

    const hospital = await db.findOne('hospitals', h => h.hospital_id === appointment.hospital_id);
    if (hospital) {
      await db.createNotification({
        userId: hospital.user_id,
        title: 'Donation Appointment Cancelled',
        message: `${req.user.fullName} cancelled their donation appointment on ${appointment.appointment_date}.`,
        type: 'WARNING'
      });
    }

    return res.json({ success: true, message: 'Appointment cancelled.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to cancel appointment.' });
  }
};

exports.getCertificateData = async (req, res) => {
  try {
    const donorProfile = await db.findOne('donorProfiles', d => d.user_id === req.user.userId);
    const records = await db.find('donationRecords', r => r.donor_id === donorProfile.donor_id);

    return res.json({
      success: true,
      certificate: {
        donorName: req.user.fullName,
        bloodGroup: donorProfile.blood_group,
        totalDonations: donorProfile.total_donations || records.length,
        issueDate: new Date().toISOString().split('T')[0],
        certificateId: `BB-CERT-${donorProfile.donor_id}-${Date.now().toString().slice(-6)}`,
        organization: 'BloodBridge Healthcare Alliance'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to generate certificate.' });
  }
};
