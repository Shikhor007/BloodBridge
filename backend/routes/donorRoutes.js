const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All donor endpoints require authentication and DONOR role
router.use(authenticateToken);
router.use(requireRole('DONOR'));

router.get('/dashboard', donorController.getDonorDashboard);
router.get('/eligibility', donorController.checkEligibility);
router.get('/available-slots', donorController.getAvailableSlotsAndCamps);
router.post('/appointments', donorController.bookAppointment);
router.put('/appointments/:id/cancel', donorController.cancelAppointment);
router.get('/certificate', donorController.getCertificateData);

module.exports = router;
