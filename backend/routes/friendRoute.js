const express = require('express');
const { authenticate, authorizeUser } = require('../middleware/auth');
const { getActiveUsers, sendRequest, acceptRequest, rejectRequest, getFriends, getFriendRequests, cancelRequest, removeFriend } = require('../controllers/friendController');

const router = express.Router();

router.use(authenticate);

router.get('/active-users', getActiveUsers);
router.post('/request', sendRequest);
router.delete('/request/:receiverId/cancel', cancelRequest);
router.get('/requests', getFriendRequests);
router.put('/request/:id/accept', acceptRequest);
router.put('/request/:id/reject', rejectRequest);
router.get('/', getFriends);
router.delete('/:friendId', removeFriend);

module.exports = router;
