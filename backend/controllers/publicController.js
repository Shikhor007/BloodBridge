const { db } = require('../models/dbAdapter');

exports.getLandingStats = async (req, res) => {
  try {
    const donors = await db.find('donorProfiles');
    const hospitals = await db.find('hospitals', h => h.approval_status === 'APPROVED');
    const requests = await db.find('bloodRequests');
    const completedRequests = requests.filter(r => r.status === 'COMPLETED');
    const bloodUnits = await db.find('bloodUnits');
    
    // Total patients who received blood
    const patientsServedIds = new Set(completedRequests.map(r => r.patient_id));
    const totalPatientsServed = patientsServedIds.size;

    // Total blood bags distributed (units in COMPLETED requests or status ASSIGNED)
    const totalDistributedBags = completedRequests.reduce((acc, curr) => acc + (curr.required_units || 1), 0);

    // Calculate hospital with highest blood usage
    const hospitalUsageMap = {};
    completedRequests.forEach(req => {
      hospitalUsageMap[req.hospital_id] = (hospitalUsageMap[req.hospital_id] || 0) + (req.required_units || 1);
    });

    let topHospitalName = 'N/A';
    let maxUsage = 0;
    for (const [hospId, usage] of Object.entries(hospitalUsageMap)) {
      if (usage > maxUsage) {
        maxUsage = usage;
        const hosp = hospitals.find(h => h.hospital_id === Number(hospId));
        if (hosp) topHospitalName = hosp.hospital_name;
      }
    }

    // Most requested blood group
    const bloodGroupDemandMap = {};
    requests.forEach(r => {
      bloodGroupDemandMap[r.blood_group] = (bloodGroupDemandMap[r.blood_group] || 0) + (r.required_units || 1);
    });

    let mostRequestedGroup = 'O+';
    let maxDemand = 0;
    for (const [grp, count] of Object.entries(bloodGroupDemandMap)) {
      if (count > maxDemand) {
        maxDemand = count;
        mostRequestedGroup = grp;
      }
    }

    // Available blood units right now (only AVAILABLE, not expired, not discarded)
    const availableUnitsCount = bloodUnits.filter(u => u.status === 'AVAILABLE').length;

    // Emergency announcement
    const settings = await db.find('systemSettings');
    const emergencyActive = settings.find(s => s.setting_key === 'EMERGENCY_BANNER_ACTIVE')?.setting_value === '1';
    const emergencyText = settings.find(s => s.setting_key === 'EMERGENCY_BANNER_TEXT')?.setting_value || '';

    return res.json({
      success: true,
      data: {
        totalDonors: donors.length,
        totalHospitals: hospitals.length,
        totalPatientsServed,
        totalDistributedBags,
        availableUnitsCount,
        topHospitalName,
        mostRequestedGroup,
        emergencyAnnouncement: {
          isActive: emergencyActive,
          message: emergencyText
        }
      }
    });
  } catch (error) {
    console.error('Error fetching landing stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to load platform statistics.' });
  }
};

exports.getBloodAvailability = async (req, res) => {
  try {
    const { bloodGroup, district, city, hospitalId } = req.query;

    const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const approvedHospitals = await db.find('hospitals', h => h.approval_status === 'APPROVED');
    const approvedHospIds = new Set(approvedHospitals.map(h => h.hospital_id));

    // Filter units: Must be AVAILABLE and belonging to an approved hospital
    const todayStr = new Date().toISOString().split('T')[0];
    const availableUnits = await db.find('bloodUnits', u => {
      return u.status === 'AVAILABLE' && approvedHospIds.has(u.hospital_id) && u.expiry_date >= todayStr;
    });

    // Summary per blood group
    const summaryByGroup = allGroups.map(grp => {
      const unitsInGroup = availableUnits.filter(u => u.blood_group === grp);
      const hospitalsWithGroup = new Set(unitsInGroup.map(u => u.hospital_id));

      let availabilityStatus = 'NORMAL';
      if (unitsInGroup.length === 0) {
        availabilityStatus = 'CRITICAL_SHORTAGE';
      } else if (unitsInGroup.length < 3) {
        availabilityStatus = 'LOW_SUPPLY';
      } else {
        availabilityStatus = 'WELL_STOCKED';
      }

      return {
        bloodGroup: grp,
        availableUnits: unitsInGroup.length,
        hospitalsCount: hospitalsWithGroup.size,
        status: availabilityStatus
      };
    });

    // Detailed hospital level list (filtered if parameters provided)
    let hospitalInventoryList = [];

    approvedHospitals.forEach(hosp => {
      // Filter conditions
      if (district && hosp.district.toLowerCase() !== district.toLowerCase()) return;
      if (city && hosp.city.toLowerCase() !== city.toLowerCase()) return;
      if (hospitalId && hosp.hospital_id !== Number(hospitalId)) return;

      const hospUnits = availableUnits.filter(u => u.hospital_id === hosp.hospital_id);

      // Blood group breakdown for this hospital
      const breakdown = {};
      allGroups.forEach(g => {
        breakdown[g] = hospUnits.filter(u => u.blood_group === g).length;
      });

      // Filter by requested blood group if requested
      if (bloodGroup && bloodGroup !== 'ALL') {
        const count = breakdown[bloodGroup] || 0;
        hospitalInventoryList.push({
          hospitalId: hosp.hospital_id,
          hospitalName: hosp.hospital_name,
          address: hosp.address,
          district: hosp.district,
          city: hosp.city,
          phone: hosp.phone,
          bloodGroup,
          availableCount: count,
          hasStock: count > 0
        });
      } else {
        hospitalInventoryList.push({
          hospitalId: hosp.hospital_id,
          hospitalName: hosp.hospital_name,
          address: hosp.address,
          district: hosp.district,
          city: hosp.city,
          phone: hosp.phone,
          totalAvailable: hospUnits.length,
          breakdown
        });
      }
    });

    return res.json({
      success: true,
      summary: summaryByGroup,
      hospitals: hospitalInventoryList
    });
  } catch (error) {
    console.error('Error fetching blood availability:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch blood availability.' });
  }
};

exports.getBloodCompatibility = async (req, res) => {
  try {
    const bloodGroups = await db.find('bloodGroups');
    return res.json({ success: true, data: bloodGroups });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch compatibility matrix.' });
  }
};

exports.getServiceCharges = async (req, res) => {
  try {
    const charges = await db.find('serviceCharges', c => c.is_active === 1);
    const totalServiceFee = charges.reduce((acc, curr) => acc + Number(curr.amount), 0);
    return res.json({
      success: true,
      charges,
      totalServiceFee
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch service charges.' });
  }
};

exports.submitContactTicket = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All contact fields are required.' });
    }

    const database = await db.getDb();
    const newId = (database.supportTickets.length > 0 ? Math.max(...database.supportTickets.map(t => t.ticket_id)) : 0) + 1;

    const newTicket = {
      ticket_id: newId,
      user_id: null,
      name,
      email,
      subject,
      message,
      status: 'OPEN',
      response: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.insert('supportTickets', newTicket);

    await db.logAudit({
      userEmail: email,
      action: 'CONTACT_FORM_SUBMISSION',
      entityName: 'SUPPORT_TICKETS',
      entityId: newId,
      details: `Support ticket submitted: ${subject}`
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! A BloodBridge support representative will review your message shortly.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit contact request.' });
  }
};
