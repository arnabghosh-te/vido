import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: `${API_URL}/friends`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getActiveUsers = async () => {
  const response = await api.get('/active-users');
  return response.data;
};

export const getFriends = async () => {
  const response = await api.get('/');
  return response.data;
};

export const getFriendRequests = async () => {
  const response = await api.get('/requests');
  return response.data;
};

export const sendFriendRequest = async (receiverId) => {
  const response = await api.post('/request', { receiverId });
  return response.data;
};

export const acceptFriendRequest = async (requestId) => {
  const response = await api.put(`/request/${requestId}/accept`);
  return response.data;
};

export const rejectFriendRequest = async (requestId) => {
  const response = await api.put(`/request/${requestId}/reject`);
  return response.data;
};

export const cancelFriendRequest = async (receiverId) => {
  const response = await api.delete(`/request/${receiverId}/cancel`);
  return response.data;
};
