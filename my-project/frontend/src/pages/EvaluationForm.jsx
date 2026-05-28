/**
 * Page: Assistant d'Évaluation de Performance — GIAS Premium V6
 * Système de pilotage des compétences et validation institutionnelle.
 * Design Immersif : Navy, Gold, Glassmorphism.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createEvaluation, updateEvaluation, submitEvaluation, getEvaluation } from '../services/evaluationService';
import { getStagiaires } from '../services/stagiaireService';
import { toast } from '../store/useToastStore';
import { 
  User, FileText, Star, Target, MessageSquare, Save, 
  Send, X, Calendar, Award, BookOpen, CheckCircle2,
  TrendingUp, AlertCircle, Activity, ShieldCheck,
  ChevronLeft, Trophy, Zap, ArrowRight, RefreshCw,
  Sparkles, Target as TargetIcon, ClipboardCheck,
  MousePointer2, ChevronDown
} from 'lucide-react';

/* ── Global Styles & Premium Interactions ── */
const injectStyles = `
@keyframes evSlideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes evFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes barPulse { 0% { box-shadow: 0 0 0 0 rgba(212,175,55,0.4); } 70% { box-shadow: 0 0 0 15px rgba(212,175,55,0); } 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0); } }

.form-glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 32px; transition: 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
.form-glass:hover { border-color: rgba(0, 29, 61, 0.2); transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,29,61,0.05); }

.ev-input-container { position: relative; width: 100%; transition: 0.3s; }
.ev-input { width: 100%; padding: 18px 24px; background: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 20px; font-size: 15px; font-weight: 700; color: #001D3D; outline: none; transition: 0.3s; appearance: none; }
.ev-input:focus { border-color: #001D3D; box-shadow: 0 0 0 4px rgba(0,29,61,0.05); background: #FFFFFF; }
.ev-select-icon { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #94A3B8; }

.kpi-card { background: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 32px; padding: 40px; position: relative; overflow: hidden; transition: 0.4s; }
.kpi-card:hover { border-color: #D4AF37; transform: scale(1.02); }

.floating-bar { position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); z-index: 1000; background: #001D3D; padding: 12px 16px; border-radius: 28px; display: flex; align-items: center; gap: 12px; box-shadow: 0 20px 60px rgba(0,29,61,0.3); animation: evSlideUp 0.8s ease; border: 1px solid rgba(212,175,55,0.2); }
`;

const CRITERIA = {
  tech: { label: 'Expertise Technique', max: 40, icon: <Zap size={22} />, color: '#001D3D', desc: 'Savoir-faire, maîtrise des outils et qualité d\'exécution.' },
  prof: { label: 'Posture Professionnelle', max: 30, icon: <ShieldCheck size={22} />, color: '#D4AF37', desc: 'Rigueur, ponctualité, respect des codes et autonomie.' },
  com: { label: 'Soft Skills & Communication', max: 30, icon: <MessageSquare size={22} />, color: '#007F82', desc: 'Intégration d\'équipe, clarté d\'expression et écoute.' }
};

const TYPE_OPTIONS = [
  { value: 'INTEGRATION', label: 'Bilan d\'Intégration' },
  { value: 'MI_PARCOURS', label: 'Suivi de Mi-parcours' },
  { value: 'FINALE', label: 'Évaluation Finale' }
];

