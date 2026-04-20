/**
 * Service API: Présences
 * Communication avec l'API backend pour les présences
 */

import api from './api';

/**
 * Enregistre une présence
 * @param {Object} data - Données de la présence
 */
export const createPresence = async (data) => {
  const response = await api.post('/presences', data);
  return response.data;
};

/**
 * Auto-pointage par le stagière
 * @param {number} stageId - ID du stage
 */
export const autoCheckIn = async (stageId) => {
  const response = await api.post('/presences/auto', { stage_id: stageId });
  return response.data;
};

/**
 * Valide une présence auto-pointée
 * @param {number} presenceId - ID de la présence
 */
export const validatePresence = async (presenceId) => {
  const response = await api.post('/presences/validate', { presence_id: presenceId });
  return response.data;
};

/**
 * Liste des présences
 * @param {Object} params - Paramètres de requête
 */
export const getPresences = async (params = {}) => {
  const response = await api.get('/presences', { params });
  return response.data;
};

/**
 * Historique des présences d'un stagière
 * @param {number} stageId - ID du stage
 * @param {number} mois - Mois (1-12)
 * @param {number} annee - Année
 */
export const getStagiairePresences = async (stageId, mois, annee) => {
  const response = await api.get(`/presences/stagiaire/${stageId}`, {
    params: { mois, annee }
  });
  return response.data;
};

/**
 * Importe des présences depuis Excel
 * @param {FormData} formData - Données du formulaire avec fichier
 */
export const importPresences = async (formData) => {
  const response = await api.post('/presences/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export default {
  createPresence,
  autoCheckIn,
  validatePresence,
  getPresences,
  getStagiairePresences,
  importPresences
};
