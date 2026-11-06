const bcrypt = require('bcryptjs');

async function getInitialSeedData() {
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const hospitalPassword = await bcrypt.hash('Hospital@123', 10);
  const donorPassword = await bcrypt.hash('Donor@123', 10);
  const patientPassword = await bcrypt.hash('Patient@123', 10);

  const roles = [
    { role_id: 1, role_name: 'ADMIN', description: 'System Administrator' },
    { role_id: 2, role_name: 'HOSPITAL', description: 'Hospital Administrator' },
    { role_id: 3, role_name: 'DONOR', description: 'Blood Donor' },
    { role_id: 4, role_name: 'PATIENT', description: 'Patient' }
  ];

  const users = [
    {
      user_id: 1,
      role_id: 1,
      email: 'admin@bloodbridge.org',
      password_hash: adminPassword,
      full_name: 'Dr. Eleanor Vance',
      phone: '+1-555-0100',
      status: 'ACTIVE',
      last_login: new Date().toISOString(),
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      user_id: 2,
      role_id: 2,
      email: 'citygeneral@bloodbridge.org',
      password_hash: hospitalPassword,
      full_name: 'Dr. Robert Davis',
      phone: '+1-555-0201',
      status: 'ACTIVE',
      last_login: new Date().toISOString(),
      created_at: new Date('2026-01-05').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      user_id: 3,
      role_id: 2,
      email: 'metrocare@bloodbridge.org',
      password_hash: hospitalPassword,
      full_name: 'Dr. Angela Rossi',
      phone: '+1-555-0202',
      status: 'ACTIVE',
      last_login: new Date().toISOString(),
      created_at: new Date('2026-01-10').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      user_id: 4,
      role_id: 2,
      email: 'hopeclinic@bloodbridge.org',
      password_hash: hospitalPassword,
      full_name: 'Dr. Tariq Khan',
      phone: '+1-555-0203',
      status: 'ACTIVE',
      last_login: null,
      created_at: new Date('2026-03-01').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      user_id: 5,
      role_id: 3,
      email: 'donor.sarah@bloodbridge.org',
      password_hash: donorPassword,
      full_name: 'Sarah Jenkins',
      phone: '+1-555-0301',
      status: 'ACTIVE',
      last_login: new Date().toISOString(),
      created_at: new Date('2026-01-15').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      user_id: 6,
      role_id: 3,
      email: 'donor.michael@bloodbridge.org',
      password_hash: donorPassword,
      full_name: 'Michael Chen',
      phone: '+1-555-0302',
      status: 'ACTIVE',
      last_login: new Date().toISOString(),
      created_at: new Date('2026-02-01').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      user_id: 7,
      role_id: 3,
      email: 'donor.emily@bloodbridge.org',
      password_hash: donorPassword,
      full_name: 'Emily Watson',
      phone: '+1-555-0303',
      status: 'ACTIVE',
      last_login: null,
      created_at: new Date('2026-03-05').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      user_id: 8,
      role_id: 4,
      email: 'patient.john@bloodbridge.org',
      password_hash: patientPassword,
      full_name: 'Johnathan Archer',
      phone: '+1-555-0401',
      status: 'ACTIVE',
      last_login: new Date().toISOString(),
      created_at: new Date('2026-02-10').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      user_id: 9,
      role_id: 4,
      email: 'patient.clara@bloodbridge.org',
      password_hash: patientPassword,
      full_name: 'Clara Oswald',
      phone: '+1-555-0402',
      status: 'ACTIVE',
      last_login: new Date().toISOString(),
      created_at: new Date('2026-02-20').toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const hospitals = [
    {
      hospital_id: 1,
      user_id: 2,
      hospital_name: 'City General Central Hospital',
      hospital_email: 'citygeneral@bloodbridge.org',
      phone: '+1-555-0201',
      registration_number: 'HOSP-NY-84920',
      address: '450 Health Sciences Blvd',
      district: 'Manhattan',
      city: 'New York',
      contact_person: 'Dr. Robert Davis (Blood Bank Director)',
      approval_status: 'APPROVED',
      rejection_reason: null,
      created_at: new Date('2026-01-05').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      hospital_id: 2,
      user_id: 3,
      hospital_name: 'Metro Care Blood & Trauma Institute',
      hospital_email: 'metrocare@bloodbridge.org',
      phone: '+1-555-0202',
      registration_number: 'HOSP-NY-93811',
      address: '1200 Metropolitan Parkway',
      district: 'Brooklyn',
      city: 'New York',
      contact_person: 'Dr. Angela Rossi',
      approval_status: 'APPROVED',
      rejection_reason: null,
      created_at: new Date('2026-01-10').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      hospital_id: 3,
      user_id: 4,
      hospital_name: 'Hope Community Medical Center',
      hospital_email: 'hopeclinic@bloodbridge.org',
      phone: '+1-555-0203',
      registration_number: 'HOSP-NY-77412',
      address: '88 River Street',
      district: 'Queens',
      city: 'New York',
      contact_person: 'Dr. Tariq Khan',
      approval_status: 'PENDING',
      rejection_reason: null,
      created_at: new Date('2026-03-01').toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const hospitalDocuments = [
    {
      document_id: 1,
      hospital_id: 3,
      document_type: 'Health Department License',
      file_path: '/uploads/hosp_docs/license_hope_center.pdf',
      original_name: 'Hospital_License_NY_2026.pdf',
      uploaded_at: new Date('2026-03-01').toISOString()
    }
  ];

  const donorProfiles = [
    {
      donor_id: 1,
      user_id: 5,
      blood_group: 'O+',
      gender: 'FEMALE',
      date_of_birth: '1995-04-12',
      address: '742 Evergreen Terrace',
      district: 'Manhattan',
      city: 'New York',
      emergency_contact: '+1-555-9001',
      last_donation_date: '2026-07-10', // > 3 months ago (Eligible)
      total_donations: 5,
      verification_status: 'VERIFIED',
      allow_shortage_alerts: 1,
      created_at: new Date('2026-01-15').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      donor_id: 2,
      user_id: 6,
      blood_group: 'A+',
      gender: 'MALE',
      date_of_birth: '1990-08-23',
      address: '221B Baker Street',
      district: 'Brooklyn',
      city: 'New York',
      emergency_contact: '+1-555-9002',
      last_donation_date: '2026-10-15', // < 1 month ago (Ineligible)
      total_donations: 2,
      verification_status: 'VERIFIED',
      allow_shortage_alerts: 1,
      created_at: new Date('2026-02-01').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      donor_id: 3,
      user_id: 7,
      blood_group: 'B+',
      gender: 'FEMALE',
      date_of_birth: '1998-11-05',
      address: '10 Downing Court',
      district: 'Queens',
      city: 'New York',
      emergency_contact: '+1-555-9003',
      last_donation_date: null, // First time donor (Eligible subject to screening)
      total_donations: 0,
      verification_status: 'PENDING',
      allow_shortage_alerts: 1,
      created_at: new Date('2026-03-05').toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const patientProfiles = [
    {
      patient_id: 1,
      user_id: 8,
      gender: 'MALE',
      date_of_birth: '1984-06-15',
      address: '350 Fifth Ave',
      district: 'Manhattan',
      city: 'New York',
      emergency_contact: '+1-555-8001',
      total_requests: 2,
      created_at: new Date('2026-02-10').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      patient_id: 2,
      user_id: 9,
      gender: 'FEMALE',
      date_of_birth: '1992-09-30',
      address: '144 West 82nd St',
      district: 'Brooklyn',
      city: 'New York',
      emergency_contact: '+1-555-8002',
      total_requests: 1,
      created_at: new Date('2026-02-20').toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const bloodGroups = [
    { group_id: 1, group_name: 'A+', can_donate_to: 'A+, AB+', can_receive_from: 'A+, A-, O+, O-', description: 'A antigen with Rh+' },
    { group_id: 2, group_name: 'A-', can_donate_to: 'A+, A-, AB+, AB-', can_receive_from: 'A-, O-', description: 'A antigen Rh-' },
    { group_id: 3, group_name: 'B+', can_donate_to: 'B+, AB+', can_receive_from: 'B+, B-, O+, O-', description: 'B antigen with Rh+' },
    { group_id: 4, group_name: 'B-', can_donate_to: 'B+, B-, AB+, AB-', can_receive_from: 'B-, O-', description: 'B antigen Rh-' },
    { group_id: 5, group_name: 'AB+', can_donate_to: 'AB+', can_receive_from: 'Universal Recipient (All Groups)', description: 'Universal recipient' },
    { group_id: 6, group_name: 'AB-', can_donate_to: 'AB+, AB-', can_receive_from: 'A-, B-, AB-, O-', description: 'Universal platelet type' },
    { group_id: 7, group_name: 'O+', can_donate_to: 'A+, B+, AB+, O+', can_receive_from: 'O+, O-', description: 'Most common blood type' },
    { group_id: 8, group_name: 'O-', can_donate_to: 'Universal Donor (All Groups)', can_receive_from: 'O-', description: 'Universal red cell donor' }
  ];

  // Realistic Blood Units (Bags) with exact Unit IDs, storage status, collection and expiry dates
  const bloodUnits = [
    // City General Hospital (hospital_id: 1)
    {
      unit_id: 'UNIT-CG-2026-001',
      hospital_id: 1,
      blood_group: 'O+',
      collection_date: '2026-10-20',
      expiry_date: '2026-12-01',
      donation_reference: 'DON-2026-8801',
      storage_status: 'Cold Room A - Rack 1',
      status: 'AVAILABLE',
      discard_reason: null,
      created_at: new Date('2026-10-20').toISOString()
    },
    {
      unit_id: 'UNIT-CG-2026-002',
      hospital_id: 1,
      blood_group: 'O+',
      collection_date: '2026-10-22',
      expiry_date: '2026-12-03',
      donation_reference: 'DON-2026-8802',
      storage_status: 'Cold Room A - Rack 1',
      status: 'AVAILABLE',
      discard_reason: null,
      created_at: new Date('2026-10-22').toISOString()
    },
    {
      unit_id: 'UNIT-CG-2026-003',
      hospital_id: 1,
      blood_group: 'A+',
      collection_date: '2026-10-25',
      expiry_date: '2026-12-06',
      donation_reference: 'DON-2026-8803',
      storage_status: 'Cold Room A - Rack 2',
      status: 'AVAILABLE',
      discard_reason: null,
      created_at: new Date('2026-10-25').toISOString()
    },
    {
      unit_id: 'UNIT-CG-2026-004',
      hospital_id: 1,
      blood_group: 'A+',
      collection_date: '2026-10-28',
      expiry_date: '2026-12-09',
      donation_reference: 'DON-2026-8804',
      storage_status: 'Cold Room A - Rack 2',
      status: 'AVAILABLE',
      discard_reason: null,
      created_at: new Date('2026-10-28').toISOString()
    },
    {
      unit_id: 'UNIT-CG-2026-005',
      hospital_id: 1,
      blood_group: 'B+',
      collection_date: '2026-10-15',
      expiry_date: '2026-11-26',
      donation_reference: 'DON-2026-8805',
      storage_status: 'Cold Room B - Rack 1',
      status: 'AVAILABLE',
      discard_reason: null,
      created_at: new Date('2026-10-15').toISOString()
    },
    {
      unit_id: 'UNIT-CG-2026-006',
      hospital_id: 1,
      blood_group: 'O-',
      collection_date: '2026-11-01',
      expiry_date: '2026-12-13',
      donation_reference: 'DON-2026-8806',
      storage_status: 'Emergency Reserve Rack',
      status: 'AVAILABLE',
      discard_reason: null,
      created_at: new Date('2026-11-01').toISOString()
    },
    {
      unit_id: 'UNIT-CG-2026-007',
      hospital_id: 1,
      blood_group: 'AB+',
      collection_date: '2026-10-10',
      expiry_date: '2026-11-21',
      donation_reference: 'DON-2026-8807',
      storage_status: 'Cold Room B - Rack 3',
      status: 'AVAILABLE',
      discard_reason: null,
      created_at: new Date('2026-10-10').toISOString()
    },
    // Expiring soon unit (< 7 days)
    {
      unit_id: 'UNIT-CG-2026-008',
      hospital_id: 1,
      blood_group: 'B-',
      collection_date: '2026-09-28',
      expiry_date: '2026-11-09',
      donation_reference: 'DON-2026-8808',
      storage_status: 'Cold Room B - Rack 2',
      status: 'AVAILABLE',
      discard_reason: null,
      created_at: new Date('2026-09-28').toISOString()
    },
    // Already Assigned Unit
    {
      unit_id: 'UNIT-CG-2026-009',
      hospital_id: 1,
      blood_group: 'A-',
      collection_date: '2026-10-05',
      expiry_date: '2026-11-16',
      donation_reference: 'DON-2026-8809',
      storage_status: 'Dispatch Ready Cooler',
      status: 'ASSIGNED',
      discard_reason: null,
      created_at: new Date('2026-10-05').toISOString()
    },
    // Expired Unit
    {
      unit_id: 'UNIT-CG-2026-010',
      hospital_id: 1,
      blood_group: 'O+',
      collection_date: '2026-09-01',
      expiry_date: '2026-10-13',
      donation_reference: 'DON-2026-8711',
      storage_status: 'Quarantine Chamber',
      status: 'EXPIRED',
      discard_reason: 'Shelf life expired (42 days)',
      created_at: new Date('2026-09-01').toISOString()
    },

    // Metro Care Blood Institute (hospital_id: 2)
    {
      unit_id: 'UNIT-MC-2026-101',
      hospital_id: 2,
      blood_group: 'A+',
      collection_date: '2026-10-18',
      expiry_date: '2026-11-29',
      donation_reference: 'DON-MC-4401',
      storage_status: 'Freezer Bay 1',
      status: 'AVAILABLE',
      discard_reason: null,
      created_at: new Date('2026-10-18').toISOString()
    },
    {
      unit_id: 'UNIT-MC-2026-102',
      hospital_id: 2,
      blood_group: 'B+',
      collection_date: '2026-10-20',
      expiry_date: '2026-12-01',
      donation_reference: 'DON-MC-4402',
      storage_status: 'Freezer Bay 2',
      status: 'AVAILABLE',
      discard_reason: null,
      created_at: new Date('2026-10-20').toISOString()
    },
    {
      unit_id: 'UNIT-MC-2026-103',
      hospital_id: 2,
      blood_group: 'O+',
      collection_date: '2026-10-25',
      expiry_date: '2026-12-06',
      donation_reference: 'DON-MC-4403',
      storage_status: 'Freezer Bay 1',
      status: 'AVAILABLE',
      discard_reason: null,
      created_at: new Date('2026-10-25').toISOString()
    },
    {
      unit_id: 'UNIT-MC-2026-104',
      hospital_id: 2,
      blood_group: 'AB-',
      collection_date: '2026-10-28',
      expiry_date: '2026-12-09',
      donation_reference: 'DON-MC-4404',
      storage_status: 'Freezer Bay 3',
      status: 'AVAILABLE',
      discard_reason: null,
      created_at: new Date('2026-10-28').toISOString()
    }
  ];

  // Patient Blood Requests
  const bloodRequests = [
    {
      request_id: 1,
      patient_id: 1,
      hospital_id: 1,
      blood_group: 'A-',
      required_units: 1,
      required_date: '2026-11-08',
      priority: 'EMERGENCY',
      patient_name: 'Johnathan Archer',
      patient_age: 42,
      treatment_location: 'City General Hospital ICU Ward 4B',
      doctor_name: 'Dr. Gregory House',
      doctor_contact: '+1-555-4499',
      additional_notes: 'Urgent surgery scheduled for tomorrow morning.',
      service_charge: 40.00,
      assigned_units: ['UNIT-CG-2026-009'],
      status: 'READY_FOR_COLLECTION',
      rejection_reason: null,
      created_at: new Date('2026-11-04T10:30:00Z').toISOString(),
      updated_at: new Date('2026-11-05T14:20:00Z').toISOString()
    },
    {
      request_id: 2,
      patient_id: 1,
      hospital_id: 1,
      blood_group: 'O+',
      required_units: 2,
      required_date: '2026-11-12',
      priority: 'NORMAL',
      patient_name: 'Emily Archer',
      patient_age: 14,
      treatment_location: 'Pediatric Center Room 302',
      doctor_name: 'Dr. Allison Cameron',
      doctor_contact: '+1-555-4498',
      additional_notes: 'Thalassemia scheduled transfusion.',
      service_charge: 80.00,
      assigned_units: [],
      status: 'SUBMITTED',
      rejection_reason: null,
      created_at: new Date('2026-11-06T08:15:00Z').toISOString(),
      updated_at: new Date('2026-11-06T08:15:00Z').toISOString()
    },
    {
      request_id: 3,
      patient_id: 2,
      hospital_id: 2,
      blood_group: 'B+',
      required_units: 1,
      required_date: '2026-10-25',
      priority: 'NORMAL',
      patient_name: 'Clara Oswald',
      patient_age: 34,
      treatment_location: 'Metro Care Outpatient Center',
      doctor_name: 'Dr. John Watson',
      doctor_contact: '+1-555-3311',
      additional_notes: 'Severe anemia recovery.',
      service_charge: 40.00,
      assigned_units: ['UNIT-MC-2026-090'],
      status: 'COMPLETED',
      rejection_reason: null,
      created_at: new Date('2026-10-22T09:00:00Z').toISOString(),
      updated_at: new Date('2026-10-25T16:00:00Z').toISOString()
    }
  ];

  const requestDocuments = [
    {
      document_id: 1,
      request_id: 1,
      document_type: 'Doctor Prescription',
      file_path: '/uploads/prescriptions/prescription_req_1.pdf',
      original_name: 'Dr_House_Surgery_Order.pdf',
      uploaded_at: new Date('2026-11-04T10:30:00Z').toISOString()
    },
    {
      document_id: 2,
      request_id: 2,
      document_type: 'Hematology Report',
      file_path: '/uploads/prescriptions/lab_report_req_2.pdf',
      original_name: 'Blood_Report_Archer.pdf',
      uploaded_at: new Date('2026-11-06T08:15:00Z').toISOString()
    }
  ];

  const requestStatusHistory = [
    {
      history_id: 1,
      request_id: 1,
      status: 'SUBMITTED',
      comments: 'Request submitted by patient Johnathan Archer',
      changed_by_user_id: 8,
      changed_at: new Date('2026-11-04T10:30:00Z').toISOString()
    },
    {
      history_id: 2,
      request_id: 1,
      status: 'UNDER_REVIEW',
      comments: 'Doctor order and prescription verified by hospital blood bank',
      changed_by_user_id: 2,
      changed_at: new Date('2026-11-04T12:00:00Z').toISOString()
    },
    {
      history_id: 3,
      request_id: 1,
      status: 'APPROVED',
      comments: 'Cross-matching completed successfully',
      changed_by_user_id: 2,
      changed_at: new Date('2026-11-05T09:15:00Z').toISOString()
    },
    {
      history_id: 4,
      request_id: 1,
      status: 'BLOOD_ASSIGNED',
      comments: 'Assigned Unit UNIT-CG-2026-009 to request',
      changed_by_user_id: 2,
      changed_at: new Date('2026-11-05T10:00:00Z').toISOString()
    },
    {
      history_id: 5,
      request_id: 1,
      status: 'READY_FOR_COLLECTION',
      comments: 'Packed in cold storage transport box. Available for pickup at Dispatch Desk.',
      changed_by_user_id: 2,
      changed_at: new Date('2026-11-05T14:20:00Z').toISOString()
    },
    {
      history_id: 6,
      request_id: 2,
      status: 'SUBMITTED',
      comments: 'Request submitted by patient Johnathan Archer',
      changed_by_user_id: 8,
      changed_at: new Date('2026-11-06T08:15:00Z').toISOString()
    }
  ];

  // Donation Appointments
  const donationAppointments = [
    {
      appointment_id: 1,
      donor_id: 1,
      hospital_id: 1,
      appointment_date: '2026-11-15',
      time_slot: '10:00 AM - 11:00 AM',
      status: 'CONFIRMED',
      cancellation_reason: null,
      created_at: new Date('2026-11-02').toISOString(),
      updated_at: new Date('2026-11-03').toISOString()
    },
    {
      appointment_id: 2,
      donor_id: 3,
      hospital_id: 2,
      appointment_date: '2026-11-18',
      time_slot: '02:00 PM - 03:00 PM',
      status: 'PENDING',
      cancellation_reason: null,
      created_at: new Date('2026-11-05').toISOString(),
      updated_at: new Date('2026-11-05').toISOString()
    }
  ];

  // Donation Records
  const donationRecords = [
    {
      record_id: 1,
      appointment_id: null,
      donor_id: 1,
      hospital_id: 1,
      blood_group: 'O+',
      quantity_ml: 450,
      hemoglobin_level: 14.2,
      blood_pressure: '118/78',
      pulse_rate: 72,
      screening_status: 'PASSED',
      processing_status: 'TESTED_AND_STORED',
      unit_id: 'UNIT-CG-2026-001',
      donation_date: '2026-07-10',
      created_at: new Date('2026-07-10').toISOString()
    },
    {
      record_id: 2,
      appointment_id: null,
      donor_id: 2,
      hospital_id: 1,
      blood_group: 'A+',
      quantity_ml: 450,
      hemoglobin_level: 13.8,
      blood_pressure: '122/80',
      pulse_rate: 76,
      screening_status: 'PASSED',
      processing_status: 'TESTED_AND_STORED',
      unit_id: 'UNIT-CG-2026-004',
      donation_date: '2026-10-15',
      created_at: new Date('2026-10-15').toISOString()
    }
  ];

  // Donation Camps
  const donationCamps = [
    {
      camp_id: 1,
      hospital_id: 1,
      camp_name: 'City Hall Community Blood Drive',
      location: 'Manhattan Civic Center Plaza',
      district: 'Manhattan',
      city: 'New York',
      start_date: '2026-11-20',
      end_date: '2026-11-21',
      start_time: '09:00 AM',
      end_time: '05:00 PM',
      target_units: 150,
      collected_units: 0,
      status: 'UPCOMING',
      created_at: new Date('2026-10-25').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      camp_id: 2,
      hospital_id: 2,
      camp_name: 'Brooklyn Tech Campus Blood Donation Camp',
      location: 'Main Auditorium, Tech University',
      district: 'Brooklyn',
      city: 'New York',
      start_date: '2026-11-28',
      end_date: '2026-11-28',
      start_time: '10:00 AM',
      end_time: '04:00 PM',
      target_units: 100,
      collected_units: 0,
      status: 'UPCOMING',
      created_at: new Date('2026-10-28').toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Future Blood Requests / Waitlist (when stock is 0)
  const futureRequests = [
    {
      future_request_id: 1,
      patient_id: 2,
      blood_group: 'AB-',
      required_units: 1,
      preferred_city: 'New York',
      status: 'SEARCHING',
      notes: 'Waiting for AB- donor in Brooklyn/Manhattan',
      created_at: new Date('2026-11-01').toISOString()
    }
  ];

  // Notifications
  const notifications = [
    {
      notification_id: 1,
      user_id: 8, // Patient Johnathan
      title: 'Blood Ready for Collection',
      message: 'Your emergency blood request #1 has been prepared and is ready for pickup at City General Central Hospital Dispatch Desk.',
      notification_type: 'SUCCESS',
      is_read: 0,
      created_at: new Date('2026-11-05T14:20:00Z').toISOString()
    },
    {
      notification_id: 2,
      user_id: 5, // Donor Sarah
      title: 'Appointment Confirmed',
      message: 'Your blood donation appointment on Nov 15, 2026 at City General Hospital has been confirmed.',
      notification_type: 'INFORMATION',
      is_read: 1,
      created_at: new Date('2026-11-03T11:00:00Z').toISOString()
    },
    {
      notification_id: 3,
      user_id: 2, // Hospital Admin City General
      title: 'New Emergency Blood Request',
      message: 'Emergency request received for A- blood unit (Patient Johnathan Archer).',
      notification_type: 'EMERGENCY',
      is_read: 1,
      created_at: new Date('2026-11-04T10:30:00Z').toISOString()
    },
    {
      notification_id: 4,
      user_id: 1, // Admin
      title: 'New Hospital Registration Pending',
      message: 'Hope Community Medical Center has submitted registration documents for review.',
      notification_type: 'WARNING',
      is_read: 0,
      created_at: new Date('2026-03-01T15:00:00Z').toISOString()
    }
  ];

  // Support Tickets
  const supportTickets = [
    {
      ticket_id: 1,
      user_id: 5,
      name: 'Sarah Jenkins',
      email: 'donor.sarah@bloodbridge.org',
      subject: 'Question regarding donation eligibility after travel',
      message: 'Hello, I traveled abroad last month. Does that affect my 3-month eligibility interval?',
      status: 'RESOLVED',
      response: 'Thank you for reaching out! Travel to certain regions may require medical assessment. Our screening doctor will review this at your appointment.',
      created_at: new Date('2026-10-18').toISOString(),
      updated_at: new Date('2026-10-19').toISOString()
    }
  ];

  // Service Charges
  const serviceCharges = [
    {
      charge_id: 1,
      charge_name: 'Blood Testing & Cross-Matching',
      amount: 25.00,
      is_active: 1,
      description: 'Covers mandatory infectious disease testing (HIV, Hepatitis B/C, Syphilis) and serum compatibility',
      updated_by_user_id: 1,
      updated_at: new Date('2026-01-01').toISOString()
    },
    {
      charge_id: 2,
      charge_name: 'Sterile Collection & Cold Chain Logistics',
      amount: 15.00,
      is_active: 1,
      description: 'Covers certified single-use sterile blood bags, anticoagulants, and 2-6°C temperature monitoring',
      updated_by_user_id: 1,
      updated_at: new Date('2026-01-01').toISOString()
    }
  ];

  // System Settings
  const systemSettings = [
    { setting_key: 'PLATFORM_NAME', setting_value: 'BloodBridge', description: 'Public Platform Name' },
    { setting_key: 'PLATFORM_TAGLINE', setting_value: 'Connecting Lives Through Blood Donation', description: 'Platform Slogan' },
    { setting_key: 'CONTACT_EMAIL', setting_value: 'support@bloodbridge.org', description: 'Central Helpdesk Email' },
    { setting_key: 'CONTACT_PHONE', setting_value: '+1 (800) 555-BLOOD', description: '24/7 Toll-free Hotline' },
    { setting_key: 'DONATION_INTERVAL_MONTHS', setting_value: '3', description: 'Minimum calendar months required between donations' },
    { setting_key: 'EMERGENCY_BANNER_ACTIVE', setting_value: '1', description: '1 if banner is displayed on landing page, 0 if disabled' },
    { setting_key: 'EMERGENCY_BANNER_TEXT', setting_value: 'CRITICAL NEED: Low supply for O-Negative & B-Negative blood units in Greater New York district. Please schedule a donation today!', description: 'Emergency announcement broadcast' }
  ];

  // Audit Logs
  const auditLogs = [
    {
      log_id: 1,
      user_id: 1,
      user_email: 'admin@bloodbridge.org',
      action: 'SYSTEM_INITIALIZATION',
      entity_name: 'SYSTEM',
      entity_id: 'GLOBAL',
      ip_address: '127.0.0.1',
      details: 'BloodBridge platform initial schema and core parameters installed.',
      created_at: new Date('2026-01-01T00:00:00Z').toISOString()
    },
    {
      log_id: 2,
      user_id: 1,
      user_email: 'admin@bloodbridge.org',
      action: 'HOSPITAL_APPROVED',
      entity_name: 'HOSPITAL',
      entity_id: '1',
      ip_address: '127.0.0.1',
      details: 'City General Central Hospital verified and approved for active blood banking.',
      created_at: new Date('2026-01-05T11:00:00Z').toISOString()
    },
    {
      log_id: 3,
      user_id: 2,
      user_email: 'citygeneral@bloodbridge.org',
      action: 'BLOOD_UNIT_ASSIGNED',
      entity_name: 'BLOOD_UNITS',
      entity_id: 'UNIT-CG-2026-009',
      ip_address: '192.168.1.45',
      details: 'Assigned 1 unit of A- to Emergency Request #1 (Patient Johnathan Archer).',
      created_at: new Date('2026-11-05T10:00:00Z').toISOString()
    }
  ];

  return {
    roles,
    users,
    hospitals,
    hospitalDocuments,
    donorProfiles,
    patientProfiles,
    bloodGroups,
    bloodUnits,
    bloodRequests,
    requestDocuments,
    requestStatusHistory,
    donationAppointments,
    donationRecords,
    donationCamps,
    futureRequests,
    notifications,
    supportTickets,
    serviceCharges,
    systemSettings,
    auditLogs
  };
}

module.exports = { getInitialSeedData };
