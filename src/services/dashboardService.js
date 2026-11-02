import api from './api';

export const getEmployeeDashboard = () =>
    api.get('/employee/dashboard');

export const getManagerDashboard = () =>
    api.get('/manager/dashboard');
