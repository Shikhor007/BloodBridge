# BloodBridge - Complete Blood Supply Management Platform

> **Tagline:** Connecting Lives Through Blood Donation.  
> **Mission:** A centralized, modern, responsive, and secure healthcare web application connecting blood donors, patients, hospitals, and system administrators.

---

## 🩸 1. Platform Overview & Business Principles

BloodBridge follows an ethical, non-commercial donation-based model:
- **Donors never pay money to donate blood.**
- **Donors never receive payment or financial incentives for donating.**
- **Patients pay a small, transparent service charge** ($40 total per bag: $25 infectious disease testing & cross-matching + $15 cold-chain sterile logistics) to subsidize clinical consumables and temperature-controlled storage.
- **Hospitals manage unit-level blood inventory**, donor appointment screening, and clinical request fulfillment.
- **Strict 3-Month Donation Interval:** Enforced by the platform to protect donor hemoglobin and ferritin recovery.
- **Strict Patient Privacy Wall:** Donors NEVER have access to patient medical histories, clinical prescriptions, or diagnoses.

---

## 🏗️ 2. Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Lucide React Icons, Recharts (Analytics & Charts), Axios.
- **Backend:** Node.js, Express.js, JWT Authentication, bcryptjs, Multer (file upload), Nodemailer (email notifications), Helmet, CORS, Express Rate Limit.
- **Database:**
  - **Oracle Database 19c / 21c / 23ai:** Complete SQL schema script ([`backend/database/oracle_schema.sql`](file:///d:/_Study/CSE/CSE479/Project%20blood%20bridge/backend/database/oracle_schema.sql)) with 19 normalized relational tables, identity columns, foreign keys, triggers, constraints, and indexes.
  - **Local Development Adapter:** Transparent file-persisted store with transaction locks ensuring double-assignment prevention and atomic operations without requiring Oracle pre-installed.

---

## 👥 3. Pre-Configured Demo Accounts (Ready to Test)

| Account Role | Email Address | Password | Profile Notes |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@bloodbridge.org` | `Admin@123` | Full control, hospital verification, audit logs, rules |
| **Hospital Admin** | `citygeneral@bloodbridge.org` | `Hospital@123` | City General Hospital (Approved), inventory & requests |
| **Hospital Admin** | `metrocare@bloodbridge.org` | `Hospital@123` | Metro Care Blood Institute (Approved) |
| **Hospital Admin** | `hopeclinic@bloodbridge.org` | `Hospital@123` | Hope Community Medical Center (**PENDING** verification) |
| **Donor (Eligible)** | `donor.sarah@bloodbridge.org` | `Donor@123` | Sarah Jenkins (O+, last donated 4 months ago) |
| **Donor (Ineligible)**| `donor.michael@bloodbridge.org` | `Donor@123` | Michael Chen (A+, last donated 1 month ago, <3 mo) |
| **Patient** | `patient.john@bloodbridge.org` | `Patient@123` | Johnathan Archer (active emergency request #1) |
| **Patient** | `patient.clara@bloodbridge.org` | `Patient@123` | Clara Oswald (completed request #3) |

*Tip: The unified login page also features **1-Click Demo Profile buttons** for instant sign-in.*

---

## 🚀 4. Installation & Running Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+)

### Step 1: Start the Backend Server
```powershell
cd "d:\_Study\CSE\CSE479\Project blood bridge\backend"
npm install
npm start
```
The backend will run on **`http://localhost:5000`** and will auto-seed initial database records on first launch.

### Step 2: Start the Frontend Application
```powershell
cd "d:\_Study\CSE\CSE479\Project blood bridge\frontend"
npm install
npm run dev
```
The frontend will run on **`http://localhost:5173`**.

### Step 3: Run Automated Workflow & Security Tests
```powershell
node backend/test_workflows.js
```

---

## 🗄️ 5. Oracle Database Design (19 Tables)

The complete SQL definitions and triggers are located in [`backend/database/oracle_schema.sql`](file:///d:/_Study/CSE/CSE479/Project%20blood%20bridge/backend/database/oracle_schema.sql):

1. **`ROLES`** - Role definitions (`ADMIN`, `HOSPITAL`, `DONOR`, `PATIENT`).
2. **`USERS`** - Core user credentials with hashed passwords and status.
3. **`DONOR_PROFILES`** - Blood group, last donation date, 3-month eligibility interval data, verification status.
4. **`PATIENT_PROFILES`** - Patient contact details, emergency contacts, request counters.
5. **`HOSPITALS`** - Hospital name, license registration number, contact person, approval status (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`).
6. **`HOSPITAL_DOCUMENTS`** - Health department accreditation certificates and medical licenses.
7. **`BLOOD_GROUPS`** - 8 blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-) and compatibility matrix.
8. **`BLOOD_UNITS`** - **Unit-Level Inventory Management** with unique bag Unit IDs, collection date, 42-day expiry date, storage rack status, and unit state (`AVAILABLE`, `RESERVED`, `ASSIGNED`, `EXPIRED`, `DISCARDED`).
9. **`BLOOD_REQUESTS`** - Clinical requisitions with patient age, attending doctor, hospital, transparent service charges, priority (`NORMAL` vs `EMERGENCY`), and assigned units.
10. **`REQUEST_DOCUMENTS`** - Uploaded doctor prescriptions and laboratory hematology reports.
11. **`REQUEST_STATUS_HISTORY`** - Full status transition audit trail with timestamps and user remarks.
12. **`DONATION_APPOINTMENTS`** - Donor appointment scheduling slots at hospitals and donation camps.
13. **`DONATION_RECORDS`** - Clinical screening data: hemoglobin level, blood pressure, pulse, volume (450ml), and testing status before units enter inventory.
14. **`DONATION_CAMPS`** - Community blood drive management, target units, and collected quantities.
15. **`NOTIFICATIONS`** - Integrated multi-channel notifications (Information, Success, Warning, Emergency).
16. **`SUPPORT_TICKETS`** - Public contact desk inquiries and administrative responses.
17. **`SERVICE_CHARGES`** - Transparent fee structure configuration ($25 testing + $15 cold chain).
18. **`SYSTEM_SETTINGS`** - Platform parameters, emergency broadcast banner toggle & announcement text.
19. **`AUDIT_LOGS`** - Immutable platform audit logs recording logins, unit assignments, approvals, and IP addresses.

---

## 🛡️ 6. Core System Workflows & Security

### 1. Patient Requisition Workflow
1. Patient searches blood availability by group, city, or hospital.
2. Selects hospital and submits requisition with doctor's name, treatment ward, and prescription upload.
3. System calculates and displays the transparent service fee before submission ($40/bag, zero hidden fees).
4. Hospital receives notification, inspects prescription, and approves requisition.
5. Hospital assigns screened, unexpired blood units using an **atomic concurrency lock** (preventing double assignment).
6. Patient tracks live timeline (`SUBMITTED` → `UNDER_REVIEW` → `APPROVED` → `BLOOD_ASSIGNED` → `READY_FOR_COLLECTION` → `COMPLETED`).
7. Patient downloads/prints official requisition voucher receipt.

### 2. Donor Eligibility & Appointment Workflow
1. Donor registers and inputs blood group and last donation date.
2. System evaluates the **3-month donation interval**:
   - If < 3 months, status is **INELIGIBLE**, displaying a daily countdown and blocking booking.
   - If ≥ 3 months or first-time donor, status is **ELIGIBLE** (subject to clinical screening).
3. Eligible donor selects hospital and time slot or community camp.
4. Hospital confirms appointment and performs clinical pre-screening (hemoglobin, blood pressure, pulse).
5. On completion, medical officer records screening and registers certified 450ml bag into inventory.
6. Donor's last donation date is updated to today, total donations counter increments, and lifesaver certificate is unlocked.

### 3. Hospital Accreditation Workflow
1. Hospital registers with license registration number and uploads health department accreditation document.
2. Hospital enters **`PENDING`** state (login is blocked with explanatory status message).
3. System Admin inspects submitted documents in the Admin Console and approves or rejects the application.
4. Upon approval, hospital administrator receives full access to manage inventory, appointments, and requests.

### 4. Security & Privacy Protections
- **Strict Role-Based Authorization (RBAC):** Backend route middleware enforces role checks regardless of URL manipulation.
- **Donor Privacy Wall:** Donors are strictly forbidden from viewing patient medical records, prescriptions, or diagnoses (HTTP 403).
- **Concurrency & Inventory Integrity:** Transaction mutex prevents two hospital admins from double-assigning the same blood unit simultaneously.
- **Password Security:** Salted hashing with `bcryptjs`.
- **JWT Protection:** Short-lived tokens with authenticated payload.
- **Rate Limiting:** Brute force defense on `/api/auth` endpoints.
- **File Validation:** Multer restricts uploads to PDF, JPG, and PNG with a 5MB size limit.

---

## 📡 7. API Endpoint Summary

### Public
- `GET /api/public/stats` - Live database platform metrics & emergency broadcast banner.
- `GET /api/public/blood-availability` - Real-time stock for all 8 blood groups with hospital filtering.
- `GET /api/public/blood-compatibility` - ABO and Rh antigenic compatibility guide.
- `GET /api/public/service-charges` - Transparent fee breakdown.
- `POST /api/public/contact` - Submit support ticket.

### Authentication
- `POST /api/auth/login` - Unified login for all 4 roles.
- `POST /api/auth/register/donor` - Volunteer donor onboarding.
- `POST /api/auth/register/patient` - Patient account creation.
- `POST /api/auth/register/hospital` - Hospital registration with document upload.
- `GET /api/auth/me` - Profile & active role verification.
- `PUT /api/auth/profile` - Update personal details.
- `PUT /api/auth/change-password` - Password change with old password verification.

### Patient Portal (`Role: PATIENT`)
- `GET /api/patient/dashboard` - Requisition statistics, recent requests, active waitlist.
- `POST /api/patient/requests` - Submit blood request with prescription upload.
- `GET /api/patient/requests/:id/tracking` - Visual timeline tracking & assigned unit details.
- `POST /api/patient/future-requests` - Shortage waitlist registration.

### Donor Portal (`Role: DONOR`)
- `GET /api/donor/dashboard` - Total donations, eligibility badge, shortage alerts.
- `GET /api/donor/eligibility` - 3-month interval calculation & next eligible date.
- `GET /api/donor/available-slots` - Hospital slots and donation camps.
- `POST /api/donor/appointments` - Schedule donation appointment (blocked if ineligible).
- `PUT /api/donor/appointments/:id/cancel` - Cancel appointment.
- `GET /api/donor/certificate` - Downloadable Lifesaver Certificate of Appreciation.

### Hospital Admin Portal (`Role: HOSPITAL`)
- `GET /api/hospital/dashboard` - Inventory overview, Recharts analytics, expiry warnings.
- `GET /api/hospital/inventory` - Unit-level blood inventory table with filters.
- `POST /api/hospital/inventory` - Register new screened blood unit.
- `PUT /api/hospital/inventory/:unitId/discard` - Mark unit as discarded with reason.
- `GET /api/hospital/requests` - Review incoming patient requisitions.
- `POST /api/hospital/requests/:requestId/assign-units` - Atomic unit assignment with concurrency lock.
- `PUT /api/hospital/requests/:requestId/status` - Update requisition status (Approve, Complete, Reject).
- `GET /api/hospital/appointments` - Donor appointment requests.
- `PUT /api/hospital/appointments/:appointmentId/status` - Confirm or cancel appointment.
- `POST /api/hospital/donations/record-completion` - Record screening & add to inventory.
- `GET /api/hospital/camps` - List and manage donation drives.
- `POST /api/hospital/camps` - Create new donation camp.
- `GET /api/hospital/reports` - Utilization report data for CSV/PDF export.

### System Admin Portal (`Role: ADMIN`)
- `GET /api/admin/dashboard` - Platform telemetry, user growth trends, demand charts.
- `GET /api/admin/hospitals` - All registered hospitals with license files.
- `PUT /api/admin/hospitals/:hospitalId/approval` - Approve, reject, or suspend hospital.
- `GET /api/admin/users` - User management table across all roles.
- `PUT /api/admin/users/:userId/status` - Block or unblock user account.
- `PUT /api/admin/donors/:donorId/verify` - Certify donor account.
- `GET /api/admin/requests` - System-wide requisition oversight.
- `GET /api/admin/blood-rules` - Manage blood compatibility rules.
- `GET /api/admin/audit-logs` - Immutable compliance audit trail.
- `GET /api/admin/settings` - System parameters & service charges.
- `PUT /api/admin/settings` - Update platform parameters or emergency broadcast.
- `PUT /api/admin/service-charges/:chargeId` - Configure testing and cold chain fees.

### Notifications
- `GET /api/notifications` - User notifications & unread counter.
- `PUT /api/notifications/:id/read` - Mark single notification as read.
- `PUT /api/notifications/read-all` - Mark all notifications as read.
