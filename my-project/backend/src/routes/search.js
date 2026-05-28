/**
 * Search Routes - API de Recherche et Filtres Avancés
 * 
 * GET /api/stagiaires/search - Recherche et filtre les stagiaires
 * GET /api/stagiaires/suggestions - Autocomplétion
 */

const express = require('express');
const router = express.Router();
const searchService = require('../services/searchService');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * GET /api/stagiaires/search
 * 
 * Recherche et filtre les stagiaires selon critères multiples
 * 
 * Query Parameters:
 * - q: Recherche textuelle (nom, prénom)
 * - filters: JSON string avec critères de filtre
 * - sort.field: Champ de tri (nom, date_demarrage, taux_presence, note_moyenne)
 * - sort.direction: Direction (ASC, DESC)
 * - page: Numéro de page
 * - limit: Résultats par page (max: 100)
 */
router.get('/search', authenticate, authorize(['admin_rh', 'super_admin', 'chef_departement', 'tuteur']), async (req, res) => {
  try {
    const { q, filters, sort, page, limit } = req.query;

    // Parse filters if provided as string
    let parsedFilters = {};
    if (filters) {
      try {
        parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid filters format',
            details: ['filters must be a valid JSON object']
          }
        });
      }
    }

    // Parse sort if provided as string
    let parsedSort = {};
    if (sort) {
      try {
        parsedSort = typeof sort === 'string' ? JSON.parse(sort) : sort;
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid sort format',
            details: ['sort must be a valid JSON object']
          }
        });
      }
    }

    // Validate sort field
    const validSortFields = ['nom', 'date_demarrage', 'taux_presence', 'note_moyenne'];
    if (parsedSort.field && !validSortFields.includes(parsedSort.field)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid sort field',
          details: [`sort.field must be one of: ${validSortFields.join(', ')}`]
        }
      });
    }

    // Validate sort direction
    if (parsedSort.direction && !['ASC', 'DESC'].includes(parsedSort.direction.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid sort direction',
          details: ['sort.direction must be ASC or DESC']
        }
      });
    }

    // Execute search
    const result = await searchService.searchStagiaires({
      q,
      filters: parsedFilters,
      sort: {
        field: parsedSort.field,
        direction: parsedSort.direction?.toUpperCase()
      },
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    }, req.user);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la recherche',
        details: [error.message]
      }
    });
  }
});

/**
 * GET /api/stagiaires/suggestions
 * 
 * Autocomplétion pour la recherche de stagiaires
 * 
 * Query Parameters:
 * - term: Terme de recherche (min 2 caractères)
 */
router.get('/suggestions', authenticate, authorize(['admin_rh', 'super_admin', 'chef_departement', 'tuteur']), async (req, res) => {
  try {
    const { term } = req.query;

    if (!term || term.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Term too short',
          details: ['Search term must be at least 2 characters']
        }
      });
    }

    const suggestions = await searchService.getSuggestions(term, req.user);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Suggestions Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la recherche de suggestions',
        details: [error.message]
      }
    });
  }
});

module.exports = router;
