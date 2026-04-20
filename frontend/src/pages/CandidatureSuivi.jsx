/**
 * Page: Suivi de Dossier — GIAS Premium V6
 * Système de suivi en temps réel des candidatures.
 * Design professionnel (Navy & Gold), Glassmorphism, Workflow interactif.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowLeft, 
  Loader2,
  Building2,
  GraduationCap,
  FileText,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Zap,
  Sparkles,
  SearchCode,
  ArrowRight
} from 'lucide-react';
import candidatureService from '../services/candidatureService';

/* ── Global Styles & Keyframes ── */
const injectStyles = `
@keyframes suiSlideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes suiPulseGlow {
  0% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
  100% { opacity: 0.3; transform: scale(1); }
}
@keyframes suiFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes suiSpinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

const StatusBadge = ({ status }) => {
  const configs = {
    'En attente': { color: '#D97706', bg: 'rgba(217, 119, 6, 0.08)', border: 'rgba(217, 119, 6, 0.2)', icon: <Clock size={12} /> },
    'Acceptée': { color: '#059669', bg: 'rgba(5, 150, 105, 0.08)', border: 'rgba(5, 150, 105, 0.2)', icon: <CheckCircle2 size={12} /> },
    'Refusée': { color: '#E11D48', bg: 'rgba(225, 29, 72, 0.08)', border: 'rgba(225, 29, 72, 0.2)', icon: <XCircle size={12} /> },
    'En cours': { color: '#007F82', bg: 'rgba(0, 127, 130, 0.08)', border: 'rgba(0, 127, 130, 0.2)', icon: <RefreshCw size={12} className="animate-spin" /> }
  };

  const config = configs[status] || configs['En attente'];

  return (
    <div style={{ 
      display: 'inline-flex', alignItems: 'center', gap: 8, 
      padding: '6px 16px', borderRadius: 100, 
      background: config.bg, border: `1px solid ${config.border}`,
      color: config.color, fontSize: 10, fontWeight: 800, 
      textTransform: 'uppercase', letterSpacing: '0.1em'
    }}>
      {config.icon}
      {status}
    </div>
  );
};

const TimelineStep = ({ title, desc, date, isDone, isCurrent, isLast }) => (
  <div style={{ 
    position: 'relative', paddingLeft: 60, paddingBottom: 48,
    borderLeft: isLast ? 'none' : '2px solid #E2E8F0',
    marginLeft: 15, animation: 'suiSlideUp 0.6s ease'
  }}>
    <div style={{ 
      position: 'absolute', left: -16, top: 0, 
      width: 30, height: 30, borderRadius: 10,
      background: isDone ? '#059669' : isCurrent ? '#001D3D' : '#FFFFFF',
      border: isDone || isCurrent ? 'none' : '2px solid #E2E8F0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: isDone || isCurrent ? '#FFFFFF' : '#94A3B8',
      zIndex: 10, transition: 'all 0.3s',
      boxShadow: isCurrent ? '0 0 20px rgba(0,29,61,0.2)' : 'none'
    }}>
      {isDone ? <CheckCircle2 size={16} /> : <div style={{ width: 6, height: 6, borderRadius: '50%', background: isCurrent ? '#D4AF37' : 'currentColor' }} />}
    </div>
    
    <div style={{ transform: 'translateY(-4px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <h4 style={{ 
          fontSize: 13, fontWeight: 800, color: isDone || isCurrent ? '#001D3D' : '#94A3B8', 
          textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 
        }}>
          {title}
        </h4>
        {date && (
          <span style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', background: '#F8FAFC', padding: '2px 8px', borderRadius: 4 }}>
            {date}
          </span>
        )}
      </div>
      <p style={{ 
        fontSize: 14, color: isDone || isCurrent ? '#64748B' : '#CBD5E1', 
        lineHeight: 1.6, margin: 0, fontWeight: 500 
      }}>
        {desc}
      </p>
    </div>
  </div>
);

export default function CandidatureSuivi() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [numero, setNumero] = useState(searchParams.get('numero') || '');
  const [loading, setLoading] = useState(false);
  const [candidature, setCandidature] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const num = searchParams.get('numero');
    if (num) {
      handleSearch(null, num);
    }
  }, [searchParams]);

  const handleSearch = async (e, directNum = null) => {
    if (e) e.preventDefault();
    const searchNum = directNum || numero;
    if (!searchNum.trim()) return;

    setLoading(true);
    setError(null);
    setCandidature(null);

    try {
      const response = await candidatureService.trackCandidature(searchNum);
      setCandidature(response);
    } catch (err) {
      setError(err.response?.data?.error || "Dossier introuvable. Vérifiez votre numéro de suivi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', background: '#F8FAFC', 
      fontFamily: "'DM Sans', sans-serif", color: '#001D3D',
      padding: '80px 20px'
    }}>
      <style>{injectStyles}</style>

      {/* Decorative Ornaments */}
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: 800, height: 800, background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)', animation: 'suiPulseGlow 10s infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(0,127,130,0.05) 0%, transparent 70%)', animation: 'suiPulseGlow 12s infinite 2s', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        {/* ── Page Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 80, animation: 'suiSlideUp 0.8s ease' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 10, fontWeight: 800, color: '#94A3B8',
              textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 32,
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#001D3D'}
            onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
          >
            <ArrowLeft size={14} /> Retour à l'accueil
          </button>
          
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, color: '#001D3D', letterSpacing: '-0.02em', margin: '0 0 16px' }}>
              Suivi de <span style={{ color: '#D4AF37', italic: 'italic', fontStyle: 'italic', fontFamily: 'serif', fontWeight: 400 }}>Dossier</span>
            </h1>
            <p style={{ fontSize: 18, color: '#64748B', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
              Consultez l'évolution de votre demande en temps réel. <br />
              Entrez l'identifiant unique reçu lors de votre inscription.
            </p>
          </div>
        </div>

        {/* ── Search Command Center ── */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)',
          border: '1px solid #FFFFFF', borderRadius: 40, padding: 12,
          boxShadow: '0 20px 50px rgba(0, 29, 61, 0.05)',
          marginBottom: 80, transition: 'all 0.4s ease',
          animation: 'suiFadeIn 1s'
        }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 300, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                <SearchCode size={20} />
              </div>
              <input 
                type="text"
                placeholder="GIAS-2026-XXXXX"
                value={numero}
                onChange={(e) => setNumero(e.target.value.toUpperCase())}
                style={{
                  width: '100%', height: 72, background: '#F8FAFC', border: 'none',
                  borderRadius: 32, padding: '0 32px 0 64px',
                  fontSize: 16, fontWeight: 800, color: '#001D3D',
                  letterSpacing: '0.1em', outline: 'none', transition: 'all 0.3s'
                }}
                onFocus={e => { e.target.parentElement.parentElement.style.boxShadow = '0 30px 60px rgba(0, 29, 61, 0.08)'; e.target.style.background = '#FFFFFF'; }}
                onBlur={e => { e.target.parentElement.parentElement.style.boxShadow = '0 20px 50px rgba(0, 29, 61, 0.05)'; e.target.style.background = '#F8FAFC'; }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                height: 72, padding: '0 48px', background: '#001D3D', color: '#FFFFFF',
                borderRadius: 32, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em',
                display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.3s',
                boxShadow: '0 10px 20px rgba(0,29,61,0.2)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  <ShieldCheck size={20} style={{ color: '#D4AF37' }} />
                  Vérifier l'état
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div style={{ 
            padding: '20px 32px', background: '#FEF2F2', border: '1px solid #FECACA', 
            borderRadius: 24, color: '#DC2626', fontSize: 13, fontWeight: 600, 
            display: 'flex', alignItems: 'center', gap: 16, marginBottom: 80,
            animation: 'suiSlideUp 0.4s ease'
          }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* ── Results Display ── */}
        {candidature && (
          <div style={{ animation: 'suiFadeIn 0.8s' }}>
            
            {/* Main Info Card */}
            <div style={{ 
              background: '#FFFFFF', borderRadius: 48, overflow: 'hidden',
              boxShadow: '0 30px 60px rgba(0,29,61,0.06)', marginBottom: 40,
              border: '1px solid #E2E8F0'
            }}>
              {/* Card Header */}
              <div style={{ 
                background: 'linear-gradient(135deg, #001D3D 0%, #002855 100%)', 
                padding: '60px', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(212,175,55,0.1)', borderRadius: '50%', blur: '50px' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32 }}>
                  <div style={{ spaceY: 24 }}>
                    <StatusBadge status={candidature.statut} />
                    <div style={{ marginTop: 24 }}>
                      <h2 style={{ fontSize: 44, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
                        {candidature.prenom} {candidature.nom}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                        <div style={{ width: 16, height: 2, background: '#D4AF37' }} />
                        <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.4em' }}>
                          DOSSIER ID: {candidature.numero_suivi}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24,
                    padding: '24px 32px', minWidth: 220
                  }}>
                    <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>Enregistré le</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                      {new Date(candidature.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ 
                padding: '60px', display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 
              }}>
                {[
                  { icon: GraduationCap, label: 'Formation', primary: candidature.etablissement, secondary: `${candidature.filiere} (${candidature.niveau})`, color: '#6366F1' },
                  { icon: Building2, label: 'Département', primary: candidature.Departement?.nom || "Non spécifié", secondary: `Type: ${candidature.type_stage.toUpperCase()}`, color: '#F59E0B' },
                  { icon: Calendar, label: 'Période de stage', primary: `Du ${new Date(candidature.date_debut).toLocaleDateString()}`, secondary: `Au ${new Date(candidature.date_fin).toLocaleDateString()}`, color: '#10B981' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 20 }}>
                    <div style={{ 
                      width: 52, height: 52, borderRadius: 16, 
                      background: `${item.color}08`, border: `1px solid ${item.color}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: item.color, flexShrink: 0
                    }}>
                      <item.icon size={26} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>{item.label}</p>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#001D3D', margin: '0 0 4px', lineHeight: 1.4 }}>{item.primary}</p>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#BFCADA' }}>{item.secondary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow / Administrative Path */}
            <div style={{ 
              background: '#FFFFFF', borderRadius: 48, padding: '60px 80px',
              boxShadow: '0 30px 60px rgba(0,29,61,0.04)', border: '1px solid #E2E8F0',
              marginBottom: 40, position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -40, right: -40, opacity: 0.02, color: '#001D3D' }}>
                <ShieldCheck size={240} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 60 }}>
                <div style={{ width: 6, height: 32, background: '#D4AF37', borderRadius: 3 }} />
                <h3 style={{ fontSize: 28, fontWeight: 900, color: '#001D3D', letterSpacing: '-0.02em', margin: 0 }}>Parcours Administratif</h3>
              </div>
              
              <div style={{ paddingLeft: 10 }}>
                <TimelineStep 
                  title="Réception du Dossier" 
                  desc="Confirmation de la réception et validation initiale des documents GIAS."
                  date={new Date(candidature.createdAt).toLocaleDateString()}
                  isDone={true}
                />
                <TimelineStep 
                  title="Évaluation RH & Talents" 
                  desc="Examen approfondi de la candidature par l'équipe de recrutement corporatif."
                  isCurrent={candidature.statut === 'En attente'}
                  isDone={candidature.statut !== 'En attente'}
                />
                <TimelineStep 
                  title="Validation par la Direction" 
                  desc="Approbation finale par le responsable du département d'accueil cible."
                  isCurrent={candidature.statut === 'En cours'}
                  isDone={['Acceptée', 'Refusée'].includes(candidature.statut)}
                />
                <TimelineStep 
                  title="Verdict Final" 
                  desc={candidature.statut === 'Refusée' ? "Le dossier n'a pas été retenu pour cette période. Merci de votre intérêt." : 
                        candidature.statut === 'Acceptée' ? "Candidature acceptée ! Notre équipe vous contactera pour la convention." : 
                        "En attente de la délibération finale du comité de direction."}
                  isDone={['Acceptée', 'Refusée'].includes(candidature.statut)}
                  isLast={true}
                />
              </div>
            </div>

            {/* Support Box */}
            <div style={{ 
              background: '#001D3D', borderRadius: 40, padding: 48,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: 40, border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ 
                  width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <FileText size={30} />
                </div>
                <div>
                  <h4 style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', margin: 0 }}>Centre de Support RH</h4>
                  <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 4 }}>
                    GIAS Industries — Département des Talents
                  </p>
                </div>
              </div>
              <a 
                href="mailto:rh@gias.com.tn"
                style={{
                  padding: '20px 48px', background: '#FFFFFF', color: '#001D3D',
                  borderRadius: 100, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
                  textDecoration: 'none', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: 12
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = '#D4AF37'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#FFFFFF'; }}
              >
                Contact par Email <ArrowRight size={16} />
              </a>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 80, fontSize: 10, fontWeight: 800, color: '#BFCADA', textTransform: 'uppercase', letterSpacing: '0.4em' }}>
          CSM GIAS © SYSTÈME DE SUIVI ÉLECTRONIQUE V6.0 — TUNISIE
        </p>
      </div>
    </div>
  );
}