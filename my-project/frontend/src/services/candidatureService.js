/**
 * Service API: Candidatures
 * Communication avec l'API backend pour les candidatures
 */

import api from './api';

/**
 * Soumet une candidature
 * @param {FormData} formData - Données du formulaire avec fichiers
 */
export const submitCandidature = async (formData) => {
  const response = await api.post('/candidatures', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

/**
 * Suit une candidature par numéro de suivi
 * @param {string} numero - Numéro de suivi
 * @param {string} email - Email du candidat
 */
export const trackCandidature = async (numero, email) => {
  const response = await api.get(`/candidatures/track/${numero}`);
  return response.data.data;
};

/**
 * Récupère la liste des candidatures (admin)
 * @param {Object} params - Paramètres de requête
 */
export const getCandidatures = async (params = {}) => {
  const response = await api.get('/candidatures', { params });
  return response.data;
};

/**
 * Récupère une candidature par ID (admin)
 * @param {number} id - ID de la candidature
 */
export const getCandidatureById = async (id) => {
  const response = await api.get(`/candidatures/${id}`);
  return response.data.data;
};

/**
 * Met à jour le statut d'une candidature (admin)
 * @param {number} id - ID de la candidature
 * @param {Object} data - Données de mise à jour
 */
export const updateCandidature = async (id, data) => {
  const response = await api.put(`/candidatures/${id}`, data);
  return response.data.data;
};

/**
 * Accepte une candidature (admin)
 * @param {number} id - ID de la candidature
 * @param {Object} data - Données d'acceptation
 */
export const acceptCandidature = async (id, data = {}) => {
  const response = await api.post(`/candidatures/${id}/accept`, data);
  return response.data;
};

/**
 * Refuse une candidature (admin)
 * @param {number} id - ID de la candidature
 * @param {string} commentaire - Motif du refus
 */
export const rejectCandidature = async (id, commentaire) => {
  const response = await api.post(`/candidatures/${id}/reject`, { commentaire });
  return response.data;
};

/**
 * Met en liste d'attente (admin)
 * @param {number} id - ID de la candidature
 * @param {string} commentaire - Commentaire
 */
export const waitlistCandidature = async (id, commentaire) => {
  const response = await api.post(`/candidatures/${id}/waitlist`, { commentaire });
  return response.data;
};

/**
 * Demande des documents supplémentaires (admin)
 * @param {number} id - ID de la candidature
 * @param {string} commentaire - Commentaire
 */
export const requestDocuments = async (id, commentaire) => {
  const response = await api.post(`/candidatures/${id}/documents`, { commentaire });
  return response.data;
};

/**
 * Envoie un message direct au candidat (admin)
 * @param {number} id - ID de la candidature
 * @param {string} message - Contenu du message
 */
export const sendMessage = async (id, message) => {
  const response = await api.post(`/candidatures/${id}/message`, { message });
  return response.data;
};

export default {
  submitCandidature,
  trackCandidature,
  getCandidatures,
  getCandidatureById,
  updateCandidature,
  acceptCandidature,
  rejectCandidature,
  waitlistCandidature,
  requestDocuments,
  sendMessage
};
