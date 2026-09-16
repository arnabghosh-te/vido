import axios from './axios';

export const subscribeToPlan = async (subscriptionPlanId) => {
  const response = await axios.post('/subscriptions/checkout', { subscriptionPlanId });
  return response;
};

export const getCurrentSubscription = async () => {
  const response = await axios.get('/subscriptions/current');
  return response;
};

export const getSubscriptionHistory = async () => {
  const response = await axios.get('/subscriptions/history');
  return response;
};
