/**
 * Page: Gestion des Présences — GIAS Premium V6
 * Console de pilotage d'assiduité industrielle ultra-performante.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPresences, createPresence, importPresences } from '../services/presenceService';
import { getStagiaires } from '../services/stagiaireService';
import { toast } from '../store/useToastStore';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Upload, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X,
  History,
  FileText,
  User,
  Activity,
  FileSpreadsheet,
  Check,
  RefreshCw,
  MoreHorizontal,
  ShieldCheck,
  Search,
  Loader2,
  TrendingUp,
  Award,
  Zap,
  ArrowRight
} from 'lucide-react';

/* ── Status Definitions (Premium Palette) ── */
const STATUS_LABELS = {
  P:   { label: 'Présent(e)', color: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
  AJ:  { label: 'Justifié', color: '#007F82', bg: 'rgba(0, 127, 130, 0.1)' },
  ANJ: { label: 'Absent(e)', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.1)' },
  C:   { label: 'Congé', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.1)' },
  R:   { label: 'Retard', color: '#D4AF37', bg: 'rgba(212, 175, 55, 0.1)' },
  DA:  { label: 'Départ Ant.', color: '#F97316', bg: 'rgba(249, 115, 22, 0.1)' },
  TT:  { label: 'Télétravail', color: '#0EA5E9', bg: 'rgba(14, 165, 233, 0.1)' },
  JF:  { label: 'Férié', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.1)' }
};

/* ── Common Styles ── */
const injectStyles = `
@keyframes preFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes prePulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
.pre-glass { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.3); }
.pre-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 32px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.pre-card:hover { border-color: #001D3D; box-shadow: 0 20px 50px rgba(0,29,61,0.05); }
.pre-calendar-cell { height: 110px; padding: 12px; border: 1px solid #F1F5F9; transition: all 0.2s; position: relative; }
.pre-calendar-cell:hover { background: #F8FAFC; z-index: 10; transform: scale(1.02); border-radius: 12px; border-color: #D4AF37; }
.pre-badge { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 6px 12px; border-radius: 10px; display: inline-flex; align-items: center; gap: 6px; }
`;

const Presences = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [presences, setPresences] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [selectedStagiaire, setSelectedStagiaire] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStagiaireId, setImportStagiaireId] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [search, setSearch] = useState('');
  
  const [newPresence, setNewPresence] = useState({
    statut: 'P',
    heure_entree: '09:00',
    heure_sortie: '17:00',
    justificatif: '',
    commentaire: ''
  });

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  useEffect(() => {
    if (user?.role === 'stagiaire' && user?.stagiaire_active) {
      setSelectedStagiaire(user.stagiaire_active.id);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'stagiaire' && !user?.stagiaire_active) return;
    loadData();
  }, [currentDate, selectedStagiaire]);

  const loadData = async () => {
    setLoading(true);
    try {
      const dateDebut = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const dateFin = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

      const params = { date_debut: dateDebut, date_fin: dateFin };
      if (selectedStagiaire) params.stage_id = selectedStagiaire;
      
      const [presencesRes, stagiaireRes] = await Promise.all([
        getPresences(params),
        user?.role !== 'stagiaire' ? getStagiaires({ statut: 'actif', page: 1, limit: 100 }) : { data: [] }
      ]);
      
      setPresences(presencesRes.data || []);
      if (user?.role !== 'stagiaire') {
        setStagiaires(stagiaireRes.data || []);
      }
    } catch (err) {
      console.error('Presences loadData error:', err);
      setError('Erreur de synchronisation du calendrier.');
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month, 1));

  const getPresenceForDay = (day, stagiaireId) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return presences.find(p => {
      const pDateStr = new Date(p.date).toISOString().split('T')[0];
      return pDateStr === dateStr && p.stage_id === Number(stagiaireId);
    });
  };

  const handleDayClick = (day) => {
    if (user?.role === 'stagiaire' && user?.id !== selectedStagiaire) return; 
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setShowModal(true);
  };

  const handleSubmitPresence = async (e) => {
    e.preventDefault();
    try {
      await createPresence({
        ...newPresence,
        date: selectedDate,
        stage_id: selectedStagiaire || undefined,
        saisie_par: user?.id
      });
      setShowModal(false);
      setNewPresence({ statut: 'P', heure_entree: '09:00', heure_sortie: '17:00', justificatif: '', commentaire: '' });
      toast.success('Pointage validé avec succès');
      loadData();
    } catch (err) {
      toast.error('Échec de la validation');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file || !importStagiaireId) return;
    const formData = new FormData();
    formData.append('fichier', file);
    formData.append('stage_id', importStagiaireId);
    try {
      setLoading(true);
      await importPresences(formData);
      setShowImportModal(false);
      setImportStagiaireId('');
      loadData();
      toast.success('Import biométrique réussi');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur d\'import Excel');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const filteredStagiaires = stagiaires.filter(s => {
    const full = `${s.utilisateur?.prenom || s.prenom} ${s.utilisateur?.nom || s.nom}`.toLowerCase();
    return full.includes(search.toLowerCase());
  });

  const renderCalendar = () => {
    const cells = [];
    const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7;
    for (let i = 0; i < totalCells; i++) {
      const d = i - firstDay + 1;
      const isCurrent = d > 0 && d <= daysInMonth;
      cells.push(
        <div key={i} className={`pre-calendar-cell ${isCurrent ? 'cursor-pointer' : 'opacity-20'}`} onClick={() => isCurrent && handleDayClick(d)}>
          {isCurrent && (
            <>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#94A3B8', marginBottom: 12 }}>{d}</div>
              {selectedStagiaire && (() => {
                const p = getPresenceForDay(d, selectedStagiaire);
                if (p) {
                   const info = STATUS_LABELS[p.statut] || { label: p.statut, color: '#001D3D', bg: '#F8FAFC' };
                   return (
                     <div className="pre-badge" style={{ background: info.bg, color: info.color, border: `1px solid ${info.color}20`, width: '100%', justifyContent: 'center' }}>
                        {info.label.charAt(0)}
                     </div>
                   );
                }
                return <div style={{ width: '100%', height: 28, border: '1.5px dashed #E2E8F0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}><Plus size={14}/></div>;
              })()}
            </>
          )}
        </div>
      );
    }
    return cells;
  };

  return (
    <div style={{ paddingBottom: 100, animation: 'preFadeIn 0.8s ease' }}>
      <style>{injectStyles}</style>
      
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        
        {/* ── Console Header ── */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60, flexWrap: 'wrap', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Zap size={16} style={{ color: '#D4AF37' }} />
              <span style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Système d'Assiduité · GIAS</span>
            </div>
            <h1 style={{ fontSize: 44, fontWeight: 900, color: '#001D3D', letterSpacing: '-0.02em', margin: 0 }}>Registre des <span style={{ color: '#D4AF37' }}>Présences</span></h1>
            <p style={{ color: '#64748B', fontSize: 16, marginTop: 12, fontWeight: 500 }}>Contrôle biométrique et pilotage des flux de talents en temps réel.</p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
             {user?.role !== 'stagiaire' && (
               <button onClick={() => setShowImportModal(true)} style={{
                 padding: '16px 32px', background: '#F8FAFC', color: '#001D3D', borderRadius: 20, border: '1px solid #E2E8F0',
                 fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                 display: 'flex', alignItems: 'center', gap: 12, transition: '0.3s'
               }} >
                  <FileSpreadsheet size={18} style={{ color: '#059669' }} /> Import Excel
               </button>
             )}
          </div>
        </header>

        {/* ── Dashboard Stats ── */}
        {!selectedStagiaire && user?.role !== 'stagiaire' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, marginBottom: 60 }}>
             <div className="pre-card" style={{ padding: 32, background: 'linear-gradient(135deg, #001D3D 0%, #002D5D 100%)', color: 'white' }}>
                <TrendingUp size={24} style={{ color: '#D4AF37', marginBottom: 20 }} />
                <p style={{ fontSize: 10, fontWeight: 900, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Assiduité Globale</p>
                <p style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>96.5%</p>
             </div>
             <div className="pre-card" style={{ padding: 32 }}>
                <Users size={24} style={{ color: '#007F82', marginBottom: 20 }} />
                <p style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Effectif Actif</p>
                <p style={{ fontSize: 32, fontWeight: 900, color: '#001D3D', margin: 0 }}>{stagiaires.length}</p>
             </div>
             <div className="pre-card" style={{ padding: 32 }}>
                <Activity size={24} style={{ color: '#DC2626', marginBottom: 20 }} />
                <p style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Absences Non Jus.</p>
                <p style={{ fontSize: 32, fontWeight: 900, color: '#001D3D', margin: 0 }}>04</p>
             </div>
          </div>
        )}

        {/* ── Main View ── */}
        <div className="pre-card" style={{ overflow: 'hidden' }}>
           
           {/* Control Toolbar */}
           <div style={{ padding: '24px 40px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                 <button onClick={prevMonth} style={{ padding: 10, background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, cursor: 'pointer' }}><ChevronLeft size={18}/></button>
                 <span style={{ fontSize: 20, fontWeight: 900, color: '#001D3D', minWidth: 160, textAlign: 'center' }}>{monthNames[month - 1]} {year}</span>
                 <button onClick={nextMonth} style={{ padding: 10, background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, cursor: 'pointer' }}><ChevronRight size={18}/></button>
              </div>
              
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                 {user?.role !== 'stagiaire' ? (
                   <div style={{ position: 'relative' }}>
                      <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <input 
                        type="text" placeholder="Rechercher un talent..." value={search} onChange={e => setSearch(e.target.value)}
                        style={{ padding: '12px 12px 12px 48px', border: '1px solid #E2E8F0', borderRadius: 16, fontSize: 14, width: 280, fontWeight: 600 }}
                      />
                   </div>
                 ) : (
                   <div className="pre-badge" style={{ background: '#F1F5F9', color: '#001D3D' }}>Mon Relevé d'Heures</div>
                 )}
                 {user?.role !== 'stagiaire' && selectedStagiaire && (
                   <button onClick={() => setSelectedStagiaire(null)} style={{ padding: '12px 24px', background: '#001D3D', color: 'white', border: 'none', borderRadius: 16, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer' }}>Global Effectif</button>
                 )}
              </div>
           </div>

           {selectedStagiaire ? (
             <div style={{ animation: 'preFadeIn 0.5s ease' }}>
                <div style={{ padding: '20px 40px', background: '#001D3D', color: 'white', display: 'flex', alignItems: 'center', gap: 16 }}>
                   <div style={{ width: 32, height: 32, borderRadius: 10, background: '#D4AF37', color: '#001D3D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 }}>
                      {(() => { const s = stagiaires.find(s => s.id === selectedStagiaire); return (s?.utilisateur?.prenom || s?.prenom || '?').charAt(0); })()}
                   </div>
                   <span style={{ fontWeight: 800 }}>Profil : {(() => { const s = stagiaires.find(s => s.id === selectedStagiaire); return `${s?.utilisateur?.prenom || s?.prenom || ''} ${s?.utilisateur?.nom || s?.nom || ''}`; })()}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                   {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(d => (
                      <div key={d} style={{ padding: '16px 0', textAlign: 'center', fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>{d}</div>
                   ))}
                   {renderCalendar()}
                </div>
             </div>
           ) : (
             <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                         <th style={{ textAlign: 'left', padding: '24px 40px', fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Talent</th>
                         <th style={{ textAlign: 'center', padding: 24, fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Présence</th>
                         <th style={{ textAlign: 'center', padding: 24, fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Absence</th>
                         <th style={{ textAlign: 'left', padding: 24, fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Performance Mensuelle</th>
                         <th style={{ textAlign: 'right', padding: '24px 40px', fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                   </thead>
                   <tbody style={{ fontSize: 14 }}>
                      {loading ? (
                        <tr><td colSpan="5" style={{ padding: 100, textAlign: 'center' }}><Loader2 className="spin" size={32} style={{ color: '#007F82' }}/><p style={{ marginTop: 16, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Chargement des registres...</p></td></tr>
                      ) : filteredStagiaires.map(stag => {
                         const pList = presences.filter(p => p.stage_id === stag.id);
                         const pCount = pList.filter(p => p.statut === 'P' || p.statut === 'TT').length;
                         const aCount = pList.filter(p => p.statut === 'ANJ' || p.statut === 'AJ').length;
                         const rate = pList.length > 0 ? Math.round((pCount / pList.length) * 100) : 100;
                         return (
                            <tr key={stag.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                               <td style={{ padding: '24px 40px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                     <div style={{ width: 44, height: 44, borderRadius: 14, background: '#F8FAFC', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#001D3D' }}>{stag.utilisateur?.prenom?.charAt(0)}{stag.utilisateur?.nom?.charAt(0)}</div>
                                     <div>
                                        <p style={{ fontWeight: 800, color: '#001D3D', margin: 0 }}>{stag.utilisateur?.prenom} {stag.utilisateur?.nom}</p>
                                        <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>{stag.departement?.nom || 'Indéfini'}</p>
                                     </div>
                                  </div>
                               </td>
                               <td style={{ textAlign: 'center' }}><span className="pre-badge" style={{ background: '#05966910', color: '#059669' }}>{pCount} j</span></td>
                               <td style={{ textAlign: 'center' }}><span className="pre-badge" style={{ background: '#DC262610', color: '#DC2626' }}>{aCount} j</span></td>
                               <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                     <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 10, overflow: 'hidden' }}>
                                        <div style={{ width: `${rate}%`, height: '100%', background: rate > 80 ? '#059669' : '#D4AF37', borderRadius: 10 }}></div>
                                     </div>
                                     <span style={{ fontSize: 12, fontWeight: 900, color: '#001D3D' }}>{rate}%</span>
                                  </div>
                               </td>
                               <td style={{ textAlign: 'right', padding: '24px 40px' }}>
                                  <button onClick={() => setSelectedStagiaire(stag.id)} style={{ padding: 12, background: 'transparent', border: 'none', cursor: 'pointer', color: '#001D3D' }}><ChevronRight size={22}/></button>
                               </td>
                            </tr>
                         )
                      })}
                   </tbody>
                </table>
             </div>
           )}
        </div>

      </div>

      {/* ── Pointage Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
           <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,29,61,0.4)', backdropFilter: 'blur(10px)' }} onClick={() => setShowModal(false)}></div>
           <div className="pre-card" style={{ position: 'relative', width: '100%', maxWidth: 500, overflow: 'hidden', boxShadow: '0 50px 100px rgba(0,0,0,0.2)' }}>
              <div style={{ padding: '32px 40px', background: '#001D3D', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Pointage Individuel</h3>
                 <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={24}/></button>
              </div>
              <form onSubmit={handleSubmitPresence} style={{ padding: 40 }}>
                 <p style={{ fontSize: 14, fontWeight: 700, color: '#94A3B8', marginBottom: 32 }}>Session du {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                    <div className="form-group">
                       <label style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: '#001D3D', marginBottom: 8, display: 'block' }}>Entrée</label>
                       <input type="time" style={{ width: '100%', padding: '14px', border: '1px solid #E2E8F0', borderRadius: 14, fontWeight: 600 }} value={newPresence.heure_entree} onChange={e => setNewPresence({...newPresence, heure_entree: e.target.value})} />
                    </div>
                    <div className="form-group">
                       <label style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: '#001D3D', marginBottom: 8, display: 'block' }}>Sortie</label>
                       <input type="time" style={{ width: '100%', padding: '14px', border: '1px solid #E2E8F0', borderRadius: 14, fontWeight: 600 }} value={newPresence.heure_sortie} onChange={e => setNewPresence({...newPresence, heure_sortie: e.target.value})} />
                    </div>
                 </div>

                 <div style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: '#001D3D', marginBottom: 8, display: 'block' }}>Statut Session</label>
                    <select style={{ width: '100%', padding: '14px', border: '1px solid #E2E8F0', borderRadius: 14, fontWeight: 600, appearance: 'none' }} value={newPresence.statut} onChange={e => setNewPresence({...newPresence, statut: e.target.value})}>
                       {Object.entries(STATUS_LABELS).map(([code, info]) => (
                          <option key={code} value={code}>{info.label}</option>
                       ))}
                    </select>
                 </div>

                 <button type="submit" style={{ width: '100%', padding: '18px', background: '#D4AF37', color: '#001D3D', border: 'none', borderRadius: 16, fontWeight: 900, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.1em', cursor: 'pointer', marginTop: 20 }}>Valider Pointage</button>
              </form>
           </div>
        </div>
      )}

      {/* ── Import Modal ── */}
      {showImportModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
           <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,29,61,0.4)', backdropFilter: 'blur(10px)' }} onClick={() => setShowImportModal(false)}></div>
           <div className="pre-card" style={{ position: 'relative', width: '100%', maxWidth: 540, overflow: 'hidden' }}>
              <div style={{ padding: '32px 40px', background: '#001D3D', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Import BIOMÉTRIQUE</h3>
                 <button onClick={() => setShowImportModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={24}/></button>
              </div>
              <div style={{ padding: 40 }}>
                 <div style={{ background: '#F8FAFC', padding: 24, borderRadius: 24, marginBottom: 32, border: '1px solid #E2E8F0' }}>
                    <p style={{ fontSize: 11, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', marginBottom: 12 }}>Format de Transfert</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                       {['Date', 'Statut', 'H.Entrée', 'H.Sortie'].map(h => <div key={h} style={{ fontSize: 9, fontWeight: 900, color: 'white', background: '#001D3D', padding: '6px 4px', borderRadius: 6, textAlign: 'center' }}>{h}</div>)}
                    </div>
                 </div>

                 <div style={{ marginBottom: 32 }}>
                    <label style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: '#001D3D', marginBottom: 8, display: 'block' }}>Sélection du Talent</label>
                    <select style={{ width: '100%', padding: '16px', border: '1px solid #E2E8F0', borderRadius: 16, fontWeight: 600 }} value={importStagiaireId} onChange={e => setImportStagiaireId(e.target.value)}>
                       <option value="">Choisir un profil...</option>
                       {stagiaires.map(s => <option key={s.id} value={s.id}>{s.utilisateur?.prenom} {s.utilisateur?.nom}</option>)}
                    </select>
                 </div>

                 <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
                    padding: '48px 24px', border: '2.5px dashed #E2E8F0', borderRadius: 24,
                    cursor: importStagiaireId ? 'pointer' : 'not-allowed', opacity: importStagiaireId ? 1 : 0.4,
                    transition: 'all 0.3s', background: '#F8FAFC'
                 }}>
                    <Upload size={32} style={{ color: '#D4AF37' }} />
                    <div style={{ textAlign: 'center' }}>
                       <p style={{ fontWeight: 900, color: '#001D3D', margin: '0 0 4px', fontSize: 14 }}>Transférer le fichier excel</p>
                       <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Formats .xlsx autorisés uniquement</p>
                    </div>
                    <input type="file" accept=".xlsx" style={{ display: 'none' }} disabled={!importStagiaireId} onChange={handleImport} />
                 </label>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Presences;
