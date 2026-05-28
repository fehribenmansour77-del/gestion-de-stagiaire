/**
 * Service API: Conventions
 * Communication avec l'API backend pour les conventions
 */

import api from './api';

/**
 * Génère une convention pour une candidature
 * @param {number} candidatureId - ID de la candidature
 */
export const generateConvention = async (candidatureId) => {
  const response = await api.post('/conventions', { candidature_id: candidatureId });
  return response.data;
};

/**
 * Liste des conventions
 * @param {Object} params - Paramètres de requête
 */
export const getConventions = async (params = {}) => {
  const response = await api.get('/conventions', { params });
  return response.data;
};

/**
 * Récupère une convention par ID
 * @param {number} id - ID de la convention
 */
export const getConventionById = async (id) => {
  const response = await api.get(`/conventions/${id}`);
  return response.data;
};

/**
 * Récupère la convention par ID de candidature
 * @param {number} candidatureId - ID de la candidature
 */
export const getConventionByCandidature = async (candidatureId) => {
  const response = await api.get(`/conventions/candidature/${candidatureId}`);
  return response.data;
};

/**
 * Upload la convention signée
 * @param {number} id - ID de la convention
 * @param {File} file - Fichier PDF
 */
export const uploadSignedConvention = async (id, file) => {
  const formData = new FormData();
  formData.append('fichier_signe', file);
  
  const response = await api.post(`/conventions/${id}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

/**
 * Signature RH de la convention
 * @param {number} id - ID de la convention
 * @param {string} commentaire - Commentaire optionnel
 */
export const signConvention = async (id, commentaire = '') => {
  const response = await api.post(`/conventions/${id}/sign`, { commentaire });
  return response.data;
};

/**
 * Archive la convention
 * @param {number} id - ID de la convention
 */
export const archiveConvention = async (id) => {
  const response = await api.post(`/conventions/${id}/archive`);
  return response.data;
};

/**
 * Télécharge la convention
 * @param {number} id - ID de la convention
 * @param {string} type - Type de fichier ('genere' ou 'signe')
 */
export const downloadConvention = async (id, type = 'genere') => {
  const response = await api.get(`/conventions/${id}/download`, {
    params: { type },
    responseType: 'blob'
  });
  return response.data;
};

export default {
  generateConvention,
  getConventions,
  getConventionById,
  getConventionByCandidature,
  uploadSignedConvention,
  signConvention,
  archiveConvention,
  downloadConvention
};
