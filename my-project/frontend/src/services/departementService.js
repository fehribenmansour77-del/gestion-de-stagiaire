/**
 * Service API: Gestion des Départements
 * Communication avec l'API backend pour les départements
 */

import api from './api';

/**
 * Récupère la liste des départements
 * @param {string} entity - Filtrer par entité (GIAS, CSM, SHARED)
 */
export const getDepartements = async (entity = null) => {
  const params = entity ? { entity } : {};
  const response = await api.get('/departements', { params });
  return response.data.data;
};

/**
 * Récupère un département par son ID avec tous les détails
 * @param {number} id - ID du département
 */
export const getDepartementById = async (id) => {
  const response = await api.get(`/departements/${id}`);
  return response.data.data;
};

/**
 * Crée un nouveau département
 * @param {Object} data - Données du département
 */
export const createDepartement = async (data) => {
  const response = await api.post('/departements', data);
  return response.data.data;
};

/**
 * Met à jour un département existant
 * @param {number} id - ID du département
 * @param {Object} data - Données à mettre à jour
 */
export const updateDepartement = async (id, data) => {
  const response = await api.put(`/departements/${id}`, data);
  return response.data.data;
};

/**
 * Supprime (désactive) un département
 * @param {number} id - ID du département
 */
export const deleteDepartement = async (id) => {
  const response = await api.delete(`/departements/${id}`);
  return response.data;
};

/**
 * Récupère la hiérarchie d'un département
 * @param {number} id - ID du département
 */
export const getDepartementHierarchy = async (id) => {
  const response = await api.get(`/departements/${id}/hierarchy`);
  return response.data.data;
};

/**
 * Récupère l'arbre complet des départements pour l'organigramme
 * @param {string} entity - Filtrer par entité (GIAS, CSM, SHARED)
 */
export const getDepartementsTree = async (entity = null) => {
  const params = entity ? { entity } : {};
  const response = await api.get('/departements/tree', { params });
  return response.data.data;
};

/**
 * Récupère l'arbre des départements GIAS + SHARED pour l'organigramme
 */
export const getOrgChartData = async () => {
  // Pour GIAS: récupérer GIAS et SHARED
  const giasTree = await getDepartementsTree('GIAS');
  return giasTree;
};

/**
 * Récupère les tuteurs d'un département avec leur capacité
 * @param {number} departementId - ID du département
 */
export const getTuteursByDepartement = async (departementId) => {
  const response = await api.get(`/departements/${departementId}/tuteurs`);
  return response.data.data;
};

/**
 * Affecte un stagiaire à un tuteur
 * @param {number} tuteurId - ID du tuteur
 * @param {number} stagiaireId - ID du stagiaire
 */
export const assignTraineeToTutor = async (tuteurId, stagiaireId) => {
  const response = await api.post('/tuteurs/affecter', { tuteurId, stagiaireId });
  return response.data.data;
};

/**
 * Vérifie la capacité d'un tuteur
 * @param {number} tuteurId - ID du tuteur
 */
export const checkTutorCapacity = async (tuteurId) => {
  const response = await api.get(`/tuteurs/${tuteurId}/capacity`);
  return response.data.data;
};

export default {
  getDepartements,
  getDepartementById,
  createDepartement,
  updateDepartement,
  deleteDepartement,
  getDepartementHierarchy,
  getDepartementsTree,
  getOrgChartData,
  getTuteursByDepartement,
  assignTraineeToTutor,
  checkTutorCapacity
};
