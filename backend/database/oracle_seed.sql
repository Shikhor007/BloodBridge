-- ============================================================================
-- BloodBridge - Complete Oracle Database Seed Data
-- ============================================================================

-- ROLES
INSERT INTO ROLES (role_id, role_name, description) VALUES (1, 'ADMIN', 'System Administrator with complete platform control');
INSERT INTO ROLES (role_id, role_name, description) VALUES (2, 'HOSPITAL', 'Hospital Administrator managing local blood bank');
INSERT INTO ROLES (role_id, role_name, description) VALUES (3, 'DONOR', 'Registered volunteer blood donor');
INSERT INTO ROLES (role_id, role_name, description) VALUES (4, 'PATIENT', 'Patient requesting blood units and services');

-- BLOOD_GROUPS & COMPATIBILITY
INSERT INTO BLOOD_GROUPS (group_name, can_donate_to, can_receive_from, description) VALUES
('A+', 'A+, AB+', 'A+, A-, O+, O-', 'Contains A antigen and Rh factor');
INSERT INTO BLOOD_GROUPS (group_name, can_donate_to, can_receive_from, description) VALUES
('A-', 'A+, A-, AB+, AB-', 'A-, O-', 'Contains A antigen without Rh factor');
INSERT INTO BLOOD_GROUPS (group_name, can_donate_to, can_receive_from, description) VALUES
('B+', 'B+, AB+', 'B+, B-, O+, O-', 'Contains B antigen and Rh factor');
INSERT INTO BLOOD_GROUPS (group_name, can_donate_to, can_receive_from, description) VALUES
('B-', 'B+, B-, AB+, AB-', 'B-, O-', 'Contains B antigen without Rh factor');
INSERT INTO BLOOD_GROUPS (group_name, can_donate_to, can_receive_from, description) VALUES
('AB+', 'AB+', 'ALL (Universal Recipient)', 'Can receive red blood cells from any blood group');
INSERT INTO BLOOD_GROUPS (group_name, can_donate_to, can_receive_from, description) VALUES
('AB-', 'AB+, AB-', 'A-, B-, AB-, O-', 'Universal platelet donor blood type');
INSERT INTO BLOOD_GROUPS (group_name, can_donate_to, can_receive_from, description) VALUES
('O+', 'A+, B+, AB+, O+', 'O+, O-', 'Most common blood group worldwide');
INSERT INTO BLOOD_GROUPS (group_name, can_donate_to, can_receive_from, description) VALUES
('O-', 'ALL (Universal Donor)', 'O-', 'Universal red blood cell donor for emergencies');

-- SYSTEM_SETTINGS
INSERT INTO SYSTEM_SETTINGS (setting_key, setting_value, description) VALUES
('PLATFORM_NAME', 'BloodBridge', 'Platform name');
INSERT INTO SYSTEM_SETTINGS (setting_key, setting_value, description) VALUES
('CONTACT_EMAIL', 'support@bloodbridge.org', 'Support email address');
INSERT INTO SYSTEM_SETTINGS (setting_key, setting_value, description) VALUES
('CONTACT_PHONE', '+1 (800) 555-BLOOD', 'Central 24/7 hotline');
INSERT INTO SYSTEM_SETTINGS (setting_key, setting_value, description) VALUES
('DONATION_INTERVAL_MONTHS', '3', 'Minimum calendar months required between donations');
INSERT INTO SYSTEM_SETTINGS (setting_key, setting_value, description) VALUES
('EMERGENCY_BANNER_TEXT', 'Urgent need for O- and B- blood units in Central Medical District. Please donate!', 'Public announcement');
INSERT INTO SYSTEM_SETTINGS (setting_key, setting_value, description) VALUES
('EMERGENCY_BANNER_ACTIVE', '1', 'Flag to toggle emergency broadcast');

-- SERVICE_CHARGES (Transparent administrative charges)
INSERT INTO SERVICE_CHARGES (charge_name, amount, is_active, description) VALUES
('Blood Bag Testing & Cross-matching', 25.00, 1, 'Standard safety screening, infectious disease test and compatibility');
INSERT INTO SERVICE_CHARGES (charge_name, amount, is_active, description) VALUES
('Cold Chain Storage & Handling', 15.00, 1, 'Temperature controlled blood transport and specialized cold-storage');

COMMIT;
