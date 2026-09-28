const authService = require('../services/authService');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const result = await authService.register(name, email, password);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }
        
        const result = await authService.verifyOtp(email, otp);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const result = await authService.login(email, password);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        // req.user is set by the auth middleware
        const roles = req.user.roles.map(r => r.name);
        const role = roles.includes('SUPER_ADMIN') ? 'SUPER_ADMIN' : 'USER';

        res.status(200).json({
            success: true,
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                profilePicture: req.user.profilePicture,
                role: role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.profilePicture = '/public/profiles/' + req.file.filename;
        }

        const updatedUser = await authService.updateProfile(req.user.id, data);
        res.status(200).json({
            success: true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                profilePicture: updatedUser.profilePicture
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Both old and new passwords are required' });
        }

        await authService.changePassword(req.user.id, oldPassword, newPassword);
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
        const result = await authService.forgotPassword(email);
        res.status(200).json(result);
    } catch (error) {
        console.error('Forgot password failed:', error);
        res.status(500).json({ success: false, message: 'Unable to process password reset request' });
    }
};

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (
        typeof email !== 'string' ||
        !email.trim() ||
        typeof otp !== 'string' ||
        !otp ||
        typeof newPassword !== 'string' ||
        !newPassword
    ) {
        return res.status(400).json({
            success: false,
            message: 'Email, reset OTP, and new password are required'
        });
    }

    try {
        await authService.resetPassword(email, otp, newPassword);
        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        if (error.message === 'Invalid or expired password reset OTP') {
            return res.status(400).json({ success: false, message: error.message });
        }

        console.error('Reset password failed:', error);
        res.status(500).json({ success: false, message: 'Unable to reset password' });
    }
};

module.exports = {
    register,
    verifyOtp,
    login,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword
};
