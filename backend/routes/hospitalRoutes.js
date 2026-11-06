const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All hospital endpoints require authentication and HOSPITAL role
router.use(authenticateToken);
router.use(requireRole('HOSPITAL'));

router.get('/dashboard', hospitalController.getHospitalDashboard);
router.get('/inventory', hospitalController.getInventory);
router.post('/inventory', hospitalController.addBloodUnit);
router.put('/inventory/:unitId/discard', hospitalController.discardBloodUnit);

router.get('/requests', hospitalController.getHospitalRequests);
router.post('/requests/:requestId/assign-units', hospitalController.assignUnitsToRequest);
router.put('/requests/:requestId/status', hospitalController.updateRequestStatus);

router.get('/appointments', hospitalController.getHospitalAppointments);
router.put('/appointments/:appointmentId/status', hospitalController.updateAppointmentStatus);
router.post('/donations/record-completion', hospitalController.recordDonationCompletion);

router.get('/camps', hospitalController.getHospitalCamps);
router.post('/camps', hospitalController.createCamp);

router.get('/reports', hospitalController.getReports);

module.exports = router;
