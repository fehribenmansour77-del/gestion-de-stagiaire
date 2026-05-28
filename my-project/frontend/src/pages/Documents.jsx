/**
 * Page: Centre Documentaire — GIAS Premium V6
 * Archive sécurisée et génération intelligente d'actes administratifs.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getDocuments, generateAttestation, generatePresenceSheet, 
  generateEvaluationReport, deleteDocument, downloadDocument 
} from '../services/documentService';
import { getStagiaires } from '../services/stagiaireService';
import { toast } from '../store/useToastStore';
import { 
  FileText, Calendar, Trash2, Download, User, FileCheck, 
  FileClock, X, Search, RefreshCw, Filter, CheckCircle2, 
  AlertCircle, FileBarChart2, ChevronRight, ShieldCheck, 
  Loader2, Archive, Inbox, Zap, Sparkles, Target, Layers
} from 'lucide-react';

/* ── Global Styles ── */
const injectStyles = `
@keyframes docFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.doc-glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.4); }
.doc-card { background: white; border-radius: 28px; border: 1px solid #E2E8F0; transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
.doc-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,29,61,0.08); }
.doc-row { transition: all 0.3s; border-radius: 16px; border-bottom: 1px solid #F1F5F9; }
.doc-row:hover { background: #F8FAFC !important; transform: scale(1.002); }
`;

