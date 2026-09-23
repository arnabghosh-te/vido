const { User, FriendRequest, Friend, Notification, Role } = require('../models');
const { Op } = require('sequelize');
const { sendToUser } = require('../sockets/index');

exports.getActiveUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find friends
    const friends = await Friend.findAll({
      where: {
        [Op.or]: [{ userId1: userId }, { userId2: userId }]
      }
    });
    
    const friendIds = new Set(friends.map(f => f.userId1 == userId ? f.userId2 : f.userId1));
    
    // Find pending friend requests
    const requests = await FriendRequest.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
        status: 'pending'
      }
    });

    const pendingSentIds = new Set(requests.filter(r => r.senderId == userId).map(r => r.receiverId));
    const pendingReceivedIds = new Set(requests.filter(r => r.receiverId == userId).map(r => r.senderId));

    const users = await User.findAll({
      where: {
        isActive: true,
        id: { [Op.ne]: userId }
      },
      include: [{
        model: Role,
        as: 'roles',
        where: { name: 'USER' }
      }],
      attributes: ['id', 'name', 'email', 'profilePicture', 'profileImage']
    });

    const usersData = users
      .filter(u => !friendIds.has(u.id))
      .map(u => {
        let status = 'none';
        if (pendingSentIds.has(u.id)) {
          status = 'pending_sent';
        } else if (pendingReceivedIds.has(u.id)) {
          status = 'pending_received';
        }
        return { ...u.toJSON(), friendStatus: status };
      });

    res.status(200).json({ success: true, users: usersData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      return res.status(400).json({ success: false, message: "Cannot send request to yourself." });
    }

    const existingRequest = await FriendRequest.findOne({
      where: {
        [Op.or]: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ],
        status: 'pending'
      }
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: "Friend request already pending." });
    }

    // Check if already friends
    const existingFriend = await Friend.findOne({
      where: {
        [Op.or]: [
          { userId1: senderId, userId2: receiverId },
          { userId1: receiverId, userId2: senderId }
        ]
      }
    });

    if (existingFriend) {
      return res.status(400).json({ success: false, message: "Already friends." });
    }

    const request = await FriendRequest.create({
      senderId,
      receiverId,
      status: 'pending'
    });

    // Create notification
    const notification = await Notification.create({
      userId: receiverId,
      title: 'New Friend Request',
      message: `${req.user.name} sent you a friend request.`,
      type: 'friend_request',
      isRead: false
    });

    sendToUser(receiverId, 'new_notification', notification);
    sendToUser(receiverId, 'FRIEND_STATE_CHANGED', {});
    sendToUser(senderId, 'FRIEND_STATE_CHANGED', {});

    res.status(201).json({ success: true, message: "Friend request sent.", request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const request = await FriendRequest.findOne({
      where: { id, receiverId: userId, status: 'pending' }
    });

    if (!request) {
      return res.status(404).json({ success: false, message: "Friend request not found or not pending." });
    }

    request.status = 'accepted';
    await request.save();

    await Friend.create({
      userId1: request.senderId,
      userId2: request.receiverId
    });

    const notification = await Notification.create({
      userId: request.senderId,
      title: 'Friend Request Accepted',
      message: `${req.user.name} accepted your friend request.`,
      type: 'friend_request',
      isRead: false
    });

    sendToUser(request.senderId, 'new_notification', notification);
    sendToUser(request.senderId, 'FRIEND_STATE_CHANGED', {});
    sendToUser(request.receiverId, 'FRIEND_STATE_CHANGED', {});

    res.status(200).json({ success: true, message: "Friend request accepted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const request = await FriendRequest.findOne({
      where: { id, receiverId: userId, status: 'pending' }
    });

    if (!request) {
      return res.status(404).json({ success: false, message: "Friend request not found or not pending." });
    }

    request.status = 'rejected';
    await request.save();

    sendToUser(request.senderId, 'FRIEND_STATE_CHANGED', {});
    sendToUser(request.receiverId, 'FRIEND_STATE_CHANGED', {});

    res.status(200).json({ success: true, message: "Friend request rejected." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const userId = req.user.id;

    const friends = await Friend.findAll({
      where: {
        [Op.or]: [{ userId1: userId }, { userId2: userId }]
      },
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name', 'email', 'profilePicture', 'profileImage'] },
        { model: User, as: 'user2', attributes: ['id', 'name', 'email', 'profilePicture', 'profileImage'] }
      ]
    });

    const friendList = friends.map(f => f.userId1 == userId ? f.user2 : f.user1);

    res.status(200).json({ success: true, friends: friendList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await FriendRequest.findAll({
      where: { receiverId: userId, status: 'pending' },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email', 'profilePicture', 'profileImage'] }]
    });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.params;

    const request = await FriendRequest.findOne({
      where: {
        senderId,
        receiverId,
        status: 'pending'
      }
    });

    if (!request) {
      return res.status(404).json({ success: false, message: "Pending request not found." });
    }

    await request.destroy();

    sendToUser(senderId, 'FRIEND_STATE_CHANGED', {});
    sendToUser(receiverId, 'FRIEND_STATE_CHANGED', {});

    res.status(200).json({ success: true, message: "Friend request cancelled." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    const friend = await Friend.findOne({
      where: {
        [Op.or]: [
          { userId1: userId, userId2: friendId },
          { userId1: friendId, userId2: userId }
        ]
      }
    });

    if (!friend) {
      return res.status(404).json({ success: false, message: "Friend not found." });
    }

    await friend.destroy();

    sendToUser(friendId, 'FRIEND_REMOVED', { friendId: userId });
    sendToUser(friendId, 'FRIEND_STATE_CHANGED', {});
    sendToUser(userId, 'FRIEND_STATE_CHANGED', {});

    res.status(200).json({ success: true, message: "Friend removed successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
