/**
 * Page: Registre des Stagiaires — GIAS Premium V6
 * Administration centralisée des effectifs et suivi des parcours.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import stagiaireService from '../services/stagiaireService';
import departementService from '../services/departementService';
import { toast } from '../store/useToastStore';
import StagiaireDetailPanel from '../components/StagiaireDetailPanel';
import { 
  Users, Plus, Search, Edit2, Archive, CheckCircle2, 
  MoreHorizontal, Calendar, X, ChevronLeft, ChevronRight, 
  Loader2, RefreshCw, User, MessageSquare, FilterX,
  Target, Award, ShieldCheck, Zap, ArrowRight, Mail,
  GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ── Global Styles ── */
const injectStyles = `
@keyframes stagSlideIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.stag-glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.4); }
.stag-row { transition: all 0.3s; cursor: pointer; border-bottom: 1px solid #F1F5F9; }
.stag-row:hover { background: #F8FAFC !important; transform: scale(1.002); }
.stag-form-group { margin-bottom: 24px; }
.stag-label { font-size: 10px; fontWeight: 900; color: #001D3D; textTransform: uppercase; marginBottom: 10px; display: block; letterSpacing: 0.1em; }
.stag-input { width: 100%; padding: 14px 16px; background: white; border: 1.5px solid #E2E8F0; borderRadius: 16px; fontSize: 14px; fontWeight: 600; outline: none; transition: 0.3s; }
.stag-input:focus { border-color: #001D3D; box-shadow: 0 0 0 4px rgba(0,29,61,0.05); }
`;

