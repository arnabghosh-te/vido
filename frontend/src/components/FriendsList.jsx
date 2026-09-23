import React, { useState, useEffect } from 'react';
import { getFriends } from '../api/friendApi';
import { createCall } from '../api/callApi';
import { useNavigate } from 'react-router-dom';

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [callingId, setCallingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const res = await getFriends();
      if (res.success) {
        setFriends(res.friends);
      }
    } catch (error) {
      console.error("Failed to fetch friends", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCallUser = async (receiverId) => {
    try {
      setCallingId(receiverId);
      const res = await createCall(receiverId);
      navigate(`/video-call/${res.call.id}`, { state: { token: res.token, roomName: res.call.roomName } });
    } catch (error) {
      console.error("Failed to call user", error);
      alert(error?.response?.data?.message || "Failed to start call");
    } finally {
      setCallingId(null);
    }
  };

  if (loading) return <div className="dark:text-gray-300">Loading friends...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mt-6 transition-colors duration-200">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Friends</h3>
      {friends.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">You don't have any friends yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {friends.map((friend) => (
            <div key={friend.id} className="flex flex-col sm:flex-row items-center sm:justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 sm:space-y-0 transition-colors duration-200">
              <div className="flex items-center w-full">
                {friend.profilePicture || friend.profileImage ? (
                  <img 
                    src={friend.profilePicture || friend.profileImage} 
                    alt={friend.name} 
                    className="w-10 h-10 rounded-full flex-shrink-0 object-cover mr-3" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=random`;
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex-shrink-0 flex items-center justify-center text-green-700 dark:text-green-400 font-bold uppercase mr-3">
                    {friend.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{friend.name}</p>
                </div>
              </div>
              <button
                onClick={() => handleCallUser(friend.id)}
                disabled={callingId === friend.id}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 text-sm rounded transition duration-150 disabled:bg-gray-400"
              >
                {callingId === friend.id ? 'Calling...' : 'Call'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsList;
