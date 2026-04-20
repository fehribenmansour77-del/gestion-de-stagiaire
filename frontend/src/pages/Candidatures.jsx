/**
 * Page: Pipeline de Recrutement — GIAS Premium V6
 * Gestion centralisée des candidatures et pilotage du processus de sélection.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import candidatureService from '../services/candidatureService';
import { 
  FileText, Search, Filter, Calendar, CheckCircle2, 
  XCircle, Clock, FileSearch, User, GraduationCap, 
  Briefcase, ExternalLink, ChevronRight, MoreVertical,
  X, AlertCircle, RefreshCw, Mail, Phone, ArrowRight,
  Inbox, Check, FileBadge, Loader2, Sparkles, Target,
  FilterX, ShieldCheck, Zap, Download, Send
} from 'lucide-react';
import { toast } from '../store/useToastStore';

/* ── Global Styles ── */
const injectStyles = `
@keyframes candSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.cand-glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.4); }
.cand-card { background: white; border-radius: 28px; border: 1px solid #E2E8F0; transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
.cand-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,29,61,0.08); border-color: #001D3D; }
.cand-row { transition: all 0.3s; border-radius: 16px; margin-bottom: 8px; }
.cand-row:hover { background: #F8FAFC !important; transform: scale(1.005); }
.cand-row.active { background: #F1F5F9 !important; border-left: 4px solid #D4AF37; }
`;

