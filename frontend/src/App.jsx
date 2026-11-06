import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import BloodAvailabilityPage from './pages/public/BloodAvailabilityPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import FindBloodPage from './pages/patient/FindBloodPage';
import RequestBloodPage from './pages/patient/RequestBloodPage';
import MyRequestsPage from './pages/patient/MyRequestsPage';
import RequestDetailPage from './pages/patient/RequestDetailPage';
import FutureRequestsPage from './pages/patient/FutureRequestsPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';

// Donor Pages
import DonorDashboard from './pages/donor/DonorDashboard';
import EligibilityPage from './pages/donor/EligibilityPage';
import ScheduleDonationPage from './pages/donor/ScheduleDonationPage';
import DonationHistoryPage from './pages/donor/DonationHistoryPage';
import DonorCertificatesPage from './pages/donor/DonorCertificatesPage';
import DonorProfilePage from './pages/donor/DonorProfilePage';

// Hospital Pages
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import InventoryPage from './pages/hospital/InventoryPage';
import PatientRequestsPage from './pages/hospital/PatientRequestsPage';
import DonorAppointmentsPage from './pages/hospital/DonorAppointmentsPage';
import ExpiryMonitoringPage from './pages/hospital/ExpiryMonitoringPage';
import CampsPage from './pages/hospital/CampsPage';
import ReportsPage from './pages/hospital/ReportsPage';
import HospitalProfilePage from './pages/hospital/HospitalProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import HospitalManagementPage from './pages/admin/HospitalManagementPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import BloodRulesPage from './pages/admin/BloodRulesPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import SystemSettingsPage from './pages/admin/SystemSettingsPage';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/blood-availability" element={<BloodAvailabilityPage />} />
      <Route path="/how-it-works" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Patient Portal (Protected - PATIENT) */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientDashboard />} />
        <Route path="find-blood" element={<FindBloodPage />} />
        <Route path="request-blood" element={<RequestBloodPage />} />
        <Route path="my-requests" element={<MyRequestsPage />} />
        <Route path="requests/:id/tracking" element={<RequestDetailPage />} />
        <Route path="future-requests" element={<FutureRequestsPage />} />
        <Route path="profile" element={<PatientProfilePage />} />
      </Route>

      {/* Donor Portal (Protected - DONOR) */}
      <Route
        path="/donor"
        element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DonorDashboard />} />
        <Route path="eligibility" element={<EligibilityPage />} />
        <Route path="schedule" element={<ScheduleDonationPage />} />
        <Route path="history" element={<DonationHistoryPage />} />
        <Route path="certificates" element={<DonorCertificatesPage />} />
        <Route path="profile" element={<DonorProfilePage />} />
      </Route>

      {/* Hospital Admin Portal (Protected - HOSPITAL) */}
      <Route
        path="/hospital"
        element={
          <ProtectedRoute allowedRoles={['HOSPITAL']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HospitalDashboard />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="requests" element={<PatientRequestsPage />} />
        <Route path="appointments" element={<DonorAppointmentsPage />} />
        <Route path="expiry" element={<ExpiryMonitoringPage />} />
        <Route path="camps" element={<CampsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<HospitalProfilePage />} />
      </Route>

      {/* System Admin Portal (Protected - ADMIN) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="hospitals" element={<HospitalManagementPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="requests" element={<AdminRequestsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="rules" element={<BloodRulesPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="settings" element={<SystemSettingsPage />} />
      </Route>

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
