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

/**
 * Exporte en Excel
 */
export const exportExcel = async (type = 'stagiaires') => {
  const response = await api.post('/dashboard/export/excel', { type }, {
    responseType: 'blob'
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `export_${type}_${new Date().toISOString().split('T')[0]}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/**
 * Exporte en PDF
 */
export const exportPDF = async (type = 'rapport') => {
  const response = await api.post('/dashboard/export/pdf', { type }, {
    responseType: 'blob'
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
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
