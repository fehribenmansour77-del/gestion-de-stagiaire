/**
 * Service API: Dashboard
 * Communication avec l'API backend pour les KPIs
 */

import api from './api';

/**
 * Récupère les KPIs
 */
export const getKPIs = async (params = {}) => {
  const response = await api.get('/dashboard/kpis', { params });
  return response.data;
};

/**
 * Récupère l'évolution mensuelle
 */
export const getEvolution = async (mois = 12) => {
  const response = await api.get('/dashboard/evolution', { params: { mois } });
  return response.data;
};

/**
 * Récupère la répartition par département
 */
export const getDepartementsStats = async () => {
  const response = await api.get('/dashboard/departements');
  return response.data;
};

/**
 * Récupère l'activité récente
 */
export const getActivite = async (limit = 10) => {
  const response = await api.get('/dashboard/activite', { params: { limit } });
  return response.data;
};

export const exportExcel = (type = 'stagiaires') => {
  const token = localStorage.getItem('token');
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const downloadUrl = `${baseURL}/dashboard/export/excel?type=${type}&token=${token}`;
  
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `export_${type}_${new Date().toISOString().split('T')[0]}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/**
 * Exporte en PDF
 */
export const exportPDF = (type = 'rapport') => {
  const token = localStorage.getItem('token');
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const downloadUrl = `${baseURL}/dashboard/export/pdf?type=${type}&token=${token}`;
  
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `rapport_${new Date().toISOString().split('T')[0]}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export default {
  getKPIs,
  getEvolution,
  getDepartementsStats,
  getActivite,
  exportExcel,
  exportPDF
};
