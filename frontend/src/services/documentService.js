/**
 * Service API: Documents
 * Communication avec l'API backend pour les documents
 */

import api from './api';

/**
 * Récupère tous les documents
 * @param {Object} params - Paramètres de requête
 */
export const getDocuments = async (params = {}) => {
  const response = await api.get('/documents', { params });
  return response.data;
};

/**
 * Récupère un document par ID
 * @param {number} id - ID du document
 */
export const getDocument = async (id) => {
  const response = await api.get(`/documents/${id}`);
  return response.data;
};

/**
 * Génère l'attestation de stage
 * @param {number} stageId - ID du stage
 */
export const generateAttestation = async (stageId) => {
  const response = await api.post(`/documents/attestation/${stageId}`);
  return response.data;
};

/**
 * Télécharge un document physique
 * @param {number} docId - ID du document
 * @param {string} fileName - Nom suggéré
 */
export const downloadDocument = async (docId, fileName) => {
  const response = await api.get(`/documents/${docId}/download`, {
    responseType: 'blob'
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName || `document_${docId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Génère le rapport d'évaluation technique
 * @param {number} stageId - ID du stage
 */
export const generateEvaluationReport = async (stageId) => {
  const response = await api.post(`/documents/evaluation/${stageId}`);
  return response.data;
};

/**
 * Génère la feuille de présence mensuelle
 * @param {number} stageId - ID du stage
 * @param {number} mois - Mois (1-12)
 * @param {number} annee - Année
 */
export const generatePresenceSheet = async (stageId, mois, annee) => {
  const response = await api.post(`/documents/presence/${stageId}`, { mois, annee });
  return response.data;
};

/**
 * Supprime un document
 * @param {number} id - ID du document
 */
export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};

export default {
  getDocuments,
  getDocument,
  generateAttestation,
  generatePresenceSheet,
  downloadDocument,
  deleteDocument
};
