import axios from 'axios';

export const fetchUsers = async () => {
    const response = await axios.get('/api/admin/users');
    return response.data;
};

export const toggleUserStatus = async (userId, isActive) => {
    const response = await axios.patch(`/api/admin/users/${userId}/status`, { isActive });
    return response.data;
};

export const changeUserRole = async (userId, roleName) => {
    const response = await axios.patch(`/api/admin/users/${userId}/role`, { roleName });
    return response.data;
};

export const fetchStats = async () => {
    const response = await axios.get('/api/admin/stats');
    return response.data;
};

export const fetchCallsHistory = async () => {
    const response = await axios.get('/api/admin/calls');
    return response.data;
};
