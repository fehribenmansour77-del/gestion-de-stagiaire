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

export const downloadDocument = (docId, fileName) => {
  const token = localStorage.getItem('token');
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const downloadUrl = `${baseURL}/documents/${docId}/download?token=${token}`;
  
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', fileName || `document_${docId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
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
