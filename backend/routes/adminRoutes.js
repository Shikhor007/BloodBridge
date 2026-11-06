const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All admin endpoints require authentication and ADMIN role
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

router.get('/dashboard', adminController.getAdminDashboard);

// Hospital Management
router.get('/hospitals', adminController.getAllHospitals);
router.put('/hospitals/:hospitalId/approval', adminController.updateHospitalApproval);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/status', adminController.updateUserStatus);
router.put('/donors/:donorId/verify', adminController.verifyDonor);

// Requests & Rules
router.get('/requests', adminController.getAllRequests);
router.get('/blood-rules', adminController.getBloodGroupRules);

// Audit & Settings
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSetting);
router.put('/service-charges/:chargeId', adminController.updateServiceCharge);

module.exports = router;
