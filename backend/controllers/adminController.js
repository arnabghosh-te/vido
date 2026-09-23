const { User, Role, Plan, Subscription, Call } = require('../models');
const { Op } = require('sequelize');

// ... (keep getters before getSystemStats unchanged, they start at line 4)
const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: [{ model: Role, as: 'roles' }]
        });
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isActive = isActive;
        await user.save();

        res.status(200).json({ success: true, message: 'User status updated', user: { id: user.id, isActive: user.isActive } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { roleName } = req.body; // 'USER' or 'SUPER_ADMIN'

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const role = await Role.findOne({ where: { name: roleName } });
        if (!role) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        await user.setRoles([role]); // Replace existing roles

        res.status(200).json({ success: true, message: 'User role updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { isActive: true } });
        const inactiveUsers = totalUsers - activeUsers;

        const superAdmins = await User.count({
            include: [{
                model: Role,
                as: 'roles',
                where: { name: 'SUPER_ADMIN' }
            }]
        });

        // Subscriptions
        const activeSubscriptions = await Subscription.count({ where: { status: 'ACTIVE' } });
        const totalSubscriptions = await Subscription.count();

        // Calls
        const totalCalls = await Call.count();
        const totalCallDuration = await Call.sum('durationSeconds') || 0;
        const totalCallerTokens = await Call.sum('callerTokensUsed') || 0;
        const totalReceiverTokens = await Call.sum('receiverTokensUsed') || 0;
        const totalTokensConsumed = totalCallerTokens + totalReceiverTokens;

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                inactiveUsers,
                superAdmins,
                activeSubscriptions,
                totalSubscriptions,
                totalCalls,
                totalCallDuration,
                totalTokensConsumed
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCallsHistory = async (req, res) => {
    try {
        const calls = await Call.findAll({
            attributes: { exclude: ['transcript', 'summary'] },
            include: [
                { model: User, as: 'caller', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ success: true, calls });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.findAll({ where: { isActive: true } });
        res.status(200).json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Plan Management (Admin)
const getAdminPlans = async (req, res) => {
    try {
        const plans = await Plan.findAll();
        res.status(200).json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createPlan = async (req, res) => {
    try {
        const { name, description, price, tokensIncluded, durationInDays, isActive } = req.body;
        const plan = await Plan.create({
            name,
            description,
            price,
            tokensIncluded,
            durationInDays,
            isActive: isActive !== undefined ? isActive : true
        });
        res.status(201).json({ success: true, plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const plan = await Plan.findByPk(id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        await plan.update(updates);
        res.status(200).json({ success: true, plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deactivatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await Plan.findByPk(id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        plan.isActive = false;
        await plan.save();
        res.status(200).json({ success: true, message: 'Plan deactivated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const reactivatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await Plan.findByPk(id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        plan.isActive = true;
        await plan.save();
        res.status(200).json({ success: true, message: 'Plan reactivated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getUsers,
    updateUserStatus,
    updateUserRole,
    getSystemStats,
    getCallsHistory,
    getAdminPlans,
    createPlan,
    updatePlan,
    deactivatePlan,
    reactivatePlan,
    getAllPlans
};
