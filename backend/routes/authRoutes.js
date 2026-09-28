const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword, verifyOtp, forgotPassword, resetPassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, upload.single('profilePicture'), updateProfile);
router.put('/change-password', authenticate, changePassword);

module.exports = router;