const Candidatures = () => {
  const navigate = useNavigate();
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidature, setSelectedCandidature] = useState(null);
  const [filters, setFilters] = useState({ statut: '', etablissement: '', date_debut: '', date_fin: '' });
  const [actionModal, setActionModal] = useState({ open: false, type: '', candidature: null });
  const [commentaire, setCommentaire] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchCandidatures(); }, [filters]);

  const fetchCandidatures = async () => {
    setLoading(true);
    try {
      const response = await candidatureService.getCandidatures(filters);
      setCandidatures(response.data || []);
    } catch (err) {
      toast.error('Erreur de synchronisation du pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleViewDetails = async (id) => {
    try {
      const data = await candidatureService.getCandidatureById(id);
      setSelectedCandidature(data);
    } catch (err) {
      toast.error('Impossible de charger le dossier');
    }
  };

  const handleAction = async () => {
    if (!actionModal.candidature) return;
    setActionLoading(true);
    try {
      const { id } = actionModal.candidature;
      switch (actionModal.type) {
        case 'accept': await candidatureService.acceptCandidature(id, { commentaire }); break;
        case 'reject': await candidatureService.rejectCandidature(id, commentaire); break;
        case 'waitlist': await candidatureService.waitlistCandidature(id, commentaire); break;
        case 'documents': await candidatureService.requestDocuments(id, commentaire); break;
        case 'message': await candidatureService.sendMessage(id, commentaire); break;
      }
      toast.success('Action validée avec succès');
      setActionModal({ open: false, type: '', candidature: null });
      setCommentaire('');
      fetchCandidatures();
      if (selectedCandidature?.id === id) {
        const updated = await candidatureService.getCandidatureById(id);
        setSelectedCandidature(updated);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur technique');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      en_attente: { color: '#D4AF37', label: 'En attente', icon: <Clock size={12} /> },
      en_cours: { color: '#001D3D', label: 'En revue', icon: <FileSearch size={12} /> },
      documents_manquants: { color: '#DC2626', label: 'Incomplet', icon: <AlertCircle size={12} /> },
      liste_attente: { color: '#64748B', label: 'Attente', icon: <Inbox size={12} /> },
      acceptee: { color: '#059669', label: 'Admis', icon: <Check size={12} /> },
      refusee: { color: '#DC2626', label: 'Refusé', icon: <XCircle size={12} /> },
      annulee: { color: '#94A3B8', label: 'Annulé', icon: <X size={12} /> }
    };
    const b = badges[statut] || { color: '#94A3B8', label: statut, icon: null };
    return (
      <span style={{ 
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', 
        background: `${b.color}10`, color: b.color, borderRadius: 12, fontSize: 10, fontWeight: 900, 
        textTransform: 'uppercase', letterSpacing: '0.05em', border: `1px solid ${b.color}20` 
      }}>
        {b.icon} {b.label}
      </span>
    );
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 100 }}>
       <style>{injectStyles}</style>

       <div style={{ maxWidth: 1400, margin: '0 auto', padding: '60px 20px' }}>
          
          {/* ── Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60, flexWrap: 'wrap', gap: 40 }}>
             <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <Target size={18} style={{ color: '#D4AF37' }} />
                  <span style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Pipeline Talents · GIAS Group</span>
                </div>
                <h1 style={{ fontSize: 44, fontWeight: 900, color: '#001D3D', letterSpacing: '-0.02em', margin: 0 }}>Gestion des <span style={{ color: '#D4AF37' }}>Candidatures</span></h1>
                <p style={{ color: '#64748B', fontSize: 16, marginTop: 12, fontWeight: 500, maxWidth: 600 }}>Processus de sélection et suivi des nouveaux dossiers entrants.</p>
             </div>
             
             <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ background: 'white', padding: '12px 24px', borderRadius: 20, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                   <p style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>Traités</p>
                   <p style={{ fontSize: 24, fontWeight: 900, color: '#001D3D', margin: 0 }}>{candidatures.length}</p>
                </div>
                <button onClick={fetchCandidatures} style={{ width: 52, height: 52, background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s' }}>
                   <RefreshCw size={20} className={loading ? "animate-spin" : ""} style={{ color: '#001D3D' }} />
                </button>
             </div>
          </div>

          {/* ── Filter Bar ── */}
          <div className="cand-glass" style={{ padding: '24px 32px', borderRadius: 28, marginBottom: 40, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
             <div style={{ flex: 1, minWidth: 280 }}>
                <label style={{ fontSize: 10, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', marginBottom: 10, display: 'block', letterSpacing: '0.1em' }}>Rechercher un établissement</label>
                <div style={{ position: 'relative' }}>
                   <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                   <input 
                     type="text" 
                     name="etablissement"
                     value={filters.etablissement}
                     onChange={handleFilterChange}
                     placeholder="Ex: ENSI, IHEC..." 
                     style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 14, fontWeight: 600 }}
                   />
                </div>
             </div>

             <div style={{ width: 220 }}>
                <label style={{ fontSize: 10, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', marginBottom: 10, display: 'block', letterSpacing: '0.1em' }}>État du dossier</label>
                <select 
                  name="statut" 
                  value={filters.statut} 
                  onChange={handleFilterChange} 
                  style={{ width: '100%', padding: '14px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 14, fontWeight: 600 }}
                >
                   <option value="">Tous les statuts</option>
                   <option value="en_attente">En attente</option>
                   <option value="en_cours">En revue</option>
                   <option value="acceptee">Acceptées</option>
                   <option value="refusee">Refusées</option>
                </select>
             </div>

             <div style={{ width: 360, display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                   <label style={{ fontSize: 10, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', marginBottom: 10, display: 'block', letterSpacing: '0.1em' }}>Période de debut</label>
                   <input type="date" name="date_debut" value={filters.date_debut} onChange={handleFilterChange} style={{ width: '100%', padding: '14px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 13, fontWeight: 600 }} />
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{ fontSize: 10, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', marginBottom: 10, display: 'block', letterSpacing: '0.1em' }}>Période de fin</label>
                   <input type="date" name="date_fin" value={filters.date_fin} onChange={handleFilterChange} style={{ width: '100%', padding: '14px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 13, fontWeight: 600 }} />
                </div>
             </div>

             <button 
                onClick={() => setFilters({ statut:'', etablissement:'', date_debut:'', date_fin:'' })}
                style={{ height: 50, width: 50, background: '#F1F5F9', border: 'none', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
             >
                <FilterX size={20} style={{ color: '#001D3D' }} />
             </button>
          </div>

          {/* ── Main Layout ── */}
          <div style={{ display: 'grid', gridTemplateColumns: selectedCandidature ? '1fr 450px' : '1fr', gap: 40, alignItems: 'start', transition: 'all 0.4s' }}>
             
             {/* ── Table Container ── */}
             <div className="cand-glass" style={{ borderRadius: 32, padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                         <th style={{ padding: '24px 40px', textAlign: 'left', fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Identité du Talent</th>
                         <th style={{ padding: '24px 20px', textAlign: 'left', fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Formation</th>
                         <th style={{ padding: '24px 20px', textAlign: 'left', fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Soumission</th>
                         <th style={{ padding: '24px 20px', textAlign: 'left', fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Statut actuel</th>
                         <th style={{ padding: '24px 40px', textAlign: 'right' }}></th>
                      </tr>
                   </thead>
                   <tbody>
                      {loading ? (
                         <tr>
                            <td colSpan="5" style={{ padding: 100, textAlign: 'center' }}>
                               <RefreshCw size={40} className="animate-spin" style={{ color: '#D4AF37', margin: '0 auto 20px' }} />
                               <p style={{ fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Synchronisation Pipeline...</p>
                            </td>
                         </tr>
                      ) : candidatures.length === 0 ? (
                         <tr>
                            <td colSpan="5" style={{ padding: 100, textAlign: 'center' }}>
                               <Inbox size={64} style={{ color: '#E2E8F0', marginBottom: 20 }} />
                               <h3 style={{ fontSize: 18, fontWeight: 900, color: '#001D3D', margin: '0 0 8px' }}>Aucun dossier</h3>
                               <p style={{ color: '#94A3B8', fontWeight: 600 }}>Ajustez vos filtres pour voir plus de dossiers.</p>
                            </td>
                         </tr>
                      ) : candidatures.map(cand => (
                         <tr 
                           key={cand.id} 
                           onClick={() => handleViewDetails(cand.id)}
                           className={`cand-row ${selectedCandidature?.id === cand.id ? 'active' : ''}`}
                           style={{ cursor: 'pointer', borderBottom: '1px solid #F1F5F9' }}
                         >
                            <td style={{ padding: '24px 40px' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                  <div style={{ width: 44, height: 44, borderRadius: 14, background: '#001D3D', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 }}>
                                     {cand.prenom?.charAt(0)}{cand.nom?.charAt(0)}
                                  </div>
                                  <div>
                                     <p style={{ fontSize: 15, fontWeight: 900, color: '#001D3D', margin: 0 }}>{cand.prenom} {cand.nom}</p>
                                     <p style={{ fontSize: 10, fontWeight: 800, color: '#D4AF37', textTransform: 'uppercase', margin: 0 }}>#{cand.numero_suivi}</p>
                                  </div>
                               </div>
                            </td>
                            <td style={{ padding: '24px 20px' }}>
                               <div style={{ fontSize: 13, fontWeight: 800, color: '#001D3D' }}>{cand.filiere}</div>
                               <div style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', marginTop: 4 }}>{cand.etablissement}</div>
                            </td>
                            <td style={{ padding: '24px 20px' }}>
                               <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <Clock size={12} style={{ color: '#D4AF37' }} /> {new Date(cand.createdAt).toLocaleDateString()}
                               </div>
                            </td>
                            <td style={{ padding: '24px 20px' }}>{getStatutBadge(cand.statut)}</td>
                            <td style={{ padding: '24px 40px', textAlign: 'right' }}>
                               <ChevronRight size={18} style={{ color: '#E2E8F0' }} />
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             {/* ── Sidebar Details ── */}
             {selectedCandidature && (
                <div style={{ animation: 'candSlideUp 0.5s ease' }}>
                   <div className="cand-glass" style={{ borderRadius: 40, padding: 0, position: 'sticky', top: 40, border: '1px solid #001D3D' }}>
                      <div style={{ padding: 40, background: '#001D3D', borderRadius: '38px 38px 0 0', position: 'relative' }}>
                         <button 
                           onClick={() => setSelectedCandidature(null)}
                           style={{ position: 'absolute', top: 32, right: 32, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: 8, borderRadius: 12, cursor: 'pointer' }}
                         ><X size={20} /></button>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 12 }}>
                            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'white', color: '#001D3D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900 }}>
                               {selectedCandidature.prenom?.charAt(0)}
                            </div>
                            <div>
                               <h3 style={{ fontSize: 24, fontWeight: 900, color: 'white', margin: 0 }}>{selectedCandidature.prenom} {selectedCandidature.nom}</h3>
                               {getStatutBadge(selectedCandidature.statut)}
                            </div>
                         </div>
                      </div>

                      <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 32 }}>
                         <div>
                            <p style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16 }}>Coordonnées de l'étudiant</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, fontWeight: 700, color: '#001D3D' }}>
                                  <Mail size={16} style={{ color: '#D4AF37' }} /> {selectedCandidature.email}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, fontWeight: 700, color: '#001D3D' }}>
                                  <Phone size={16} style={{ color: '#D4AF37' }} /> {selectedCandidature.telephone || '--'}
                                </div>
                            </div>
                         </div>

                         <div style={{ background: '#F8FAFC', padding: 32, borderRadius: 24, border: '1.5px solid #E2E8F0' }}>
                            <p style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16 }}>Détails du stage</p>
                            <h4 style={{ fontSize: 18, fontWeight: 900, color: '#001D3D', margin: '0 0 12px 0' }}>{selectedCandidature.theme || 'Projet non spécifié'}</h4>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                               <span style={{ fontSize: 10, fontWeight: 900, background: 'white', padding: '6px 12px', borderRadius: 8, border: '1px solid #E2E8F0', textTransform: 'uppercase' }}>{selectedCandidature.type_stage}</span>
                               <span style={{ fontSize: 10, fontWeight: 900, background: 'white', padding: '6px 12px', borderRadius: 8, border: '1px solid #E2E8F0', textTransform: 'uppercase' }}>{selectedCandidature.niveau}</span>
                            </div>
                         </div>

                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {['en_attente', 'en_cours', 'liste_attente', 'documents_manquants'].includes(selectedCandidature.statut) ? (
                               <>
                                  <button onClick={() => setActionModal({ open: true, type: 'accept', candidature: selectedCandidature })} style={{ padding: '16px', background: '#001D3D', color: 'white', border: 'none', borderRadius: 16, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>Valider <Check size={16} style={{ color: '#D4AF37' }} /></button>
                                  <button onClick={() => setActionModal({ open: true, type: 'waitlist', candidature: selectedCandidature })} style={{ padding: '16px', background: 'white', color: '#001D3D', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>Mettre en attente</button>
                                  <button onClick={() => setActionModal({ open: true, type: 'documents', candidature: selectedCandidature })} style={{ padding: '16px', background: 'white', color: '#001D3D', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>Demander pièces</button>
                                  <button onClick={() => setActionModal({ open: true, type: 'reject', candidature: selectedCandidature })} style={{ padding: '16px', background: 'white', color: '#DC2626', border: '1.5px solid #FEE2E2', borderRadius: 16, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>Refuser</button>
                               </>
                            ) : (
                               <button disabled style={{ gridColumn: 'span 2', padding: '16px', background: '#F1F5F9', color: '#94A3B8', border: 'none', borderRadius: 16, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>Dossier clôturé</button>
                            )}
                         </div>

                         <button 
                           onClick={() => setActionModal({ open: true, type: 'message', candidature: selectedCandidature })}
                           style={{ width: '100%', padding: '18px', background: '#F8FAFC', color: '#001D3D', border: '1.5px solid #E2E8F0', borderRadius: 20, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
                         >
                           <Mail size={18} style={{ color: '#D4AF37' }} /> Contacter le candidat
                         </button>
                      </div>
                   </div>
                </div>
             )}

          </div>
       </div>

       {/* ── Action Modal ── */}
       {actionModal.open && (
         <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,29,61,0.4)', backdropFilter: 'blur(10px)' }} onClick={() => setActionModal({ open: false, type: '', candidature: null })}></div>
            <div className="cand-card" style={{ position: 'relative', width: '100%', maxWidth: 600, padding: 0, border: 'none', overflow: 'hidden' }}>
               <div style={{ padding: '32px 40px', background: '#001D3D', color: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                        <h3 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Décision Stratégique</h3>
                        <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 8 }}>Flux Recrutement GIAS</p>
                     </div>
                     <button onClick={() => setActionModal({ open: false, type: '', candidature: null })} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer' }}><X size={24}/></button>
                  </div>
               </div>
               <div style={{ padding: 40 }}>
                  <label style={{ fontSize: 11, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Commentaire / Justification</label>
                  <textarea 
                     style={{ width: '100%', minHeight: 180, padding: 24, border: '1.5px solid #E2E8F0', borderRadius: 20, fontSize: 15, fontWeight: 500, lineHeight: 1.6, resize: 'none', fontStyle: 'italic' }} 
                     placeholder={actionModal.type === 'message' ? "Écrivez votre message..." : "Motif de la décision..."}
                     value={commentaire}
                     onChange={e => setCommentaire(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                     <button onClick={() => setActionModal({ open: false, type: '', candidature: null })} style={{ flex: 1, padding: '18px', background: '#F1F5F9', border: 'none', borderRadius: 16, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>Annuler</button>
                     <button 
                        onClick={handleAction} 
                        disabled={actionLoading}
                        style={{ flex: 1, padding: '18px', background: '#001D3D', color: 'white', border: 'none', borderRadius: 16, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
                     >
                        {actionLoading ? <RefreshCw className="animate-spin" size={18} /> : <>Confirmer <Send size={16} style={{ color: '#D4AF37' }} /></>}
                     </button>
                  </div>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default Candidatures;
