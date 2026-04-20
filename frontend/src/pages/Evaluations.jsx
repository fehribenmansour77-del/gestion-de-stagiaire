/**
 * Page: Registre des Performances — GIAS Premium V6
 * Système de pilotage de la performance et validation administrative.
 * Design professionnel (Navy & Gold), Glassmorphism, Expérience interactive.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEvaluations, validateEvaluationRH, rejectEvaluationRH, generateEvaluationPDF } from '../services/evaluationService';
import { getStagiaires } from '../services/stagiaireService';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Download, 
  RefreshCw,
  User,
  Star,
  Calendar,
  Clock,
  AlertCircle,
  X,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  MoreHorizontal,
  ArrowRight,
  Plus,
  BarChart3,
  Award,
  Zap,
  Target
} from 'lucide-react';
import { toast } from '../store/useToastStore';
import { useNavigate } from 'react-router-dom';

/* ── Global Styles & Keyframes ── */
const injectStyles = `
@keyframes evSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes evFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes evPulseGlow {
  0% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
  100% { opacity: 0.3; transform: scale(1); }
}
.ev-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
}
.ev-select-reset {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23001D3D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}
`;

const StatusBadge = ({ status }) => {
  const configs = {
    BROUILLON: { label: 'Brouillon', color: '#64748B', bg: 'rgba(100, 116, 139, 0.1)', icon: <Clock size={10} /> },
    SOUMISE: { label: 'En attente RH', color: '#D4AF37', bg: 'rgba(212, 175, 55, 0.1)', icon: <RefreshCw size={10} className="animate-spin" /> },
    VALIDEE_RH: { label: 'Dossier Validé', color: '#059669', bg: 'rgba(5, 150, 105, 0.1)', icon: <CheckCircle2 size={10} /> },
    REFUSEE: { label: 'Rejeté', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.1)', icon: <XCircle size={10} /> }
  };
  
  const config = configs[status] || { label: status, color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.1)', icon: <Award size={10} /> };
  
  return (
    <div style={{ 
      display: 'inline-flex', alignItems: 'center', gap: 6, 
      padding: '4px 12px', borderRadius: 100, 
      background: config.bg, border: `1px solid ${config.color}33`,
      color: config.color, fontSize: 9, fontWeight: 800, 
      textTransform: 'uppercase', letterSpacing: '0.1em'
    }}>
      {config.icon}
      {config.label}
    </div>
  );
};

