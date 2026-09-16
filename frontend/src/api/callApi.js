import axios from './axios';

export const createCall = async (receiverId) => {
  const response = await axios.post('/users', { receiverId });
  return response.data;
};

export const getCall = async (callId) => {
  const response = await axios.get(`/users/${callId}`);
  return response.data;
};

export const getCallHistory = async () => {
  const response = await axios.get('/users');
  return response.data;
};

export const acceptCall = async (callId) => {
  const response = await axios.post(`/users/${callId}/accept`);
  return response.data;
};

export const rejectCall = async (callId) => {
  const response = await axios.post(`/users/${callId}/reject`);
  return response.data;
};

export const endCall = async (callId) => {
  const response = await axios.post(`/users/${callId}/end`);
  return response.data;
};

export const sendTranscript = async (callId, text, language = 'en') => {
  const response = await axios.post(`/users/${callId}/transcript`, { text, language });
  return response.data;
};
