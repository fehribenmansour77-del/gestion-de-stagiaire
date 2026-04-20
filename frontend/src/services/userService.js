/**
 * Service API: Gestion des Utilisateurs
 */
import api from './api';

export const listUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export default {
  listUsers,
  getUserById
};