const DOC_TYPE_LABELS = {
  ATTESTATION_STAGE: 'Attestation de stage',
  FEUILLE_PRESENCE: 'Feuille de présence',
  RAPPORT_EVALUATION: 'Rapport d\'évaluation',
  CONVENTION: 'Convention de stage'
};

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(null);
  
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [selectedStagiaire, setSelectedStagiaire] = useState('');
  const [presenceMonth, setPresenceMonth] = useState(new Date().getMonth() + 1);
  const [presenceYear, setPresenceYear] = useState(new Date().getFullYear());

  const isRH = user?.role === 'admin_rh' || user?.role === 'super_admin';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, entity: entityFilter, type: typeFilter };
      const [docRes, stagRes] = await Promise.all([
        getDocuments(params),
        getStagiaires({ statut: 'termine', page: 1, limit: 100 })
      ]);
      setDocuments(docRes.documents || []);
      const activeRes = await getStagiaires({ statut: 'actif', page: 1, limit: 100 });
      setStagiaires([...(stagRes.data || []), ...(activeRes.data || [])]);
    } catch (err) { toast.error('Erreur de synchronisation des documents'); }
    finally { setLoading(false); }
  }, [search, entityFilter, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => { loadData(); }, 500);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleGenerate = async () => {
    if (!selectedStagiaire) { toast.error('Veuillez choisir un talent'); return; }
    setGenerating(true);
    try {
      if (showModal === 'attestation') await generateAttestation(selectedStagiaire);
      else if (showModal === 'presence') await generatePresenceSheet(selectedStagiaire, presenceMonth, presenceYear);
      else if (showModal === 'evaluation') await generateEvaluationReport(selectedStagiaire);
      toast.success('Document institutionnel généré');
      setShowModal(null);
      loadData();
    } catch (err) { toast.error('Échec de la génération automatique'); }
    finally { setGenerating(false); }
  };

  const handleDownload = async (doc) => {
    try { await downloadDocument(doc.id, doc.fichier_nom); }
    catch (err) { toast.error('Erreur de téléchargement PDF'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression irréversible de l\'archive ?')) return;
    try {
      await deleteDocument(id);
      toast.success('Acte supprimé du répertoire');
      loadData();
    } catch (err) { toast.error('Échec de la suppression'); }
  };

  const months = [
    { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' }, { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' }, { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' }
  ];

  const getDocBadge = (type) => {
    const configs = {
      ATTESTATION_STAGE: { color: '#059669', icon: <FileCheck size={18} /> },
      FEUILLE_PRESENCE: { color: '#D4AF37', icon: <FileClock size={14} /> },
      RAPPORT_EVALUATION: { color: '#007F82', icon: <FileBarChart2 size={18} /> },
      CONVENTION: { color: '#001D3D', icon: <ShieldCheck size={18} /> }
    };
    const c = configs[type] || { color: '#94A3B8', icon: <FileText size={18} /> };
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: `${c.color}10`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${c.color}15` }}>
           {c.icon}
        </div>
        <div>
           <p style={{ fontSize: 13, fontWeight: 800, color: '#001D3D', margin: 0 }}>{DOC_TYPE_LABELS[type] || type}</p>
           <p style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Certifié GIAS</p>
        </div>
      </div>
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
                  <Archive size={18} style={{ color: '#D4AF37' }} />
                  <span style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Archives Institutionnelles · GIAS Group</span>
                </div>
                <h1 style={{ fontSize: 44, fontWeight: 900, color: '#001D3D', letterSpacing: '-0.02em', margin: 0 }}>Centre <span style={{ color: '#001D3D' }}>Documentaire</span></h1>
                <p style={{ color: '#64748B', fontSize: 16, marginTop: 12, fontWeight: 500, maxWidth: 600 }}>Registre sécurisé des attestations, conventions et feuilles de présence officielles.</p>
             </div>
             
             {isRH && (
                <div style={{ display: 'flex', gap: 12 }}>
                   <button onClick={() => setShowModal('presence')} style={{ padding: '16px 24px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 20, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}><FileClock size={16}/> Présences</button>
                   <button onClick={() => setShowModal('attestation')} style={{ padding: '16px 24px', background: '#001D3D', color: 'white', border: 'none', borderRadius: 20, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>Nouvelle Attestation <Zap size={16} style={{ color: '#D4AF37' }} /></button>
                </div>
             )}
          </div>

          {/* ── Filter Bar ── */}
          <div className="doc-glass" style={{ padding: '24px 32px', borderRadius: 28, marginBottom: 40, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
             <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ position: 'relative' }}>
                   <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                   <input 
                     type="text" 
                     placeholder="Chercher une référence ou un nom..." 
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 14, fontWeight: 600 }}
                   />
                </div>
             </div>

             <select 
               style={{ width: 180, padding: '14px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 14, fontWeight: 600 }}
               value={entityFilter} 
               onChange={e => setEntityFilter(e.target.value)}
             >
                <option value="">Toutes filiales</option>
                <option value="GIAS">GIAS Industries</option>
                <option value="CSM">CSM GIAS</option>
             </select>

             <select 
               style={{ width: 220, padding: '14px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 14, fontWeight: 600 }}
               value={typeFilter} 
               onChange={e => setTypeFilter(e.target.value)}
             >
                <option value="">Tous les types d'actes</option>
                <option value="ATTESTATION_STAGE">Attestations</option>
                <option value="FEUILLE_PRESENCE">Présences</option>
                <option value="RAPPORT_EVALUATION">Évaluations</option>
                <option value="CONVENTION">Conventions</option>
             </select>

             <button 
                onClick={() => { setSearch(''); setEntityFilter(''); setTypeFilter(''); }}
                style={{ width: 50, height: 50, background: '#F1F5F9', border: 'none', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
             >
                <RefreshCw size={20} style={{ color: '#001D3D' }} />
             </button>
          </div>

          {/* ── Grid Area ── */}
          <div className="doc-glass" style={{ borderRadius: 32, padding: 0, overflow: 'hidden' }}>
             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                   <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '24px 40px', textAlign: 'left', fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Document Institutionnel</th>
                      <th style={{ padding: '24px 20px', textAlign: 'left', fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Bénéficiaire Talent</th>
                      <th style={{ padding: '24px 20px', textAlign: 'left', fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Période d'exercice</th>
                      <th style={{ padding: '24px 20px', textAlign: 'left', fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Date d'émission</th>
                      <th style={{ padding: '24px 40px', textAlign: 'right' }}></th>
                   </tr>
                </thead>
                <tbody>
                   {loading ? (
                      <tr>
                         <td colSpan="5" style={{ padding: 100, textAlign: 'center' }}>
                            <RefreshCw size={40} className="animate-spin" style={{ color: '#D4AF37', margin: '0 auto 20px' }} />
                         </td>
                      </tr>
                   ) : documents.length === 0 ? (
                      <tr>
                         <td colSpan="5" style={{ padding: 100, textAlign: 'center' }}>
                            <Inbox size={64} style={{ color: '#E2E8F0', marginBottom: 20 }} />
                            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#001D3D', margin: '0 0 8px' }}>Archive vide</h3>
                         </td>
                      </tr>
                   ) : documents.map((doc, i) => (
                      <tr key={doc.id} className="doc-row" style={{ animation: `docFadeUp 0.5s ease forwards ${i * 0.05}s`, opacity: 0 }}>
                         <td style={{ padding: '24px 40px' }}>{getDocBadge(doc.type)}</td>
                         <td style={{ padding: '24px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                               <div style={{ width: 32, height: 32, borderRadius: 10, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>
                                  {(doc.stagiaire?.prenom || doc.stagiaire?.utilisateur?.prenom || '?').charAt(0)}
                               </div>
                               <div>
                                  <p style={{ fontSize: 14, fontWeight: 800, color: '#001D3D', margin: 0 }}>{doc.stagiaire?.prenom || doc.stagiaire?.utilisateur?.prenom} {doc.stagiaire?.nom || doc.stagiaire?.utilisateur?.nom}</p>
                                  <p style={{ fontSize: 9, fontWeight: 900, color: '#D4AF37', textTransform: 'uppercase', margin: 0 }}>{doc.stagiaire?.entity}</p>
                               </div>
                            </div>
                         </td>
                         <td style={{ padding: '24px 20px' }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#001D3D', display: 'flex', alignItems: 'center', gap: 8 }}>
                               <Calendar size={12} style={{ color: '#94A3B8' }} />
                               {doc.periode_mois && doc.periode_annee 
                                 ? `${months.find(m => m.value === doc.periode_mois)?.label} ${doc.periode_annee}` 
                                 : <span style={{ color: '#94A3B8', fontWeight: 600 }}>Acte Unique</span>}
                            </div>
                         </td>
                         <td style={{ padding: '24px 20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                               <span style={{ fontSize: 12, fontWeight: 800, color: '#001D3D' }}>{new Date(doc.created_at || doc.createdAt).toLocaleDateString()}</span>
                               <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700 }}>Par {doc.generateur?.prenom} {doc.generateur?.nom}</span>
                            </div>
                         </td>
                         <td style={{ padding: '24px 40px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                               <button onClick={() => handleDownload(doc)} style={{ width: 44, height: 44, background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#001D3D' }}><Download size={18}/></button>
                               {isRH && (
                                  <button onClick={() => handleDelete(doc.id)} style={{ width: 44, height: 44, background: '#FEF2F2', border: '1.5px solid #FEE2E2', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#DC2626' }}><Trash2 size={18}/></button>
                               )}
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>

       {/* ── Generation Modal ── */}
       {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
             <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,29,61,0.4)', backdropFilter: 'blur(10px)' }} onClick={() => !generating && setShowModal(null)}></div>
             <div className="doc-glass" style={{ position: 'relative', width: '100%', maxWidth: 600, padding: 0, borderRadius: 40, border: 'none', overflow: 'hidden' }}>
                <div style={{ padding: '40px', background: '#001D3D', color: 'white' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                         <h3 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Génération d'Acte</h3>
                         <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 8 }}>Processus Certifié GIAS Group</p>
                      </div>
                      <button onClick={() => !generating && setShowModal(null)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer' }}><X size={28}/></button>
                   </div>
                </div>
                
                <div style={{ padding: 60 }}>
                   <div style={{ marginBottom: 32 }}>
                      <label style={{ fontSize: 11, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Sélectionner le Talent</label>
                      <select 
                        style={{ width: '100%', padding: '16px', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 15, fontWeight: 600 }}
                        value={selectedStagiaire} 
                        onChange={e => setSelectedStagiaire(e.target.value)} 
                        disabled={generating}
                      >
                         <option value="">-- Choisir un stagiaire --</option>
                         {stagiaires.map(stag => (
                           <option key={stag.id} value={stag.id}>
                             {stag.utilisateur?.prenom} {stag.utilisateur?.nom} ({stag.entity})
                           </option>
                         ))}
                      </select>
                   </div>

                   {showModal === 'presence' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                         <div>
                            <label style={{ fontSize: 11, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Mois d'exercice</label>
                            <select style={{ width: '100%', padding: '16px', border: '1.5px solid #E2E8F0', borderRadius: 16 }} value={presenceMonth} onChange={e => setPresenceMonth(parseInt(e.target.value))} disabled={generating}>
                               {months.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
                            </select>
                         </div>
                         <div>
                            <label style={{ fontSize: 11, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Année</label>
                            <select style={{ width: '100%', padding: '16px', border: '1.5px solid #E2E8F0', borderRadius: 16 }} value={presenceYear} onChange={e => setPresenceYear(parseInt(e.target.value))} disabled={generating}>
                               <option value={2026}>2026</option>
                               <option value={2025}>2025</option>
                            </select>
                         </div>
                      </div>
                   )}

                   <div style={{ background: '#F8FAFC', padding: 24, borderRadius: 20, marginBottom: 40, borderLeft: '4px solid #D4AF37' }}>
                      <p style={{ fontSize: 13, color: '#64748B', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                         Cette action générera un exemplaire PDF infalsifiable enregistré dans les archives centrales du Groupe avec signature institutionnelle.
                      </p>
                   </div>

                   <div style={{ display: 'flex', gap: 16 }}>
                      <button onClick={() => setShowModal(null)} disabled={generating} style={{ flex: 1, padding: '18px', background: '#F1F5F9', border: 'none', borderRadius: 16, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>Annuler</button>
                      <button 
                        onClick={handleGenerate} 
                        disabled={generating}
                        style={{ flex: 2, padding: '18px', background: '#001D3D', color: 'white', border: 'none', borderRadius: 16, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
                      >
                         {generating ? <RefreshCw className="animate-spin" size={18} /> : <>Générer l'Acte PDF <Zap size={16} style={{ color: '#D4AF37' }} /></>}
                      </button>
                   </div>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

export default Documents;
