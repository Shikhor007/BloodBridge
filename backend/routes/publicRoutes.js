const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/stats', publicController.getLandingStats);
router.get('/blood-availability', publicController.getBloodAvailability);
router.get('/blood-compatibility', publicController.getBloodCompatibility);
router.get('/service-charges', publicController.getServiceCharges);
router.post('/contact', publicController.submitContactTicket);

module.exports = router;
