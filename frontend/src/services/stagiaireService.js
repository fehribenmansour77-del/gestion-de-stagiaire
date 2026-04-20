/**
 * Service API: Gestion des Stagiaires
 * Communication avec l'API backend pour les stagiaires
 */

import api from './api';

/**
 * Récupère la liste des stagiaires avec pagination et filtres
 * @param {Object} params - Paramètres de requête
 */
export const getStagiaires = async (params = {}) => {
  const response = await api.get('/stagiaires', { params });
  return response.data;
};

/**
 * Récupère un stagiaire par son ID
 * @param {number} id - ID du stagiaire
 */
export const getStagiaireById = async (id) => {
  const response = await api.get(`/stagiaires/${id}`);
  return response.data.data;
};

/**
 * Crée un nouveau stagiaire
 * @param {Object} data - Données du stagiaire
 */
export const createStagiaire = async (data) => {
  const response = await api.post('/stagiaires', data);
  return response.data.data;
};

/**
 * Met à jour un stagiaire existant
 * @param {number} id - ID du stagiaire
 * @param {Object} data - Données à mettre à jour
 */
export const updateStagiaire = async (id, data) => {
  const response = await api.put(`/stagiaires/${id}`, data);
  return response.data.data;
};

/**
 * Archive un stagiaire
 * @param {number} id - ID du stagiaire
 * @param {string} raison - Raison de l'archivage
 */
export const archiveStagiaire = async (id, raison = '') => {
  const response = await api.delete(`/stagiaires/${id}`, { data: { raison } });
  return response.data;
};

/**
 * Marque un stage comme terminé
 * @param {number} id - ID du stagiaire
 */
export const terminerStagiaire = async (id) => {
  const response = await api.post(`/stagiaires/${id}/terminer`);
  return response.data.data;
};

/**
 * Réactive un stagiaire archivé
 * @param {number} id - ID du stagiaire
 */
export const reactiverStagiaire = async (id) => {
  const response = await api.post(`/stagiaires/${id}/reactiver`);
  return response.data.data;
};

/**
 * Récupère la liste des stagiaires archivés
 * @param {Object} params - Paramètres de requête
 */
export const getArchives = async (params = {}) => {
  const response = await api.get('/stagiaires/archives', { params });
  return response.data;
};

export default {
  getStagiaires,
  getStagiaireById,
  createStagiaire,
  updateStagiaire,
  archiveStagiaire,
  terminerStagiaire,
  reactiverStagiaire,
  getArchives
};
