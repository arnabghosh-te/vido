const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Role, Otp, sequelize } = require('../models');

class AuthService {
    async register(name, email, password, roleName = 'USER') {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('Email is already registered');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            isActive: false // Set to false initially
        });

        const role = await Role.findOne({ where: { name: roleName } });
        if (role) {
            await user.addRole(role);
        }

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP
        await Otp.create({
            userId: user.id,
            otp: otpCode,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        });

        // Send Email
        const emailService = require('./emailService');
        await emailService.sendOtpEmail(email, otpCode);

        return { 
            success: true, 
            message: 'OTP sent to email',
            requiresOtp: true,
            email: user.email
        };
    }

    async verifyOtp(email, otpCode) {
        const { Otp } = require('../models');
        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, as: 'roles' }]
        });

        if (!user) {
            throw new Error('User not found');
        }

        const otpRecord = await Otp.findOne({
            where: { userId: user.id, otp: otpCode }
        });

        if (!otpRecord) {
            throw new Error('Invalid OTP');
        }

        if (new Date() > otpRecord.expiresAt) {
            throw new Error('OTP has expired');
        }

        // OTP is valid
        user.isActive = true;
        await user.save();
        await otpRecord.destroy();

        return this.generateAuthResponse(user);
    }

    async login(email, password) {
        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, as: 'roles' }]
        });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
            throw new Error('Account is deactivated');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        return this.generateAuthResponse(user);
    }

    async changePassword(userId, oldPassword, newPassword) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error('User not found');

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) throw new Error('Incorrect old password');

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return true;
    }

    async forgotPassword(email) {
        const user = await User.findOne({ where: { email } });
        if (!user || !user.isActive) {
            return { success: true, message: 'If an account exists for that email, a password reset token has been sent.' };
        }

        await Otp.destroy({ where: { userId: user.id } });
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const otpRecord = await Otp.create({
            userId: user.id,
            otp: resetTokenHash,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000)
        });

        try {
            const emailService = require('./emailService');
            await emailService.sendPasswordResetEmail(email, resetToken);
        } catch (error) {
            await otpRecord.destroy();
            throw new Error('Unable to send password reset email', { cause: error });
        }

        return { success: true, message: 'If an account exists for that email, a password reset token has been sent.' };
    }

    async resetPassword(email, resetToken, newPassword) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error('Invalid or expired password reset token');
        }

        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const transaction = await sequelize.transaction();
        try {
            const lockedUser = await User.findByPk(user.id, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            const otpRecord = await Otp.findOne({
                where: { userId: user.id, otp: resetTokenHash },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!lockedUser || !otpRecord || new Date() > otpRecord.expiresAt) {
                await transaction.rollback();
                throw new Error('Invalid or expired password reset token');
            }

            await lockedUser.update({ password: hashedPassword }, { transaction });
            await Otp.destroy({ where: { userId: user.id }, transaction });
            await transaction.commit();
        } catch (error) {
            if (!transaction.finished) {
                await transaction.rollback();
            }
            throw error;
        }

        return true;
    }

    async updateProfile(userId, data) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error('User not found');

        if (data.name) user.name = data.name;
        if (data.profilePicture) user.profilePicture = data.profilePicture;

        await user.save();
        return user;
    }

    generateAuthResponse(user) {
        let role = 'USER';
        if (user.roles && user.roles.some(r => r.name === 'SUPER_ADMIN')) {
            role = 'SUPER_ADMIN';
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '3d' }
        );

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                role
            }
        };
    }
}

module.exports = new AuthService();