const StatusBadge = ({ status }) => {
  const configs = {
    BROUILLON: { label: 'Brouillon', color: '#64748B' },
    SOUMISE: { label: 'Attente Validation RH', color: '#D4AF37' },
    VALIDEE_RH: { label: 'Validé & Archivé', color: '#059669' },
    REFUSEE: { label: 'Besoin de Révision', color: '#DC2626' }
  };
  const config = configs[status] || { label: status, color: '#94A3B8' };
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${config.color}40`, borderRadius: 100, color: 'white', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: config.color, boxShadow: `0 0 10px ${config.color}` }} />
      {config.label}
    </div>
  );
};

export default function EvaluationForm({ evaluationId: propId, onClose, onSave }) {
  const { id: paramId } = useParams();
  const evaluationId = propId || paramId;
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stagiaires, setStagiaires] = useState([]);
  const [evalStatus, setEvalStatus] = useState('BROUILLON');
  
  const [formData, setFormData] = useState({
    stage_id: '',
    type: 'MI_PARCOURS',
    note_technique: 0,
    note_prof: 0,
    note_com: 0,
    points_forts: '',
    axes_amelioration: '',
    commentaire_tuteur: '',
    date_evaluation: new Date().toISOString().split('T')[0]
  });

  const isEditing = !!evaluationId;

  useEffect(() => {
    loadStagiaires();
    if (evaluationId) loadEvaluation();
  }, [evaluationId]);

  const loadStagiaires = async () => {
    try {
      const res = await getStagiaires({ statut: 'actif', page: 1, limit: 100 });
      setStagiaires(res.data || []);
    } catch (err) { console.error(err); }
  };

  const loadEvaluation = async () => {
    try {
      setLoading(true);
      const eval_ = await getEvaluation(evaluationId);
      setEvalStatus(eval_.statut);
      setFormData({
        stage_id: eval_.stage_id,
        type: eval_.type,
        note_technique: eval_.note_technique || 0,
        note_prof: eval_.note_prof || 0,
        note_com: eval_.note_com || 0,
        points_forts: eval_.points_forts || '',
        axes_amelioration: eval_.axes_amelioration || '',
        commentaire_tuteur: eval_.commentaire_tuteur || '',
        date_evaluation: eval_.date_evaluation || new Date().toISOString().split('T')[0]
      });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const noteTotale = parseFloat(formData.note_technique || 0) + parseFloat(formData.note_prof || 0) + parseFloat(formData.note_com || 0);

  const getMention = (note) => {
    if (note >= 90) return { label: 'Exceptionnel', color: '#059669', icon: Trophy };
    if (note >= 75) return { label: 'Très Satisfaisant', color: '#D4AF37', icon: Award };
    if (note >= 60) return { label: 'Objectifs Atteints', color: '#007F82', icon: CheckCircle2 };
    if (note >= 50) return { label: 'Marge de Progression', color: '#64748B', icon: Activity };
    return { label: 'Alerte Performance', color: '#DC2626', icon: AlertCircle };
  };

  const mention = getMention(noteTotale);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('note_')) {
      const key = name.replace('note_', '');
      const max = CRITERIA[key].max;
      const numVal = Math.min(max, Math.max(0, parseFloat(value) || 0));
      setFormData(prev => ({ ...prev, [name]: numVal }));
    } else setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e, soumettre = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      let result;
      if (isEditing) result = await updateEvaluation(evaluationId, formData);
      else result = await createEvaluation(formData);

      if (soumettre) {
        await submitEvaluation(result.id);
        toast.success('Bilan validé et transmis à la DRH');
      } else toast.success('Brouillon sauvegardé');
      
      if (onSave) onSave(result);
      if (onClose) onClose(); else navigate('/evaluations');
    } catch (err) { toast.error(err.message || 'Erreur lors de la sauvegarde'); }
    finally { setLoading(false); }
  };

  if (loading && !formData.stage_id) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
         <RefreshCw size={48} className="animate-spin" style={{ color: '#D4AF37' }} />
      </div>
    );
  }

  const selectedStagiaire = stagiaires.find(s => s.id === parseInt(formData.stage_id));

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 180, overflowX: 'hidden' }}>
       <style>{injectStyles}</style>

       {/* ── Immersive Header ── */}
       <div style={{ background: '#001D3D', padding: '60px 0 100px', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative Elements */}
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-50%', left: '-10%', width: 800, height: 800, background: 'radial-gradient(circle, rgba(0,127,130,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 10 }}>
             
             <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                <button onClick={() => onClose ? onClose() : navigate('/evaluations')} style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>
                   <ChevronLeft size={24} />
                </button>
                <div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                      <StatusBadge status={evalStatus} />
                      <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
                      <span style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>{formData.type.replace('_', ' ')}</span>
                   </div>
                   <h1 style={{ fontSize: 44, fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 20 }}>
                      Pilotage Performance <span style={{ color: '#D4AF37', fontStyle: 'italic', fontWeight: 400, fontFamily: 'serif' }}>: {selectedStagiaire?.utilisateur?.prenom || 'Stagiaire'}</span>
                   </h1>
                </div>
             </div>

             <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 32 }}>
                <div style={{ height: 60, width: 1, background: 'rgba(255,255,255,0.1)' }} />
                <div>
                   <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>Impact Consolider GIAS</p>
                   <div style={{ fontSize: 52, fontWeight: 900, color: 'white', lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      {noteTotale.toFixed(1)} <span style={{ fontSize: 18, color: '#D4AF37', fontWeight: 600 }}>/ 100</span>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* ── Main Content Container ── */}
       <div style={{ maxWidth: 1100, margin: '-60px auto 0', padding: '0 24px', position: 'relative', zIndex: 20 }}>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
             
             {/* Section 1: Contexte Global */}
             <div className="form-glass" style={{ padding: 48 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
                   <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#001D3D', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TargetIcon size={18} />
                   </div>
                   <h2 style={{ fontSize: 13, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>Répertoire du Bilan</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
                   <div className="ev-input-container">
                      <label style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 12 }}>Talent sélectionné</label>
                      <div style={{ position: 'relative' }}>
                         <select name="stage_id" className="ev-input" value={formData.stage_id} onChange={handleChange} disabled={isEditing} required>
                            <option value="">Collaborateur...</option>
                            {stagiaires.map(stag => <option key={stag.id} value={stag.id}>{stag.utilisateur?.prenom} {stag.utilisateur?.nom}</option>)}
                         </select>
                         <ChevronDown className="ev-select-icon" />
                      </div>
                   </div>

                   <div className="ev-input-container">
                      <label style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 12 }}>Nature de l'Évaluation</label>
                      <div style={{ position: 'relative' }}>
                         <select name="type" className="ev-input" value={formData.type} onChange={handleChange} required>
                            {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                         </select>
                         <ChevronDown className="ev-select-icon" />
                      </div>
                   </div>

                   <div className="ev-input-container">
                      <label style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 12 }}>Date de Clôture</label>
                      <input type="date" name="date_evaluation" className="ev-input" value={formData.date_evaluation} onChange={handleChange} />
                   </div>
                </div>
             </div>

             {/* Section 2: KPIs & Scores */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, paddingLeft: 8 }}>
                   <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#D4AF37', color: '#001D3D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={18} />
                   </div>
                   <h2 style={{ fontSize: 13, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>Analyse des Indicateurs de Performance</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32 }}>
                   {Object.entries(CRITERIA).map(([key, crit]) => {
                      const val = formData[`note_${key}`];
                      const pct = (val / crit.max) * 100;
                      return (
                         <div key={key} className="kpi-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                               <div style={{ width: 56, height: 56, borderRadius: 20, background: `${crit.color}10`, color: crit.color, display: 'flex', alignPosition: 'center', alignItems: 'center', justifyContent: 'center' }}>
                                  {crit.icon}
                               </div>
                               <div style={{ textAlign: 'right' }}>
                                  <p style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>Note / {crit.max}</p>
                                  <input 
                                    type="number" name={`note_${key}`} value={val} onChange={handleChange} 
                                    style={{ width: 80, fontSize: 32, fontWeight: 900, background: 'none', border: 'none', outline: 'none', color: '#001D3D', textAlign: 'right' }} 
                                  />
                               </div>
                            </div>
                            
                            <h3 style={{ fontSize: 15, fontWeight: 900, color: '#001D3D', marginBottom: 8 }}>{crit.label}</h3>
                            <p style={{ fontSize: 12, color: '#64748B', fontWeight: 500, lineHeight: 1.5, marginBottom: 32 }}>{crit.desc}</p>
                            
                            <div style={{ height: 10, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
                               <div style={{ width: `${pct}%`, height: '100%', background: crit.color, borderRadius: 99, transition: 'width 1s cubic-bezier(0.165, 0.84, 0.44, 1)' }} />
                            </div>
                         </div>
                      );
                   })}
                </div>
             </div>

             {/* Section 3: Analyse Qualite */}
             <div className="form-glass" style={{ padding: 48, display: 'flex', flexDirection: 'column', gap: 48 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                   <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#007F82', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ClipboardCheck size={18} />
                   </div>
                   <h2 style={{ fontSize: 13, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>Synthèse et Plans d'Actions</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                   <div>
                      <label style={{ fontSize: 10, fontWeight: 900, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                         <Sparkles size={14} /> Points de Force Notables
                      </label>
                      <textarea name="points_forts" className="ev-input" style={{ minHeight: 180, resize: 'none', background: '#F8FAFC', padding: 24 }} value={formData.points_forts} onChange={handleChange} placeholder="Distinguer les compétences acquises..." />
                   </div>
                   <div>
                      <label style={{ fontSize: 10, fontWeight: 900, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                         <MousePointer2 size={14} /> Axes de Développement Prioritaires
                      </label>
                      <textarea name="axes_amelioration" className="ev-input" style={{ minHeight: 180, resize: 'none', background: '#F8FAFC', padding: 24 }} value={formData.axes_amelioration} onChange={handleChange} placeholder="Identifier les freins à la performance..." />
                   </div>
                </div>

                <div>
                   <label style={{ fontSize: 10, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 16 }}>Recommandations Finales du Tuteur</label>
                   <textarea name="commentaire_tuteur" className="ev-input" style={{ minHeight: 140, resize: 'none', background: '#F8FAFC', padding: 24 }} value={formData.commentaire_tuteur} onChange={handleChange} placeholder="Avis global sur la suite du parcours..." />
                </div>
             </div>

          </form>
       </div>

       {/* ── Fixed Premium Action Bar ── */}
       <div className="floating-bar">
          <button 
            onClick={() => onClose ? onClose() : navigate('/evaluations')} 
            style={{ padding: '0 32px', height: 56, border: 'none', background: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', transition: '0.3s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            Annuler
          </button>
          
          <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)' }} />
          
          <button 
            onClick={(e) => handleSubmit(e, false)} 
            disabled={loading}
            style={{ padding: '0 32px', height: 56, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, color: 'white', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: '0.3s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
             <Save size={18} style={{ color: '#D4AF37' }} /> Enregistrer Brouillon
          </button>
          
          <button 
            onClick={(e) => handleSubmit(e, true)} 
            disabled={loading}
            style={{ padding: '0 48px', height: 56, background: '#D4AF37', color: '#001D3D', border: 'none', borderRadius: 20, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: '0.3s', boxShadow: '0 4px 15px rgba(212,175,55,0.2)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(212,175,55,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(212,175,55,0.2)'; }}
          >
             Finaliser & Transmettre <Send size={18} />
          </button>
       </div>
    </div>
  );
}
