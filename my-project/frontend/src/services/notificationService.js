/**
 * Service API: Notifications et Messages
 */

import api from './api';

/**
 * Notifications
 */
export const getNotifications = async (params = {}) => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

export const getNotificationCount = async () => {
  const response = await api.get('/notifications/count');
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.put(`/notifications/${id}/lire`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.put('/notifications/lire-toutes');
  return response.data;
};

/**
 * Messages
 */
export const getMessages = async (params = {}) => {
  const response = await api.get('/messages', { params });
  return response.data;
};

export const getMessage = async (id) => {
  const response = await api.get(`/messages/${id}`);
  return response.data;
};

export const sendMessage = async (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  
  const response = await api.post('/messages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const markMessageRead = async (id) => {
  const response = await api.put(`/messages/${id}/lu`);
  return response.data;
};

export const deleteMessage = async (id) => {
  const response = await api.delete(`/messages/${id}`);
  return response.data;
};

export default {
  getNotifications,
  getNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  getMessages,
  getMessage,
  sendMessage,
  markMessageRead,
  deleteMessage
};