const Evaluations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ type: '', statut: '' });
  const [showModal, setShowModal] = useState(false);
  const [selectedEval, setSelectedEval] = useState(null);
  const [rejectComment, setRejectComment] = useState('');

  const isRH = user?.role === 'admin_rh' || user?.role === 'super_admin';
  const isTuteur = user?.role === 'tuteur' || user?.role === 'chef_departement';

  useEffect(() => {
    loadData();
  }, [filter, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.type) params.type = filter.type;
      if (filter.statut) params.statut = filter.statut;
      if (user?.role === 'stagiaire' && user?.stagiaire_active) {
        params.stage_id = user.stagiaire_active.id;
      }
      const res = await getEvaluations(params);
      setEvaluations(res.evaluations || []);
    } catch (err) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id) => {
    if (!confirm('Souhaitez-vous valider officiellement cette évaluation ?')) return;
    try {
      await validateEvaluationRH(id);
      toast.success('Validation confirmée');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReject = async () => {
    if (!rejectComment) { toast.warning('Commentaire obligatoire'); return; }
    try {
      await rejectEvaluationRH(selectedEval.id, rejectComment);
      setShowModal(false);
      setRejectComment('');
      toast.success('Évaluation renvoyée au tuteur');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleGeneratePDF = async (id) => {
    try {
      toast.info('Génération PDF...');
      await generateEvaluationPDF(id);
      toast.success('Prêt');
    } catch (err) {
      toast.error('Erreur PDF');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', background: '#F8FAFC', 
      fontFamily: "'DM Sans', sans-serif", color: '#001D3D',
      paddingBottom: 80
    }}>
      <style>{injectStyles}</style>

      {/* Decorative Orbs */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)', animation: 'evPulseGlow 10s infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-5%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(0,29,61,0.03) 0%, transparent 70%)', animation: 'evPulseGlow 12s infinite 2s', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px', position: 'relative', zIndex: 10 }}>
        
        {/* ── Header Structure ── */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', 
          marginBottom: 64, animation: 'evSlideUp 0.8s ease', gap: 40, flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, background: '#001D3D', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', boxShadow: '0 8px 20px rgba(0,29,61,0.2)' }}>
                <Award size={24} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 900, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Excellence GIAS</span>
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#001D3D', letterSpacing: '-0.02em', margin: 0 }}>
              Registre des <span style={{ color: '#D4AF37', italic: 'italic', fontStyle: 'italic', fontFamily: 'serif', fontWeight: 400 }}>Performances</span>
            </h1>
            <p style={{ fontSize: 17, color: '#64748B', maxWidth: 500, marginTop: 12, lineHeight: 1.6, fontWeight: 500 }}>
              Analyse consolidée des compétences et validation administrative des parcours de stage.
            </p>
          </div>

          <div style={{ 
            display: 'flex', alignItems: 'center', gap: 12, 
            background: '#FFFFFF', padding: 12, borderRadius: 24,
            boxShadow: '0 10px 30px rgba(0,29,61,0.04)', border: '1px solid #E2E8F0'
          }}>
            <div style={{ textAlign: 'center', padding: '0 24px' }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Dossiers</p>
              <p style={{ fontSize: 24, fontWeight: 900, color: '#001D3D', margin: 0 }}>{evaluations.length}</p>
            </div>
            <div style={{ width: 1, height: 40, background: '#E2E8F0' }} />
            {isTuteur && (
              <button 
                onClick={() => navigate('/evaluations/new')}
                style={{
                  padding: '16px 24px', background: '#001D3D', color: '#FFFFFF',
                  borderRadius: 16, border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
                  display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.3s'
                }}
              >
                <Plus size={18} style={{ color: '#D4AF37' }} /> Nouveau Bilan
              </button>
            )}
            <button 
              onClick={loadData}
              className="ev-refresh"
              style={{
                width: 52, height: 52, borderRadius: 16, border: 'none', background: '#F8FAFC', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#001D3D', transition: 'all 0.3s'
              }}
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* ── Filter Module (Glass) ── */}
        <div className="ev-glass" style={{ 
          padding: 24, borderRadius: 32, marginBottom: 48,
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24,
          boxShadow: '0 20px 40px rgba(0,29,61,0.03)', animation: 'evFadeIn 1s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748B', paddingRight: 24, borderRight: '1px solid rgba(0,29,61,0.1)' }}>
            <Filter size={18} />
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Filtrage</span>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <select 
              className="ev-select-reset"
              value={filter.type} 
              onChange={e => setFilter({...filter, type: e.target.value})}
              style={{
                width: '100%', height: 56, background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,29,61,0.1)',
                borderRadius: 16, padding: '0 40px 0 20px', fontSize: 14, fontWeight: 700, color: '#001D3D', outline: 'none'
              }}
            >
              <option value="">Tous les bilans</option>
              <option value="INTEGRATION">Entretien d'Intégration</option>
              <option value="MI_PARCOURS">Bilan de Mi-parcours</option>
              <option value="FINALE">Évaluation Finale</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <select 
              className="ev-select-reset"
              value={filter.statut} 
              onChange={e => setFilter({...filter, statut: e.target.value})}
              style={{
                width: '100%', height: 56, background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,29,61,0.1)',
                borderRadius: 16, padding: '0 40px 0 20px', fontSize: 14, fontWeight: 700, color: '#001D3D', outline: 'none'
              }}
            >
              <option value="">Tous les statuts RH</option>
              <option value="BROUILLON">Brouillons Tuteur</option>
              <option value="SOUMISE">Attente Validation</option>
              <option value="VALIDEE_RH">Dossiers Archivés</option>
              <option value="REFUSEE">Dossiers Rejetés</option>
            </select>
          </div>

          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#001D3D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
            <Target size={22} />
          </div>
        </div>

        {/* ── List Register ── */}
        <div style={{ display: 'grid', gap: 20 }}>
          {evaluations.length === 0 && !loading ? (
            <div style={{ background: '#FFFFFF', borderRadius: 32, padding: 100, textAlign: 'center', border: '1px solid #E2E8F0', animation: 'evFadeIn 0.8s' }}>
              <div style={{ width: 80, height: 80, background: '#F8FAFC', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1' }}>
                <ClipboardCheck size={40} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#001D3D', margin: '0 0 12px' }}>Registre vide</h3>
              <p style={{ fontSize: 15, color: '#64748B', maxWidth: 400, margin: '0 auto' }}>Aucun bilan ne correspond aux critères de sélection actuels.</p>
            </div>
          ) : (
            evaluations.map((eval_, idx) => {
              const score = parseFloat(eval_.note_totale) || 0;
              const color = score >= 75 ? '#059669' : score >= 50 ? '#D4AF37' : '#DC2626';
              
              return (
                <div key={eval_.id} style={{ 
                  background: '#FFFFFF', borderRadius: 32, border: '1px solid #E2E8F0',
                  boxShadow: '0 10px 30px rgba(0,29,61,0.02)', position: 'relative',
                  overflow: 'hidden', transition: 'all 0.3s ease',
                  animation: `evSlideUp 0.6s ease ${idx * 0.1}s both`,
                  cursor: 'pointer'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,29,61,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,29,61,0.02)'; }}
                >
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: color }} />
                  
                  <div style={{ padding: '32px 40px', display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
                    
                    {/* Identity Slot */}
                    <div style={{ width: 280, display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div style={{ 
                        width: 60, height: 60, borderRadius: 18, background: '#001D3D', 
                        color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 900, border: '4px solid #F1F5F9'
                      }}>
                        {eval_.stagiaire?.prenom?.charAt(0)}{eval_.stagiaire?.nom?.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#001D3D', margin: 0 }}>
                          {eval_.stagiaire?.prenom} {eval_.stagiaire?.nom}
                        </h3>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                          Témoin: <span style={{ color: '#001D3D' }}>{eval_.tuteur?.prenom || '--'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Data Grid */}
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, minWidth: 600 }}>
                      
                      <div style={{ spaceY: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>Concept Bilan</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: '#001D3D' }}>
                          <FileText size={16} style={{ color: '#D4AF37' }} />
                          {eval_.type.replace('_', ' ')}
                        </div>
                      </div>

                      <div style={{ spaceY: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <p style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Score Global</p>
                          <span style={{ fontSize: 11, fontWeight: 900, color: '#001D3D' }}>{score}%</span>
                        </div>
                        <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 4, transition: 'width 1s ease' }} />
                        </div>
                      </div>

                      <div style={{ spaceY: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>Mention</p>
                        <div style={{ display: 'inline-flex', padding: '4px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12, fontWeight: 900, color: '#001D3D' }}>
                          {eval_.mention || '--'}
                        </div>
                      </div>

                      <div style={{ spaceY: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>Statut RH</p>
                        <StatusBadge status={eval_.statut} />
                      </div>

                    </div>

                    {/* Quick Tools */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 32, borderLeft: '1px solid #F1F5F9' }}>
                      {isRH && eval_.statut === 'SOUMISE' && (
                        <>
                          <button 
                            onClick={e => { e.stopPropagation(); handleValidate(eval_.id); }}
                            style={{ 
                              width: 44, height: 44, borderRadius: 12, background: '#059669', color: '#FFFFFF', 
                              border: 'none', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: '0 8px 16px rgba(5,150,105,0.2)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={e => { e.stopPropagation(); setSelectedEval(eval_); setShowModal(true); }}
                            style={{ 
                              width: 44, height: 44, borderRadius: 12, background: '#DC2626', color: '#FFFFFF', 
                              border: 'none', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: '0 8px 16px rgba(220,38,38,0.2)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      {(eval_.statut === 'VALIDEE_RH' || eval_.statut === 'SOUMISE') && (
                        <button 
                          onClick={e => { e.stopPropagation(); handleGeneratePDF(eval_.id); }}
                          style={{ 
                            width: 44, height: 44, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#001D3D', transition: 'all 0.3s'
                          }}
                        >
                          <Download size={18} />
                        </button>
                      )}
                      <button 
                         onClick={() => navigate(`/evaluations/${eval_.id}`)}
                         style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: 8 }}
                      >
                         <ChevronRight size={24} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Decision Modal (Premium) ── */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'evFadeIn 0.3s' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,29,61,0.6)', backdropFilter: 'blur(10px)' }} onClick={() => setShowModal(false)} />
            <div className="ev-glass" style={{ width: '100%', maxWidth: 640, borderRadius: 40, overflow: 'hidden', position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.3)' }}>
              <div style={{ background: '#001D3D', padding: '40px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 20, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                    <AlertTriangle size={28} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF', margin: 0 }}>Notification de Refus</h4>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 4 }}>Contrôle de conformité RH</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><X size={32} /></button>
              </div>
              
              <div style={{ padding: '60px' }}>
                <div style={{ padding: 24, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 24, marginBottom: 32, fontSize: 14, color: '#DC2626', fontWeight: 600, lineHeight: 1.6 }}>
                  Le bilan sera renvoyé immédiatement au tuteur. Veuillez motiver cette décision administrative ci-dessous.
                </div>
                
                <label style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: 12, marginLeft: 8 }}>Motif de refus :</label>
                <textarea 
                  value={rejectComment}
                  onChange={e => setRejectComment(e.target.value)}
                  placeholder="Expliquez les raisons du rejet..."
                  style={{
                    width: '100%', height: 160, background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 24,
                    padding: 24, fontSize: 15, fontWeight: 600, color: '#001D3D', outline: 'none', transition: 'all 0.3s',
                    resize: 'none', fontFamily: 'inherit'
                  }}
                  onFocus={e => { e.target.style.borderColor = '#001D3D'; e.target.style.background = '#FFFFFF'; }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC'; }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 40 }}>
                   <button 
                     onClick={() => setShowModal(false)}
                     style={{ padding: '20px 32px', background: 'none', border: 'none', fontSize: 12, fontWeight: 800, color: '#94A3B8', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                   >Annuler</button>
                   <button 
                     onClick={handleReject}
                     style={{ 
                       padding: '20px 48px', background: '#DC2626', color: '#FFFFFF', borderRadius: 20, 
                       border: 'none', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
                       cursor: 'pointer', boxShadow: '0 10px 20px rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', gap: 12
                     }}
                   >Confirmer le Renvoi <ArrowRight size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Evaluations;
