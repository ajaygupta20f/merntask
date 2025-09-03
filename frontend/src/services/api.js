import axios from 'axios';
import { auth } from '../firebase';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
});
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken(true);
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token added to request');
    } catch (error) {
      console.error('Error getting token:', error);
    }
  } else {
    console.log('No current user found');
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
export const taskAPI = {
  getTasks: () => api.get('/tasks'),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`)
};
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateUserRole: (userId, role) => api.put(`/users/${userId}/role`, { role })
};
export default api;
