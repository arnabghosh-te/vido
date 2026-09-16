import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { fetchStats, fetchCallsHistory } from '../../api/adminApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, callsData] = await Promise.all([
          fetchStats(),
          fetchCallsHistory()
        ]);
        setStats(statsData.stats);
        setCalls(callsData.calls);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
        
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
                <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
                <h3 className="text-gray-500 text-sm font-medium">Active Users</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.activeUsers}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border-t-4 border-purple-500">
                <h3 className="text-gray-500 text-sm font-medium">Active Subscriptions</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.activeSubscriptions} / {stats.totalSubscriptions}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-500">
                <h3 className="text-gray-500 text-sm font-medium">Tokens Consumed</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalTokensConsumed}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border-t-4 border-indigo-500">
                <h3 className="text-gray-500 text-sm font-medium">Total Calls</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalCalls}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border-t-4 border-teal-500">
                <h3 className="text-gray-500 text-sm font-medium">Total Call Duration (s)</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalCallDuration}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border-t-4 border-red-500">
                <h3 className="text-gray-500 text-sm font-medium">Inactive Users</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.inactiveUsers}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border-t-4 border-pink-500">
                <h3 className="text-gray-500 text-sm font-medium">Super Admins</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.superAdmins}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Call History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caller ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caller Tokens</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver Tokens</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {calls.map((call) => (
                      <tr key={call.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{call.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(call.createdAt).toLocaleDateString()} {new Date(call.createdAt).toLocaleTimeString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {call.caller ? `${call.caller.name} (ID: ${call.callerId})` : call.callerId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {call.receiver ? `${call.receiver.name} (ID: ${call.receiverId})` : call.receiverId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.durationSeconds}s</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{call.callerTokensUsed}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{call.receiverTokensUsed}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            call.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            call.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                            call.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {call.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {calls.length === 0 && (
                      <tr>
                        <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                          No calls found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
