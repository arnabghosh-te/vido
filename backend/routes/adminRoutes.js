const express = require('express');
const router = express.Router();
const {getAdminPlans,getUsers,updateUserRole,updateUserStatus,getSystemStats,getCallsHistory,createPlan,updatePlan,deactivatePlan} = require('../controllers/adminController');
const { authenticate, authorizeSuperAdmin } = require('../middleware/auth');

router.use(authenticate);
router.use(authorizeSuperAdmin);

// User Management
router.get('/users', getUsers);
router.patch('/users/:id/status',updateUserStatus);
router.patch('/users/:id/role',updateUserRole);
router.get('/stats',getSystemStats);
router.get('/calls',getCallsHistory);

// Plan Management

router.get('/plans', getAdminPlans);
router.post('/plans',createPlan);
router.put('/plans/:id',updatePlan);
router.patch('/plans/:id/deactivate',deactivatePlan);

module.exports = router;
