import React, { useState, useEffect } from 'react';
import { getActiveUsers, sendFriendRequest, cancelFriendRequest } from '../api/friendApi';
import { getImageUrl } from '../utils/imageHelper';
import { useSocket } from '../context/SocketContext';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { socket } = useSocket();

  useEffect(() => {
    fetchUsers();

    if (socket) {
      const handleStateChanged = () => {
        fetchUsers(false);
      };
      
      socket.on('FRIEND_STATE_CHANGED', handleStateChanged);
      
      return () => {
        socket.off('FRIEND_STATE_CHANGED', handleStateChanged);
      };
    }
  }, [socket]);

  const fetchUsers = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await getActiveUsers();
      if (res.success) {
        setUsers(res.users);
      }
    } catch (error) {
      console.error("Failed to fetch active users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (receiverId) => {
    try {
      const res = await sendFriendRequest(receiverId);
      if (res.success) {
        alert(res.message);
        // Update local state to reflect request sent
        setUsers(users.map(u => u.id === receiverId ? { ...u, friendStatus: 'pending_sent' } : u));
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to send request");
    }
  };

  const handleCancelRequest = async (receiverId) => {
    try {
      const res = await cancelFriendRequest(receiverId);
      if (res.success) {
        alert(res.message);
        setUsers(users.map(u => u.id === receiverId ? { ...u, friendStatus: 'none' } : u));
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to cancel request");
    }
  };

  if (loading) return <div className="dark:text-gray-300">Loading active users...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active Users</h3>
      {users.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No new users to add right now.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div key={user.id} className="flex flex-col sm:flex-row items-center sm:justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 sm:space-y-0 transition-colors duration-200">
              <div className="flex items-center w-full">
                {user.profilePicture || user.profileImage ? (
                  <img 
                    src={getImageUrl(user.profilePicture || user.profileImage)} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full flex-shrink-0 object-cover mr-3" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold uppercase mr-3">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ID: {user.id}</p>
                </div>
              </div>
              <div className="flex-shrink-0 sm:ml-4">
                {user.friendStatus === 'friends' ? (
                  <span className="text-green-600 dark:text-green-400 font-medium text-sm px-2 py-1 bg-green-50 dark:bg-green-900/30 rounded">Friends</span>
                ) : user.friendStatus === 'pending_sent' ? (
                  <button
                    onClick={() => handleCancelRequest(user.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded transition duration-150"
                  >
                    Cancel Request
                  </button>
                ) : user.friendStatus === 'pending_received' ? (
                  <span className="text-blue-500 dark:text-blue-400 font-medium text-sm px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded">Pending Approval</span>
                ) : (
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded transition duration-150"
                  >
                    Add Friend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersList;