const Stagiaires = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stagiaires, setStagiaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ search: '', departement_id: '', entity: '', statut: 'actif' });
  const [departements, setDepartements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStagiaire, setEditingStagiaire] = useState(null);
  const [selectedStagiaire, setSelectedStagiaire] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '', nom: '', prenom: '', telephone: '', etablissement: '', filiere: '',
    niveau_etude: '', annee_en_cours: '', departement_id: '', tuteur_id: '',
    date_demarrage: '', date_fin: '', entity: 'GIAS'
  });

  const isRH = ['admin_rh', 'super_admin'].includes(user?.role);

  useEffect(() => {
    const fetchDepartements = async () => {
      try {
        const data = await departementService.getDepartements();
        setDepartements(data || []);
      } catch (err) { console.error(err); }
    };
    fetchDepartements();
  }, []);

  useEffect(() => { fetchStagiaires(); }, [pagination.page, filters]);

  const fetchStagiaires = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit, ...filters };
      const result = await stagiaireService.getStagiaires(params);
      setStagiaires(result.data || []);
      setPagination(prev => ({ ...prev, total: result.pagination.total, pages: result.pagination.pages }));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const openCreateModal = () => {
    setEditingStagiaire(null);
    setFormData({
      email: '', nom: '', prenom: '', telephone: '', etablissement: '', filiere: '',
      niveau_etude: '', annee_en_cours: '', departement_id: '', tuteur_id: '',
      date_demarrage: '', date_fin: '', entity: 'GIAS'
    });
    setShowModal(true);
  };

  const openEditModal = (stagiaire) => {
    setEditingStagiaire(stagiaire);
    setFormData({
      email: stagiaire.utilisateur?.email || '',
      nom: stagiaire.utilisateur?.nom || '',
      prenom: stagiaire.utilisateur?.prenom || '',
      telephone: stagiaire.utilisateur?.telephone || '',
      etablissement: stagiaire.etablissement || '',
      filiere: stagiaire.filiere || '',
      niveau_etude: stagiaire.niveau_etude || '',
      annee_en_cours: stagiaire.annee_en_cours || '',
      departement_id: stagiaire.departement_id || '',
      tuteur_id: stagiaire.tuteur_id || '',
      date_demarrage: stagiaire.date_demarrage?.split('T')[0] || '',
      date_fin: stagiaire.date_fin?.split('T')[0] || '',
      entity: stagiaire.entity || 'GIAS'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStagiaire) {
        await stagiaireService.updateStagiaire(editingStagiaire.id, formData);
        toast.success('Profil rectifié avec succès');
      } else {
        await stagiaireService.createStagiaire(formData);
        toast.success('Nouveau talent enrôlé');
      }
      setShowModal(false);
      fetchStagiaires();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur d\'enregistrement');
    }
  };

  const statusBadge = (statut) => {
    const s = {
      actif: { color: '#059669', label: 'Actif' },
      termine: { color: '#001D3D', label: 'Finalisé' },
      archive: { color: '#DC2626', label: 'Archivé' }
    }[statut] || { color: '#94A3B8', label: statut };
    
    return (
      <span style={{ padding: '6px 12px', background: `${s.color}10`, color: s.color, borderRadius: 10, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', border: `1px solid ${s.color}20` }}>
        {s.label}
      </span>
    );
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 100 }}>
       <style>{injectStyles}</style>

       <div style={{ maxWidth: 1440, margin: '0 auto', padding: '60px 20px' }}>
          
          {/* ── Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60, flexWrap: 'wrap', gap: 40 }}>
             <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <Users size={18} style={{ color: '#007F82' }} />
                  <span style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Capital Humain · GIAS Industries</span>
                </div>
                <h1 style={{ fontSize: 44, fontWeight: 900, color: '#001D3D', letterSpacing: '-0.02em', margin: 0 }}>Registre des <span style={{ color: '#007F82' }}>Stagiaires</span></h1>
                <p style={{ color: '#64748B', fontSize: 16, marginTop: 12, fontWeight: 500, maxWidth: 600 }}>Administration centrale et suivi des parcours académiques au sein du groupe.</p>
             </div>
             
             {isRH && (
                <button onClick={openCreateModal} style={{ padding: '18px 32px', background: '#001D3D', color: 'white', borderRadius: 20, border: 'none', fontWeight: 900, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                   <Plus size={18} style={{ color: '#D4AF37' }} /> Nouveau Talent
                </button>
             )}
          </div>

          {/* ── Filter Bar ── */}
          <div className="stag-glass" style={{ padding: '24px 32px', borderRadius: 28, marginBottom: 40, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
             <div style={{ flex: 1, minWidth: 300 }}>
                <div style={{ position: 'relative' }}>
                   <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                   <input 
                     type="text" 
                     placeholder="Filtrer par nom, email..." 
                     value={filters.search}
                     onChange={e => setFilters({...filters, search: e.target.value})}
                     style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 14, fontWeight: 600 }}
                   />
                </div>
             </div>

             <select 
               name="departement_id" 
               value={filters.departement_id} 
               onChange={handleFilterChange} 
               style={{ width: 220, padding: '14px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 14, fontWeight: 600 }}
             >
                <option value="">Tous les départements</option>
                {departements.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
             </select>

             <select 
               name="entity" 
               value={filters.entity} 
               onChange={handleFilterChange} 
               style={{ width: 160, padding: '14px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 14, fontWeight: 600 }}
             >
                <option value="">Toutes filiales</option>
                <option value="GIAS">GIAS Industries</option>
                <option value="CSM">CSM GIAS</option>
             </select>

             <select 
               name="statut" 
               value={filters.statut} 
               onChange={handleFilterChange} 
               style={{ width: 140, padding: '14px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 14, fontWeight: 600 }}
             >
                <option value="actif">Actifs</option>
                <option value="termine">Terminés</option>
                <option value="archive">Archivés</option>
             </select>

             <button 
                onClick={() => setFilters({ search:'', departement_id:'', entity:'', statut:'actif' })}
                style={{ width: 50, height: 50, background: '#F1F5F9', border: 'none', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
             >
                <FilterX size={20} style={{ color: '#001D3D' }} />
             </button>
          </div>

          {/* ── Table Area ── */}
          <div className="stag-glass" style={{ borderRadius: 32, padding: 0, overflow: 'hidden' }}>
             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                   <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '24px 40px', textAlign: 'left', fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Profil Identitaire</th>
                      <th style={{ padding: '24px 20px', textAlign: 'left', fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Affectation</th>
                      <th style={{ padding: '24px 20px', textAlign: 'left', fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mentorat</th>
                      <th style={{ padding: '24px 20px', textAlign: 'left', fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Calendrier</th>
                      <th style={{ padding: '24px 20px', textAlign: 'left', fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Statut</th>
                      <th style={{ padding: '24px 40px', textAlign: 'right' }}></th>
                   </tr>
                </thead>
                <tbody>
                   {loading ? (
                      <tr>
                         <td colSpan="6" style={{ padding: 100, textAlign: 'center' }}>
                            <RefreshCw size={40} className="animate-spin" style={{ color: '#D4AF37', margin: '0 auto 20px' }} />
                            <p style={{ fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Synchronisation de l'annuaire...</p>
                         </td>
                      </tr>
                   ) : stagiaires.length === 0 ? (
                      <tr>
                         <td colSpan="6" style={{ padding: 100, textAlign: 'center' }}>
                            <Users size={64} style={{ color: '#E2E8F0', marginBottom: 20 }} />
                            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#001D3D', margin: '0 0 8px' }}>Aucun stagiaire trouvé</h3>
                         </td>
                      </tr>
                   ) : stagiaires.map(stag => (
                      <tr 
                        key={stag.id} 
                        onClick={() => setSelectedStagiaire(stag)}
                        className="stag-row"
                      >
                         <td style={{ padding: '24px 40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                               <div style={{ width: 44, height: 44, borderRadius: 14, background: '#001D3D', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 }}>
                                  {stag.utilisateur?.prenom?.charAt(0)}{stag.utilisateur?.nom?.charAt(0)}
                               </div>
                               <div>
                                  <p style={{ fontSize: 15, fontWeight: 900, color: '#001D3D', margin: 0 }}>{stag.utilisateur?.prenom} {stag.utilisateur?.nom}</p>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', marginTop: 4 }}>
                                     <GraduationCap size={12} /> {stag.etablissement}
                                  </div>
                               </div>
                            </div>
                         </td>
                         <td style={{ padding: '24px 20px' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#001D3D' }}>{stag.departement?.nom || '--'}</div>
                            <span style={{ fontSize: 9, fontWeight: 900, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stag.entity}</span>
                         </td>
                         <td style={{ padding: '24px 20px' }}>
                            {stag.tuteur ? (
                               <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#64748B' }}>
                                  <div style={{ width: 24, height: 24, borderRadius: 6, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={12} /></div>
                                  {stag.tuteur.prenom} {stag.tuteur.nom}
                               </div>
                            ) : <span style={{ fontSize: 11, color: '#E2E8F0', fontStyle: 'italic' }}>Non assigné</span>}
                         </td>
                         <td style={{ padding: '24px 20px' }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#001D3D', display: 'flex', alignItems: 'center', gap: 6 }}>
                               <Calendar size={12} style={{ color: '#D4AF37' }} />
                               <span>{new Date(stag.date_demarrage).toLocaleDateString()}</span>
                               <ChevronRight size={10} style={{ color: '#94A3B8' }} />
                               <span>{new Date(stag.date_fin).toLocaleDateString()}</span>
                            </div>
                         </td>
                         <td style={{ padding: '24px 20px' }}>{statusBadge(stag.statut)}</td>
                         <td style={{ padding: '24px 40px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }} onClick={e => e.stopPropagation()}>
                               <button onClick={() => navigate('/notifications')} style={{ width: 40, height: 40, background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#001D3D' }}><MessageSquare size={16}/></button>
                               {isRH && (
                                  <button onClick={() => openEditModal(stag)} style={{ width: 40, height: 40, background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#001D3D' }}><Edit2 size={16}/></button>
                               )}
                               <button onClick={() => setSelectedStagiaire(stag)} style={{ width: 40, height: 40, background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#001D3D' }}><MoreHorizontal size={16}/></button>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>

             {/* ── Pagination ── */}
             {pagination.pages > 1 && (
                <div style={{ padding: '24px 40px', background: 'white', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <p style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>Affichage de {stagiaires.length} talents actifs</p>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <button disabled={pagination.page === 1} onClick={() => setPagination({...pagination, page: pagination.page - 1})} style={{ width: 44, height: 44, background: '#F1F5F9', border: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeft size={20}/></button>
                      <span style={{ fontSize: 13, fontWeight: 900, color: '#001D3D' }}>{pagination.page} / {pagination.pages}</span>
                      <button disabled={pagination.page === pagination.pages} onClick={() => setPagination({...pagination, page: pagination.page + 1})} style={{ width: 44, height: 44, background: '#F1F5F9', border: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight size={20}/></button>
                   </div>
                </div>
             )}
          </div>
       </div>

       {/* ── Detail Panel ── */}
       {selectedStagiaire && (
          <StagiaireDetailPanel 
            stagiaire={selectedStagiaire} 
            onClose={() => setSelectedStagiaire(null)} 
            onEdit={openEditModal} 
            isRH={isRH} 
          />
       )}

       {/* ── Add/Edit Modal ── */}
       {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
             <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,29,61,0.4)', backdropFilter: 'blur(10px)' }} onClick={() => setShowModal(false)}></div>
             <div className="stag-glass" style={{ position: 'relative', width: '100%', maxWidth: 740, padding: 0, borderRadius: 40, overflow: 'hidden', border: 'none' }}>
                <div style={{ padding: '40px', background: '#001D3D', color: 'white' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                         <h3 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{editingStagiaire ? 'Rectification Dossier' : 'Enrôlement Talent'}</h3>
                         <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 8 }}>Base de Données RH GIAS</p>
                      </div>
                      <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><X size={28} /></button>
                   </div>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: 60, maxHeight: '70vh', overflowY: 'auto' }}>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                      <div className="stag-form-group">
                         <label className="stag-label">Prénom de l'étudiant *</label>
                         <input type="text" className="stag-input" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} required />
                      </div>
                      <div className="stag-form-group">
                         <label className="stag-label">Nom de famille *</label>
                         <input type="text" className="stag-input" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} required />
                      </div>
                      <div className="stag-form-group">
                         <label className="stag-label">Adresse Email *</label>
                         <input type="email" className="stag-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required disabled={!!editingStagiaire} />
                      </div>
                      <div className="stag-form-group">
                         <label className="stag-label">Contact Téléphonique</label>
                         <input type="text" className="stag-input" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} />
                      </div>
                      
                      <div style={{ gridColumn: 'span 2', padding: '24px 0', borderBottom: '1px solid #E2E8F0', marginBottom: 24 }}>
                         <h4 style={{ fontSize: 12, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Cursus Académique</h4>
                      </div>

                      <div className="stag-form-group" style={{ gridColumn: 'span 2' }}>
                         <label className="stag-label">Établissement / Université *</label>
                         <input type="text" className="stag-input" value={formData.etablissement} onChange={e => setFormData({...formData, etablissement: e.target.value})} required />
                      </div>
                      <div className="stag-form-group">
                         <label className="stag-label">Spécialité / Filière</label>
                         <input type="text" className="stag-input" value={formData.filiere} onChange={e => setFormData({...formData, filiere: e.target.value})} />
                      </div>
                      <div className="stag-form-group">
                         <label className="stag-label">Niveau d'études actuel</label>
                         <input type="text" className="stag-input" value={formData.niveau_etude} onChange={e => setFormData({...formData, niveau_etude: e.target.value})} />
                      </div>

                      <div style={{ gridColumn: 'span 2', padding: '24px 0', borderBottom: '1px solid #E2E8F0', marginBottom: 24 }}>
                         <h4 style={{ fontSize: 12, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Affectation Institutionnelle</h4>
                      </div>

                      <div className="stag-form-group">
                         <label className="stag-label">Filiale du Groupe</label>
                         <select className="stag-input" value={formData.entity} onChange={e => setFormData({...formData, entity: e.target.value})}>
                            <option value="GIAS">GIAS Industries</option>
                            <option value="CSM">CSM GIAS</option>
                         </select>
                      </div>
                      <div className="stag-form-group">
                         <label className="stag-label">Département d'Accueil *</label>
                         <select className="stag-input" value={formData.departement_id} onChange={e => setFormData({...formData, departement_id: e.target.value})} required>
                            <option value="">Sélectionnez un pôle...</option>
                            {departements.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                         </select>
                      </div>
                      <div className="stag-form-group">
                         <label className="stag-label">Date de démarrage *</label>
                         <input type="date" className="stag-input" value={formData.date_demarrage} onChange={e => setFormData({...formData, date_demarrage: e.target.value})} required />
                      </div>
                      <div className="stag-form-group">
                         <label className="stag-label">Date d'échéance *</label>
                         <input type="date" className="stag-input" value={formData.date_fin} onChange={e => setFormData({...formData, date_fin: e.target.value})} required />
                      </div>
                   </div>

                   <div style={{ marginTop: 40, paddingTop: 40, borderTop: '1px solid #E2E8F0', display: 'flex', gap: 16 }}>
                      <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '20px', background: '#F1F5F9', border: 'none', borderRadius: 20, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>Annuler</button>
                      <button type="submit" style={{ flex: 2, padding: '20px', background: '#001D3D', color: 'white', border: 'none', borderRadius: 20, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                         {editingStagiaire ? 'Appliquer les Rectifications' : 'Finaliser l\'inscription'} <Zap size={18} style={{ color: '#D4AF37' }} />
                      </button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};

export default Stagiaires;
