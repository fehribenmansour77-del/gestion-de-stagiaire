/**
 * Service API: Évaluations
 * Communication avec l'API backend pour les évaluations
 */

import api from './api';

/**
 * Récupère toutes les évaluations
 * @param {Object} params - Paramètres de requête
 */
export const getEvaluations = async (params = {}) => {
  const response = await api.get('/evaluations', { params });
  return response.data;
};

/**
 * Récupère une évaluation par ID
 * @param {number} id - ID de l'évaluation
 */
export const getEvaluation = async (id) => {
  const response = await api.get(`/evaluations/${id}`);
  return response.data;
};

/**
 * Crée une nouvelle évaluation
 * @param {Object} data - Données de l'évaluation
 */
export const createEvaluation = async (data) => {
  const response = await api.post('/evaluations', data);
  return response.data;
};

/**
 * Met à jour une évaluation
 * @param {number} id - ID de l'évaluation
 * @param {Object} data - Données à mettre à jour
 */
export const updateEvaluation = async (id, data) => {
  const response = await api.put(`/evaluations/${id}`, data);
  return response.data;
};

/**
 * Soumet une évaluation
 * @param {number} id - ID de l'évaluation
 */
export const submitEvaluation = async (id) => {
  const response = await api.post(`/evaluations/${id}/soumettre`);
  return response.data;
};

/**
 * Valide une évaluation par RH
 * @param {number} id - ID de l'évaluation
 */
export const validateEvaluationRH = async (id) => {
  const response = await api.post(`/evaluations/${id}/valider-rh`);
  return response.data;
};

/**
 * Rejette une évaluation par RH
 * @param {number} id - ID de l'évaluation
 * @param {string} commentaire - Commentaire de rejet
 */
export const rejectEvaluationRH = async (id, commentaire) => {
  const response = await api.post(`/evaluations/${id}/rejeter-rh`, { commentaire });
  return response.data;
};

/**
 * Génère le PDF d'une évaluation
 * @param {number} id - ID de l'évaluation
 */
export const generateEvaluationPDF = async (id) => {
  const response = await api.get(`/evaluations/${id}/pdf`, {
    responseType: 'blob'
  });
  
  // Créer un lien de téléchargement
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `evaluation_${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/**
 * Supprime une évaluation
 * @param {number} id - ID de l'évaluation
 */
export const deleteEvaluation = async (id) => {
  const response = await api.delete(`/evaluations/${id}`);
  return response.data;
};

export default {
  getEvaluations,
  getEvaluation,
  createEvaluation,
  updateEvaluation,
  submitEvaluation,
  validateEvaluationRH,
  rejectEvaluationRH,
  generateEvaluationPDF,
  deleteEvaluation
};
