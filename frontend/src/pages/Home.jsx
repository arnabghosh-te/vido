import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createCall } from '../api/callApi';
import { getCurrentSubscription } from '../api/subscriptionApi';
import UsersList from '../components/UsersList';
import FriendsList from '../components/FriendsList';
import NotificationsPanel from '../components/NotificationsPanel';
import ThemeToggle from '../components/ThemeToggle';
const Home = () => {
  const { user, logout } = useAuth();
  const [receiverId, setReceiverId] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [coins, setCoins] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const res = await getCurrentSubscription();
        if (res.success && res.data) {
          setCoins(res.data.remainingTokens);
        }
      } catch (error) {
        console.log("No active subscription for coins");
      }
    };
    fetchCoins();
  }, []);

  const handleCallUser = async () => {
    if (!receiverId.trim()) {
      alert("Please enter a User ID");
      return;
    }
    try {
      setIsCalling(true);
      const res = await createCall(receiverId);
      console.log(res)
      navigate(`/video-call/${res.call.id}`, { state: { token: res.token, roomName: res.call.roomName } });
    } catch (error) {
      console.error("Failed to call user", error);
      alert(error?.response?.data?.message || "Failed to start call");

    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Vidu</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/50 px-3 py-1 rounded-full">
                <span role="img" aria-label="coin" className="mr-1">🪙</span>
                <span className="font-bold text-yellow-700 dark:text-yellow-400">{coins} Coins</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">Welcome, {user?.name}</span>
              <ThemeToggle />
              <NotificationsPanel />
              <Link to="/profile" className="text-blue-500 hover:underline">
                Profile
              </Link>
              <Link to="/transcripts" className="text-blue-500 hover:underline">
                Transcripts
              </Link>
              <Link to="/chat-document" className="text-blue-500 hover:underline">
                Document Chat
              </Link>
              {user?.role === 'SUPER_ADMIN' && (
                <Link to="/admin" className="text-blue-500 hover:underline">
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-150"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">User Dashboard</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Your role: {user?.role}</p>
              
              <div className="mt-8">
                <Link to="/pricing" className="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded hover:bg-blue-700 transition duration-150">
                  View Subscription Plans
                </Link>
              </div>

              <div className="mt-8 text-left w-full">
                <UsersList />
                <FriendsList />
              </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
