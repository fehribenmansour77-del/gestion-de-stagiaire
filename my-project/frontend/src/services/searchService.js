/**
 * Service API: Recherche et Filtres Avancés
 */

import api from './api';

/**
 * Search trainees with filters
 * @param {Object} params - Search parameters
 * @param {string} params.q - Text search query
 * @param {Object} params.filters - Filter object
 * @param {Object} params.sort - Sort options { field, direction }
 * @param {number} params.page - Page number
 * @param {number} params.limit - Results per page
 */
export const searchStagiaires = async (params = {}) => {
  const { q, filters, sort, page, limit } = params;
  
  const queryParams = new URLSearchParams();
  
  if (q) queryParams.append('q', q);
  if (filters) queryParams.append('filters', JSON.stringify(filters));
  if (sort) queryParams.append('sort', JSON.stringify(sort));
  if (page) queryParams.append('page', page.toString());
  if (limit) queryParams.append('limit', limit.toString());
  
  const response = await api.get(`/stagiaires/search?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get search suggestions (autocomplete)
 * @param {string} term - Search term (min 2 characters)
 */
export const getSearchSuggestions = async (term) => {
  const response = await api.get(`/stagiaires/suggestions?term=${encodeURIComponent(term)}`);
  return response.data;
};

export default {
  searchStagiaires,
  getSearchSuggestions
};
