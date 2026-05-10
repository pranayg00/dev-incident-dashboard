import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

export const getServices = () => API.get('/services');
export const addService = (data) => API.post('/services', data);
export const deleteService = (id) => API.delete(`/services/${id}`);
export const triggerIncident = (id) => API.post(`/services/${id}/trigger-incident`);

export const getIncidents = () => API.get('/incidents');
export const getIncident = (id) => API.get(`/incidents/${id}`);
export const analyzeIncident = (id) => API.post(`/incidents/${id}/analyze`);
export const resolveIncident = (id) => API.put(`/incidents/${id}/resolve`);

export const getMetrics = (serviceId) => API.get(`/metrics/${serviceId}`);
export const getUptimeStats = () => API.get('/metrics/stats/uptime');

export default API;