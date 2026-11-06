const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/login', authController.login);
router.post('/register/donor', authController.registerDonor);
router.post('/register/patient', authController.registerPatient);
router.post('/register/hospital', upload.single('hospital_document'), authController.registerHospital);

router.get('/me', authenticateToken, authController.getMe);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
