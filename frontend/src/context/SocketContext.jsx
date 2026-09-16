import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { acceptCall, rejectCall } from '../api/callApi';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let newSocket;

    if (user) {
      const token = localStorage.getItem('token');
      newSocket = io("http://localhost:5000", {
        auth: { token },
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('INCOMING_CALL', (data) => {
        setIncomingCall(data.call);
      });

      newSocket.on('CALL_ACCEPTED', (data) => {
        // If we are the caller, we might get this
        navigate(`/video-call/${data.call.id}`, { state: { token: data.token, roomName: data.call.roomName } });
      });

      newSocket.on('LOW_TOKEN', (data) => {
        alert(`Low Token Warning! You have ${data.remaining} tokens left.`);
      });

      newSocket.on('CALL_TERMINATED', (data) => {
        alert(`Call terminated: ${data.reason}`);
        navigate('/');
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) newSocket.close();
    };
  }, [user, navigate]);

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    try {
      const res = await acceptCall(incomingCall.id);
      console.log('Accept call response:', res);
      setIncomingCall(null);
      navigate(`/video-call/${incomingCall.id}`, { state: { token: res.token, roomName: res.call.roomName } });
    } catch (error) {
      console.error('Failed to accept call', error);
      alert(`Failed to accept call: ${error?.response?.data?.message || error.message}`);
    }
  };

  const handleRejectCall = async () => {
    if (!incomingCall) return;
    try {
      await rejectCall(incomingCall.id);
      setIncomingCall(null);
    } catch (error) {
      console.error('Failed to reject call', error);
    }
  };

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">Incoming Call</h2>
            <p className="mb-6">You have an incoming call from User {incomingCall.callerId}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleAcceptCall}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Accept
              </button>
              <button
                onClick={handleRejectCall}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
