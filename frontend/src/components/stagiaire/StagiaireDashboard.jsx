/**
 * Component: StagiaireDashboard — GIAS Premium V6
 * Tableau de bord immersif pour le suivi de stage et de candidature.
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  UserCircle, 
  ArrowRight, 
  Activity, 
  Star,
  FileText,
  MapPin,
  Building2,
  Phone,
  MessageSquare,
  Sparkles,
  Zap,
  Target,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

/* ── Local Styles (V6) ── */
const injectStyles = `
@keyframes daSlideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes daPulseGlow {
  0% { opacity: 0.1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(1.2); }
  100% { opacity: 0.1; transform: scale(1); }
}
.da-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
}
.da-nav-item:hover {
  background: #001D3D;
  color: #FFFFFF !important;
  transform: translateX(8px);
}
`;

const StagiaireDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const candidature = user?.candidature;
  const stage = user?.stagiaire_active;

  const statusLabels = {
    en_attente: { label: 'En attente', color: '#D4AF37', icon: <Clock size={28}/> },
    entretien: { label: 'Entretien prévu', color: '#007F82', icon: <Calendar size={28}/> },
    acceptee: { label: 'Candidature Acceptée', color: '#059669', icon: <CheckCircle2 size={28}/> },
    refusee: { label: 'Dossier Refusé', color: '#DC2626', icon: <Activity size={28}/> },
  };

  const currentStatus = statusLabels[candidature?.statut] || { label: candidature?.statut || 'En examen', color: '#001D3D', icon: <FileText size={28}/> };

  return (
    <div style={{ padding: '40px 0', position: 'relative' }}>
      <style>{injectStyles}</style>

      {/* Background Ambience */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: 600, height: 600, background: 'radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%)', animation: 'daPulseGlow 8s infinite' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', animation: 'daSlideUp 0.8s ease' }}>
        
        {/* ── Immersive Welcome Header ── */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', 
          marginBottom: 80, paddingBottom: 60, borderBottom: '1px solid #E2E8F0',
          flexWrap: 'wrap', gap: 40
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Zap size={16} style={{ color: '#D4AF37' }} />
              <span style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Espace Talent · GIAS Industries</span>
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, color: '#001D3D', letterSpacing: '-0.02em', margin: 0 }}>
              Bonjour, <span style={{ color: '#D4AF37', fontStyle: 'italic', fontFamily: 'serif', fontWeight: 400 }}>{user?.prenom}</span>.
            </h1>
            <p style={{ fontSize: 18, color: '#64748B', maxWidth: 600, marginTop: 16, lineHeight: 1.6, fontWeight: 500 }}>
              {stage 
                ? `Bienvenue sur votre console de performance. Votre stage au département Production progresse avec succès.`
                : `Suivez l'évolution de votre dossier de candidature au sein de notre pôle d'excellence.`}
            </p>
          </div>

          <div style={{ 
            background: '#001D3D', padding: '24px 32px', borderRadius: 32, 
            display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 20px 40px rgba(0,29,61,0.1)'
          }}>
            <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.1)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <p style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>Statut Actuel</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>{currentStatus.label}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 60, flexWrap: 'wrap' }}>
          
          {/* ── Main content (Progress & Stats) ── */}
          <div style={{ spaceY: 60 }}>
            
            <section>
               <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                 <div style={{ width: 6, height: 24, background: '#D4AF37', borderRadius: 3 }} />
                 <h3 style={{ fontSize: 18, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Évolution du Dossier</h3>
               </div>

               <div style={{ 
                 background: '#FFFFFF', borderRadius: 48, border: '1px solid #E2E8F0', padding: 60,
                 boxShadow: '0 30px 60px rgba(0,29,61,0.03)', position: 'relative', overflow: 'hidden',
                 transition: 'all 0.5s ease'
               }}
               onMouseEnter={e => e.currentTarget.style.boxShadow = '0 40px 100px rgba(0,29,61,0.06)'}
               onMouseLeave={e => e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,29,61,0.03)'}
               >
                 <div style={{ position: 'absolute', top: 0, right: 0, padding: 60, opacity: 0.02, color: '#001D3D' }}>
                   <Award size={200} />
                 </div>
                 
                 <div style={{ display: 'flex', gap: 40, alignItems: 'center', marginBottom: 60 }}>
                    <div style={{ 
                      width: 90, height: 90, borderRadius: 28, background: '#F8FAFC', border: '1px solid #E2E8F0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentStatus.color,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.04)'
                    }}>
                      {currentStatus.icon}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 24, fontWeight: 900, color: '#001D3D', margin: '0 0 8px' }}>Candidature {currentStatus.label}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#94A3B8' }}>
                         Réf: <span style={{ color: '#001D3D' }}>{candidature?.numero_suivi || 'GIAS-2026-PENDING'}</span>
                      </div>
                    </div>
                 </div>

                 <div style={{ padding: '32px', background: '#F8FAFC', borderRadius: 32, marginBottom: 40, border: '1px solid rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#D4AF37', boxShadow: '0 0 10px #D4AF37' }} />
                          <div style={{ width: 2, height: 60, background: 'linear-gradient(to bottom, #D4AF37, #E2E8F0)' }} />
                          <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #E2E8F0', background: '#FFFFFF' }} />
                       </div>
                       <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 10, fontWeight: 900, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>Prochaine Étape</p>
                          <p style={{ fontSize: 16, color: '#001D3D', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
                            Votre candidature est actuellement sous revue par la **Direction des Ressources Humaines**. Vous recevrez une notification d'ici peu.
                          </p>
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={() => navigate('/candidature/suivi')}
                   style={{
                     padding: '20px 40px', background: '#001D3D', color: '#FFFFFF',
                     borderRadius: 20, border: 'none', cursor: 'pointer',
                     fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
                     display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.3s'
                   }}
                   onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.background = '#002D5D'; }}
                   onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#001D3D'; }}
                 >
                   Suivre l'historique détaillé <ArrowRight size={18} style={{ color: '#D4AF37' }} />
                 </button>
               </div>
            </section>

            {stage && (
              <section style={{ marginTop: 60, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
                <div style={{ background: '#FFFFFF', borderRadius: 40, padding: 48, border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
                   <Star size={40} style={{ color: '#D4AF37', marginBottom: 24 }} />
                   <p style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 8 }}>Performance Stage</p>
                   <p style={{ fontSize: 44, fontWeight: 900, color: '#001D3D', margin: 0 }}>4.8<span style={{ fontSize: 18, color: '#CBD5E1' }}>/5</span></p>
                </div>
                <div style={{ background: '#FFFFFF', borderRadius: 40, padding: 48, border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
                   <Activity size={40} style={{ color: '#007F82', marginBottom: 24 }} />
                   <p style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 8 }}>Taux Présence</p>
                   <p style={{ fontSize: 44, fontWeight: 900, color: '#001D3D', margin: 0 }}>94<span style={{ fontSize: 18, color: '#CBD5E1' }}>%</span></p>
                </div>
              </section>
            )}

          </div>

          {/* ── Sidebar (Team & Support) ── */}
          <div style={{ spaceY: 48 }}>
            
            <section style={{ marginBottom: 48 }}>
               <h3 style={{ fontSize: 12, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 32 }}>L'Équipe GIAS</h3>
               <div style={{ display: 'grid', gap: 16 }}>
                  <div style={{ background: '#FFFFFF', borderRadius: 24, padding: 24, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 20 }}>
                     <div style={{ width: 56, height: 56, borderRadius: 16, background: '#001D3D', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900 }}>
                        {stage?.tuteur?.prenom?.charAt(0) || 'T'}
                     </div>
                     <div>
                        <p style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Mon Tuteur</p>
                        <p style={{ fontSize: 15, fontWeight: 900, color: '#001D3D', margin: 0 }}>M. {stage?.tuteur?.nom || 'Non assigné'}</p>
                     </div>
                  </div>
                  <div style={{ background: '#FFFFFF', borderRadius: 24, padding: 24, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 20 }}>
                     <div style={{ width: 56, height: 56, borderRadius: 16, background: '#F8FAFC', color: '#001D3D', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900 }}>
                        RH
                     </div>
                     <div>
                        <p style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Point de Contact</p>
                        <p style={{ fontSize: 15, fontWeight: 900, color: '#001D3D', margin: 0 }}>Direction Talents GIAS</p>
                     </div>
                  </div>
               </div>
            </section>

            {/* Quick Assistance Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, #001D3D 0%, #002D5D 100%)', 
              borderRadius: 40, padding: 48, color: '#FFFFFF', position: 'relative', overflow: 'hidden'
            }}>
               <div style={{ position: 'relative', zIndex: 10 }}>
                 <h4 style={{ fontSize: 24, fontWeight: 900, marginBottom: 16 }}>Besoin d'aide ?</h4>
                 <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 32, fontWeight: 500 }}>
                   Une question sur votre convention ou votre emploi du temps ? Notre équipe est prête à vous assister.
                 </p>
                 <button 
                   onClick={() => navigate('/notifications')}
                   style={{
                     width: '100%', padding: '20px', background: '#FFFFFF', color: '#001D3D',
                     border: 'none', borderRadius: 20, fontSize: 10, fontWeight: 900,
                     textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer', transition: 'all 0.3s'
                   }}
                   onMouseEnter={e => { e.currentTarget.style.background = '#D4AF37'; }}
                   onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
                 >
                    Ouvrir un ticket support
                 </button>
               </div>
               <MessageSquare style={{ position: 'absolute', right: -30, bottom: -30, width: 180, height: 180, color: 'rgba(255,255,255,0.03)', transform: 'rotate(15deg)' }} />
            </div>

          </div>

        </div>

        <p style={{ textAlign: 'center', marginTop: 100, fontSize: 10, fontWeight: 900, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.4em' }}>
          CSM GIAS © TALENT PORTAL V6.0 — EXCELLENCE & PERFORMANCE
        </p>

      </div>
    </div>
  );
};

export default StagiaireDashboard;
