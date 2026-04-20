import React, { useState, useEffect, useCallback } from 'react';
import searchService from '../services/searchService';

export default function SearchFilters({ onSearch, departments = [], tutors = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    departement_id: '',
    entity: '',
    statut: '',
    etablissement: '',
    niveau_etude: '',
    tuteur_id: '',
    periode: {
      debut: '',
      fin: ''
    },
    taux_presence: {
      min: '',
      max: ''
    }
  });
  const [sort, setSort] = useState({
    field: 'nom',
    direction: 'ASC'
  });
  const [page, setPage] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search for suggestions
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const result = await searchService.getSearchSuggestions(searchQuery);
        setSuggestions(result.data || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = useCallback(() => {
    // Clean filters (remove empty values)
    const cleanedFilters = {};
    Object.keys(filters).forEach(key => {
      if (key === 'periode' || key === 'taux_presence') {
        const subObj = {};
        if (filters[key].debut) subObj.debut = filters[key].debut;
        if (filters[key].fin) subObj.fin = filters[key].fin;
        if (filters[key].min) subObj.min = parseFloat(filters[key].min);
        if (filters[key].max) subObj.max = parseFloat(filters[key].max);
        if (Object.keys(subObj).length > 0) {
          cleanedFilters[key] = subObj;
        }
      } else if (filters[key]) {
        cleanedFilters[key] = filters[key];
      }
    });

    onSearch({
      q: searchQuery,
      filters: cleanedFilters,
      sort,
      page,
      limit: 20
    });
  }, [searchQuery, filters, sort, page, onSearch]);

  // Initial search
  useEffect(() => {
    handleSearch();
  }, []);

  const handleFilterChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFilters(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFilters(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.display);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      departement_id: '',
      entity: '',
      statut: '',
      etablissement: '',
      niveau_etude: '',
      tuteur_id: '',
      periode: { debut: '', fin: '' },
      taux_presence: { min: '', max: '' }
    });
    setSort({ field: 'nom', direction: 'ASC' });
    setPage(1);
    handleSearch();
  };

  return (
    <div className="search-filters-container">
      {/* Search Bar */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="search-input"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map(s => (
                <li 
                  key={s.id} 
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s.display} <span className="suggestion-email">{s.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className="btn btn-primary" onClick={handleSearch}>
          🔍 Rechercher
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Département:</label>
            <select
              value={filters.departement_id}
              onChange={(e) => handleFilterChange('departement_id', e.target.value)}
            >
              <option value="">Tous</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.nom}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Entité:</label>
            <select
              value={filters.entity}
              onChange={(e) => handleFilterChange('entity', e.target.value)}
            >
              <option value="">Toutes</option>
              <option value="GIAS">GIAS Industries</option>
              <option value="CSM">CSM GIAS</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Statut:</label>
            <select
              value={filters.statut}
              onChange={(e) => handleFilterChange('statut', e.target.value)}
            >
              <option value="">Tous</option>
              <option value="actif">Actif</option>
              <option value="termine">Terminé</option>
              <option value="archive">Archivé</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Établissement:</label>
            <input
              type="text"
              placeholder="Université, école..."
              value={filters.etablissement}
              onChange={(e) => handleFilterChange('etablissement', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Niveau d'études:</label>
            <select
              value={filters.niveau_etude}
              onChange={(e) => handleFilterChange('niveau_etude', e.target.value)}
            >
              <option value="">Tous</option>
              <option value="Bac">Bac</option>
              <option value="Bac+1">Bac+1</option>
              <option value="Bac+2">Bac+2</option>
              <option value="Bac+3">Licence (Bac+3)</option>
              <option value="Bac+4">Master 1 (Bac+4)</option>
              <option value="Bac+5">Master 2 (Bac+5)</option>
              <option value="Doctorat">Doctorat</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Tuteur:</label>
            <select
              value={filters.tuteur_id}
              onChange={(e) => handleFilterChange('tuteur_id', e.target.value)}
            >
              <option value="">Tous</option>
              {tutors.map(t => (
                <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Période - Début:</label>
            <input
              type="date"
              value={filters.periode.debut}
              onChange={(e) => handleFilterChange('periode.debut', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Période - Fin:</label>
            <input
              type="date"
              value={filters.periode.fin}
              onChange={(e) => handleFilterChange('periode.fin', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Taux présence - Min %:</label>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="0"
              value={filters.taux_presence.min}
              onChange={(e) => handleFilterChange('taux_presence.min', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Taux présence - Max %:</label>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="100"
              value={filters.taux_presence.max}
              onChange={(e) => handleFilterChange('taux_presence.max', e.target.value)}
            />
          </div>
        </div>

        {/* Sort Options */}
        <div className="sort-options">
          <div className="filter-group">
            <label>Trier par:</label>
            <select
              value={sort.field}
              onChange={(e) => setSort(prev => ({ ...prev, field: e.target.value }))}
            >
              <option value="nom">Nom</option>
              <option value="date_demarrage">Date de démarrage</option>
              <option value="taux_presence">Taux de présence</option>
              <option value="note_moyenne">Note moyenne</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Ordre:</label>
            <select
              value={sort.direction}
              onChange={(e) => setSort(prev => ({ ...prev, direction: e.target.value }))}
            >
              <option value="ASC">Croissant</option>
              <option value="DESC">Décroissant</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="filter-actions">
          <button className="btn btn-secondary" onClick={clearFilters}>
            Réinitialiser
          </button>
          <button className="btn btn-primary" onClick={handleSearch}>
            Appliquer les filtres
          </button>
        </div>
      </div>
    </div>
  );
}
