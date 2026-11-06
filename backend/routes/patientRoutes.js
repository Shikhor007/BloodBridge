const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All patient endpoints require authentication and PATIENT role
router.use(authenticateToken);
router.use(requireRole('PATIENT'));

router.get('/dashboard', patientController.getPatientDashboard);
router.post('/requests', upload.single('prescription'), patientController.submitBloodRequest);
router.get('/requests/:id/tracking', patientController.getRequestTracking);
router.post('/future-requests', patientController.registerFutureRequest);

module.exports = router;
