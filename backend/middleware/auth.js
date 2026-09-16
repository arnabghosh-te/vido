const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId, {
            include: [{ model: Role, as: 'roles' }]
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account is deactivated' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

const authorizeSuperAdmin = (req, res, next) => {
    const roles = req.user.roles.map(r => r.name);
    if (!roles.includes('SUPER_ADMIN')) {
        return res.status(403).json({ success: false, message: 'Access denied. Super Admin only.' });
    }
    next();
};

const authorizeUser = (req, res, next) => {
    const roles = req.user.roles.map(r => r.name);
    if (!roles.includes('USER') && !roles.includes('SUPER_ADMIN')) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    next();
};

module.exports = {
    authenticate,
    authorizeSuperAdmin,
    authorizeUser
};
