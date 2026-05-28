/**
 * Composant: StagiaireDetailPanel — GIAS Premium V6
 * Panel latéral immersif de consultation et pilotage des dossiers individuels.
 * Onglets: Profil | Présences | Évaluations | Documents
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  X, User, Mail, Phone, Building2, Calendar, GraduationCap,
  MapPin, Briefcase, CheckCircle2, Clock, AlertCircle, FileText,
  Download, Star, ChevronLeft, ChevronRight, Loader2, BarChart2,
  ClipboardList, BookOpen, Shield, UserCheck, Edit2, Zap,
  Target, Award, Sparkles, Building, PhoneCall, ExternalLink,
  ChevronDown
} from 'lucide-react';
import * as presenceService from '../services/presenceService';
import * as evaluationService from '../services/evaluationService';
import * as documentService from '../services/documentService';
import { toast } from '../store/useToastStore';

/* ── Tab IDs ── */
const TABS = [
  { id: 'profil',      label: 'Fiche Identité',      icon: User },
  { id: 'presences',   label: 'Suivi Présence',   icon: Clock },
  { id: 'evaluations', label: 'Performances', icon: Star },
  { id: 'documents',   label: 'Portefeuille Doc',   icon: FileText },
];

/* ── Global Styles ── */
const injectStyles = `
@keyframes panelSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes panelFadeIn { from { opacity: 0; } to { opacity: 1; } }
.panel-glass { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-left: 1px solid rgba(0, 29, 61, 0.1); }
.tab-active::after { content: ''; position: absolute; bottom: -12px; left: 50%; transform: translateX(-50%); width: 24px; height: 3px; background: #D4AF37; border-radius: 99px; }
`;

