import axios from './axios';

export const getTranscripts = async () => {
  const response = await axios.get('/transcripts');
  // axios interceptor already returns response.data
  // which is { success, message, data: [...] }
  return response.data;
};

export const getTranscriptById = async (id) => {
  const response = await axios.get(`/transcripts/${id}`);
  return response.data;
};

export const deleteTranscript = async (id) => {
  const response = await axios.delete(`/transcripts/${id}`);
  return response;
};

export const generateTranscriptSummary = async (id) => {
  const response = await axios.post(`/transcripts/${id}/summary`);
  console.log("response generting:", response)
  return response.data;
};

export const chatWithTranscript = async (id, question) => {
  const response = await axios.post(`/transcripts/${id}/chat`, { question });
  return response.data;
};
