import React, { useState, useEffect } from 'react';
import { getNotifications, markAsRead } from '../api/notificationApi';
import { getFriendRequests, acceptFriendRequest, rejectFriendRequest } from '../api/friendApi';

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [notifRes, reqRes] = await Promise.all([
        getNotifications(),
        getFriendRequests()
      ]);
      if (notifRes.success) setNotifications(notifRes.notifications);
      if (reqRes.success) setRequests(reqRes.requests);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Listen for socket events here ideally, but for now we'll fetch when opened.

  const handleAccept = async (requestId, notifId) => {
    try {
      await acceptFriendRequest(requestId);
      if (notifId) await markAsRead(notifId);
      alert("Friend request accepted!");
      fetchData(); // refresh
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to accept");
    }
  };

  const handleReject = async (requestId, notifId) => {
    try {
      await rejectFriendRequest(requestId);
      if (notifId) await markAsRead(notifId);
      alert("Friend request rejected");
      fetchData();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to reject");
    }
  };

  const handleMarkRead = async (notifId) => {
    try {
      await markAsRead(notifId);
      setNotifications(notifications.map(n => n.id === notifId ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-gray-100 dark:bg-gray-700 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none"
      >
        <span role="img" aria-label="bell">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-200 flex justify-between">
            <span>Notifications</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">No notifications</div>
            ) : (
              notifications.map((notif) => {
                const relatedRequest = notif.type === 'friend_request' 
                  ? requests.find(r => r.sender.name && notif.message.includes(r.sender.name)) 
                  : null;

                return (
                  <div key={notif.id} className={`p-4 border-b border-gray-100 dark:border-gray-700 ${!notif.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'}`}>
                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{notif.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                    
                    {notif.type === 'friend_request' && relatedRequest && !notif.isRead && (
                      <div className="mt-2 flex space-x-2">
                        <button 
                          onClick={() => handleAccept(relatedRequest.id, notif.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleReject(relatedRequest.id, notif.id)}
                          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {!notif.isRead && notif.type !== 'friend_request' && (
                       <div className="mt-2 text-right">
                         <button 
                           onClick={() => handleMarkRead(notif.id)}
                           className="text-xs text-blue-500 hover:underline"
                         >
                           Mark as read
                         </button>
                       </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