export default function StagiaireDetailPanel({ stagiaire, onClose, onEdit, isRH }) {
  const [activeTab, setActiveTab] = useState('profil');
  const [presences, setPresences]   = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [documents, setDocuments]   = useState([]);
  const [loadingTab, setLoadingTab] = useState(false);

  const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  const duree = () => {
    if (!stagiaire.date_demarrage || !stagiaire.date_fin) return '—';
    const ms = new Date(stagiaire.date_fin) - new Date(stagiaire.date_demarrage);
    const jours = Math.round(ms / 86400000);
    return jours > 30 ? `${Math.round(jours/30)} mois` : `${jours} jours`;
  };

  const loadTabData = useCallback(async (tab) => {
    setLoadingTab(true);
    try {
      if (tab === 'presences') {
        const res = await presenceService.getStagiairePresences(stagiaire.id);
        setPresences(res.data || []);
      } else if (tab === 'evaluations') {
        const res = await evaluationService.getEvaluations({ stagiaire_id: stagiaire.id });
        setEvaluations(res.data || []);
      } else if (tab === 'documents') {
        const res = await documentService.getDocuments({ stagiaire_id: stagiaire.id });
        setDocuments(res.data || []);
      }
    } catch (err) {
      console.error(`Erreur chargement ${tab}:`, err);
    } finally {
      setLoadingTab(false);
    }
  }, [stagiaire.id]);

  useEffect(() => {
    if (activeTab !== 'profil') loadTabData(activeTab);
  }, [activeTab, loadTabData]);

  const initials = `${stagiaire.utilisateur?.prenom?.charAt(0) || ''}${stagiaire.utilisateur?.nom?.charAt(0) || ''}`;

  return (
    <>
      <style>{injectStyles}</style>
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,29,61,0.3)', backdropFilter: 'blur(8px)', zIndex: 1000, animation: 'panelFadeIn 0.3s ease' }} 
      />

      {/* Main Panel */}
      <div className="panel-glass" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 620,
        zIndex: 1001, display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px rgba(0,29,61,0.15)',
        animation: 'panelSlideIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
      }}>

        {/* ── Header Area ── */}
        <div style={{ background: '#001D3D', padding: '60px 40px 40px', position: 'relative', overflow: 'hidden' }}>
           <div style={{ position: 'absolute', bottom: 0, right: 0, width: '60%', height: '100%', background: 'linear-gradient(225deg, rgba(212,175,55,0.05) 0%, transparent 100%)' }} />
           
           <button onClick={onClose} style={{ position: 'absolute', top: 32, right: 32, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 12, padding: 10, cursor: 'pointer', color: 'white' }}>
              <X size={20}/>
           </button>

           <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative' }}>
              <div style={{ width: 84, height: 84, borderRadius: 24, background: 'white', color: '#001D3D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, border: '4px solid rgba(255,255,255,0.1)' }}>
                 {initials}
              </div>
              <div style={{ flex: 1 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: stagiaire.statut === 'actif' ? '#D4AF37' : '#94A3B8' }} />
                    <span style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.4em' }}>{stagiaire.entity} Industrie</span>
                 </div>
                 <h2 style={{ fontSize: 32, fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
                    {stagiaire.utilisateur?.prenom} {stagiaire.utilisateur?.nom}
                 </h2>
                 <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 500, marginTop: 4 }}>
                    {stagiaire.filiere} · Étudiant à <span style={{ color: 'white' }}>{stagiaire.etablissement}</span>
                 </p>
              </div>
           </div>

           {/* Quick Actions */}
           <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
              {isRH && (
                 <button onClick={() => { onClose(); onEdit(stagiaire); }} style={{ padding: '12px 24px', background: '#D4AF37', color: '#001D3D', border: 'none', borderRadius: 12, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Edit2 size={14}/> Rectifier Fiche
                 </button>
              )}
              <button style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                 <Mail size={14} style={{ color: '#D4AF37' }}/> Contacter
              </button>
           </div>

           {/* Tabs Bar */}
           <div style={{ display: 'flex', gap: 32, marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24 }}>
              {TABS.map(t => (
                 <button 
                  key={t.id} 
                  onClick={() => setActiveTab(t.id)}
                  style={{ 
                    background: 'none', border: 'none', padding: 0, position: 'relative', 
                    fontSize: 10, fontWeight: activeTab === t.id ? 900 : 700, 
                    color: activeTab === t.id ? 'white' : 'rgba(255,255,255,0.3)', 
                    textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', 
                    display: 'flex', alignItems: 'center', gap: 10, transition: '0.3s' 
                  }}
                  className={activeTab === t.id ? 'tab-active' : ''}
                 >
                    <t.icon size={14} style={{ color: activeTab === t.id ? '#D4AF37' : 'currentColor' }} /> {t.label}
                 </button>
              ))}
           </div>
        </div>

        {/* ── Content Container ── */}
        <div style={{ flex: 1, padding: 40, overflowY: 'auto', background: '#F8FAFC' }}>
           
           {/* ══ Profil Tab ══════════════════════════════ */}
           {activeTab === 'profil' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                 
                 {/* Identification */}
                 <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                       <div style={{ width: 12, height: 2, background: '#D4AF37' }} />
                       <h3 style={{ fontSize: 13, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>Répertoire d'Information</h3>
                    </div>
                    <div style={{ display: 'grid', gap: 24 }}>
                       <InfoBlock icon={Mail} label="Messagerie Corporate" value={stagiaire.utilisateur?.email} />
                       <InfoBlock icon={PhoneCall} label="Ligne Directe" value={stagiaire.utilisateur?.telephone || '—'} />
                       <InfoBlock icon={MapPin} label="Affectation Pôle" value={stagiaire.departement?.nom || 'Pôle non assigné'} />
                       <InfoBlock icon={UserCheck} label="Maître de Stage" value={stagiaire.tuteur ? `${stagiaire.tuteur.prenom} ${stagiaire.tuteur.nom}` : 'Assignation en cours...'} />
                    </div>
                 </div>

                 {/* Académique */}
                 <div style={{ background: 'white', padding: 32, borderRadius: 32, border: '1.5px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                       <GraduationCap size={20} style={{ color: '#D4AF37' }} />
                       <h4 style={{ fontSize: 14, fontWeight: 900, color: '#001D3D', margin: 0 }}>Parcours Institutionnel</h4>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                       <div>
                          <p style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Dates clés</p>
                          <p style={{ fontSize: 13, fontWeight: 800, color: '#001D3D', margin: 0 }}>{fmt(stagiaire.date_demarrage)}</p>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginTop: 4 }}>Démarrage du stage</p>
                       </div>
                       <div>
                          <p style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Échéance</p>
                          <p style={{ fontSize: 13, fontWeight: 800, color: '#001D3D', margin: 0 }}>{fmt(stagiaire.date_fin)}</p>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginTop: 4 }}>Fin de période ({duree()})</p>
                       </div>
                    </div>
                 </div>

                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '24px', border: '1px dashed #E2E8F0', borderRadius: 24 }}>
                    <Shield size={16} style={{ color: '#007F82' }} />
                    <p style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', margin: 0 }}>Dossier certifié par le service RH · GIAS Group</p>
                 </div>
              </div>
           )}

           {/* ══ Présences Tab ═══════════════════════════ */}
           {activeTab === 'presences' && (
              loadingTab ? <LoadingState /> : (
                <div>
                   {presences.length === 0 ? <EmptyState icon={Clock} text="Aucun registre de présence digitalisé." /> : (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                           <StatsBox label="Flux Présence" value={presences.length} sub="Jours total" />
                           <StatsBox label="Assiduité" value={presences.filter(p=>p.statut==='present').length} sub="Présences validées" color="#059669" />
                           <StatsBox label="Absence" value={presences.filter(p=>p.statut==='absent').length} sub="Anomalies détectées" color="#DC2626" />
                        </div>
                        <div style={{ background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 24, overflow: 'hidden' }}>
                           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                 <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Horaires</th>
                                    <th style={{ padding: '16px 20px', textAlign: 'right' }}>Détail</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {presences.map((p, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                       <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 800, color: '#001D3D' }}>{new Date(p.date).toLocaleDateString('fr-FR', { day:'numeric', month:'short' })}</td>
                                       <td style={{ padding: '16px 20px', fontSize: 12, fontWeight: 600, color: '#64748B' }}>{p.heure_arrivee || '08:00'} — {p.heure_depart || '17:00'}</td>
                                       <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                          <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: p.statut === 'present' ? '#059669' : '#DC2626' }}>{p.statut}</span>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                   )}
                </div>
              )
           )}

           {/* ══ Évaluations Tab ═════════════════════════ */}
           {activeTab === 'evaluations' && (
              loadingTab ? <LoadingState /> : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {evaluations.length === 0 ? <EmptyState icon={Target} text="Bilan de compétences non encore effectué." /> : evaluations.map((ev, i) => (
                       <div key={i} style={{ background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 32, padding: 32 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                             <div>
                                <h4 style={{ fontSize: 18, fontWeight: 900, color: '#001D3D', margin: 0 }}>Évaluation Périodique</h4>
                                <p style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginTop: 4 }}>{fmt(ev.date_evaluation)} · Par {ev.evaluateur?.prenom} {ev.evaluateur?.nom}</p>
                             </div>
                             <div style={{ width: 64, height: 64, borderRadius: 16, background: '#001D3D', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900 }}>
                                {ev.note_globale}
                             </div>
                          </div>
                          
                          <div style={{ display: 'grid', gap: 16 }}>
                             <ProgressBar label="Compétences Techniques" value={ev.note_technique} />
                             <ProgressBar label="Engagement & Comportement" value={ev.note_comportement} />
                             <ProgressBar label="Esprit d'Initiative" value={ev.note_initiative} />
                          </div>

                          {ev.commentaire && (
                             <div style={{ marginTop: 24, padding: 20, background: '#F8FAFC', borderRadius: 16, fontSize: 13, fontWeight: 500, color: '#64748B', lineHeight: 1.6, fontStyle: 'italic', borderLeft: '3px solid #D4AF37' }}>
                                "{ev.commentaire}"
                             </div>
                          )}
                       </div>
                    ))}
                 </div>
              )
           )}

           {/* ══ Documents Tab ═══════════════════════════ */}
           {activeTab === 'documents' && (
              loadingTab ? <LoadingState /> : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {documents.length === 0 ? <EmptyState icon={FileText} text="Portefeuille documentaire vide." /> : documents.map((doc, i) => (
                       <div key={i} style={{ padding: '20px 24px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                             <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F8FAFC', color: '#001D3D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={20} />
                             </div>
                             <div>
                                <p style={{ fontSize: 14, fontWeight: 800, color: '#001D3D', margin: 0 }}>{doc.type_document || doc.fichier_nom}</p>
                                <p style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', marginTop: 4 }}>REPRÉSENTATION OFFICIELLE</p>
                             </div>
                          </div>
                          <button onClick={() => documentService.downloadDocument(doc.id, doc.fichier_nom)} style={{ width: 40, height: 40, background: '#F1F5F9', border: 'none', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#001D3D' }}>
                             <Download size={18}/>
                          </button>
                       </div>
                    ))}
                 </div>
              )
           )}

        </div>
      </div>
    </>
  );
}

/* ── UI Helpers ── */
function InfoBlock({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
       <div style={{ width: 40, height: 40, borderRadius: 12, background: 'white', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#001D3D' }}>
          <Icon size={18} />
       </div>
       <div>
          <p style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{label}</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#001D3D', margin: 0 }}>{value}</p>
       </div>
    </div>
  );
}

function StatsBox({ label, value, sub, color = '#001D3D' }) {
  return (
    <div style={{ background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 24, padding: 20, textAlign: 'center' }}>
       <p style={{ fontSize: 28, fontWeight: 900, color, margin: 0 }}>{value}</p>
       <p style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>{label}</p>
       <p style={{ fontSize: 10, color: '#94A3B8', margin: 0 }}>{sub}</p>
    </div>
  );
}

function ProgressBar({ label, value, max = 20 }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#001D3D' }}>{label}</span>
          <span style={{ fontSize: 11, fontWeight: 900, color: '#D4AF37' }}>{value} / {max}</span>
       </div>
       <div style={{ height: 6, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: '#001D3D', borderRadius: 99 }} />
       </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ padding: 60, textAlign: 'center' }}>
       <RefreshCw size={32} className="animate-spin" style={{ color: '#D4AF37', margin: '0 auto 16px' }} />
       <p style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Intelligence GIAS...</p>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div style={{ padding: 60, textAlign: 'center', color: '#E2E8F0' }}>
       <Icon size={64} style={{ marginBottom: 24 }} />
       <p style={{ fontSize: 14, fontWeight: 600, color: '#94A3B8', margin: 0 }}>{text}</p>
    </div>
  );
}
