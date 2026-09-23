import axios from 'axios';

export const fetchPublicPlans = async () => {
    const response = await axios.get('/api/plans');
    return response.data;
};

export const fetchAdminPlans = async () => {
    const response = await axios.get('/api/admin/plans');
    return response.data;
};

export const createPlan = async (planData) => {
    const response = await axios.post('/api/admin/plans', planData);
    return response.data;
};

export const updatePlan = async (id, planData) => {
    const response = await axios.put(`/api/admin/plans/${id}`, planData);
    return response.data;
};

export const deactivatePlan = async (id) => {
    const response = await axios.patch(`/api/admin/plans/${id}/deactivate`);
    return response.data;
};

export const reactivatePlan = async (id) => {
    const response = await axios.patch(`/api/admin/plans/${id}/reactivate`);
    return response.data;
};
