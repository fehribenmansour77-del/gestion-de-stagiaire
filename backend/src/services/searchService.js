/**
 * Search Service - Recherche et Filtres Avancés
 * 
 * Provides full-text search and multi-filter capabilities for trainees
 */

const { Op } = require('sequelize');
const db = require('../config/database');
const { Stagiaire, Utilisateur, Departement, Convention, Presence, Evaluation } = require('../models');

class SearchService {
  
  /**
   * Search and filter trainees with pagination and sorting
   */
  async searchStagiaires(params, user) {
    const {
      q,                    // Text search query
      filters = {},         // Filter object
      sort = {},            // Sort options
      page = 1,             // Page number
      limit = 20            // Results per page (max 100)
    } = params;

    // Validate and normalize parameters
    const normalizedPage = Math.max(1, parseInt(page) || 1);
    const normalizedLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (normalizedPage - 1) * normalizedLimit;

    // Build where clause
    const where = this.buildWhereClause(filters, user);
    
    // Build text search condition
    let textSearchCondition = null;
    if (q && q.trim()) {
      const searchTerm = q.trim().substring(0, 100);
      // Use LIKE for text search (MySQL Full-Text would be better in production)
      textSearchCondition = {
        [Op.or]: [
          { nom: { [Op.like]: `%${searchTerm}%` } },
          { prenom: { [Op.like]: `%${searchTerm}%` } },
          { email: { [Op.like]: `%${searchTerm}%` } }
        ]
      };
    }

    // Combine conditions
    const finalWhere = textSearchCondition 
      ? { [Op.and]: [where, textSearchCondition] }
      : where;

    // Build sort options
    const sortField = sort.field || 'nom';
    const sortDirection = sort.direction || 'ASC';
    const validSortFields = ['nom', 'date_demarrage', 'taux_presence', 'note_moyenne'];
    
    const order = validSortFields.includes(sortField)
      ? [[sortField, sortDirection]]
      : [['nom', 'ASC']];

    try {
      // Execute query with pagination
      const { count, rows: stagingaires } = await Stagiaire.findAndCountAll({
        where: finalWhere,
        include: [
          {
            model: Departement,
            as: 'departement',
            attributes: ['id', 'nom']
          },
          {
            model: Utilisateur,
            as: 'tuteur',
            attributes: ['id', 'nom', 'prenom']
          }
        ],
        order,
        limit: normalizedLimit,
        offset,
        distinct: true
      });

      // Calculate presence rate and average note for each trainee
      const results = await Promise.all(stagingaires.map(async (stagiaire) => {
        const presences = await Presence.findAll({
          where: { stagiaire_id: stagiaire.id }
        });
        
        const evaluations = await Evaluation.findAll({
          where: { stagiaire_id: stagiaire.id }
        });

        let tauxPresence = 0;
        if (presences.length > 0) {
          const presentes = presences.filter(p => p.statut === 'present').length;
          tauxPresence = (presentes / presences.length) * 100;
        }

        let noteMoyenne = 0;
        if (evaluations.length > 0) {
          const totalNotes = evaluations.reduce((sum, e) => sum + (e.note_technique + e.note_comportementale) / 2, 0);
          noteMoyenne = totalNotes / evaluations.length;
        }

        return {
          id: stagiaire.id,
          nom: stagiaire.nom,
          prenom: stagiaire.prenom,
          email: stagiaire.email,
          etablissement: stagiaire.etablissement,
          niveau_etude: stagiaire.niveau_etude,
          filiere: stagiaire.filiere,
          departement_id: stagiaire.departement_id,
          departement_nom: stagiaire.departement?.nom || null,
          entity: stagiaire.entity,
          statut: stagiaire.statut,
          date_demarrage: stagiaire.date_demarrage,
          date_fin: stagiaire.date_fin,
          taux_presence: Math.round(tauxPresence * 100) / 100,
          note_moyenne: Math.round(noteMoyenne * 100) / 100,
          tuteur: stagiaire.tuteur ? {
            id: stagiaire.tuteur.id,
            nom: stagiaire.tuteur.nom,
            prenom: stagiaire.tuteur.prenom
          } : null
        };
      }));

      return {
        stagingaires: results,
        pagination: {
          page: normalizedPage,
          limit: normalizedLimit,
          total: count,
          totalPages: Math.ceil(count / normalizedLimit)
        }
      };
    } catch (error) {
      console.error('SearchService Error:', error);
      throw error;
    }
  }

  /**
   * Build WHERE clause based on filters and user role
   */
  buildWhereClause(filters, user) {
    const conditions = {};

    // RBAC: Tuteur can only see their assigned trainees
    if (user.role === 'tuteur') {
      conditions.utilisateur_id = user.id;
    }

    // Apply filters
    if (filters.departement_id) {
      conditions.departement_id = filters.departement_id;
    }

    if (filters.entity) {
      conditions.entity = filters.entity;
    }

    if (filters.statut) {
      conditions.statut = filters.statut;
    }

    if (filters.etablissement) {
      conditions.etablissement = { [Op.like]: `%${filters.etablissement}%` };
    }

    if (filters.niveau_etude) {
      conditions.niveau_etude = filters.niveau_etude;
    }

    if (filters.tuteur_id) {
      conditions.utilisateur_id = filters.tuteur_id;
    }

    // Period filter
    if (filters.periode) {
      if (filters.periode.debut) {
        conditions.date_demarrage = {
          ...conditions.date_demarrage,
          [Op.gte]: filters.periode.debut
        };
      }
      if (filters.periode.fin) {
        conditions.date_fin = {
          ...conditions.date_fin,
          [Op.lte]: filters.periode.fin
        };
      }
    }

    // Presence rate filter
    // Note: This is applied in memory after fetching since it's calculated
    if (filters.taux_presence) {
      conditions.taux_presence = {};
      if (filters.taux_presence.min !== undefined) {
        conditions.taux_presence[Op.gte] = filters.taux_presence.min;
      }
      if (filters.taux_presence.max !== undefined) {
        conditions.taux_presence[Op.lte] = filters.taux_presence.max;
      }
    }

    return conditions;
  }

  /**
   * Get search suggestions (autocomplete)
   */
  async getSuggestions(term, user) {
    if (!term || term.length < 2) {
      return [];
    }

    const where = this.buildWhereClause({}, user);
    where[Op.or] = [
      { nom: { [Op.like]: `${term}%` } },
      { prenom: { [Op.like]: `${term}%` } }
    ];

    const suggestions = await Stagiaire.findAll({
      where,
      attributes: ['id', 'nom', 'prenom', 'email'],
      limit: 10
    });

    return suggestions.map(s => ({
      id: s.id,
      nom: s.nom,
      prenom: s.prenom,
      email: s.email,
      display: `${s.prenom} ${s.nom}`
    }));
  }
}

module.exports = new SearchService();
