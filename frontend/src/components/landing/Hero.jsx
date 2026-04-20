import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  UserPlus, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  Target,
  Globe
} from 'lucide-react';

export default function Hero() {
  const { user } = useAuth();
  const [showTrackInput, setShowTrackInput] = useState(false);
  const [trackNumber, setTrackNumber] = useState('');
  const navigate = useNavigate();

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackNumber.trim()) {
      navigate(`/candidature/suivi?numero=${trackNumber.trim()}`);
    }
  };

  const styles = {
    section: {
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      background: '#FFFFFF',
      overflow: 'hidden',
      paddingTop: 84, // Header height
    },
    ornament: {
      position: 'absolute',
      background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, transparent 70%)',
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: 1,
    },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(0, 29, 61, 0.06)',
      borderRadius: 32,
      padding: '40px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04)',
    }
  };

  return (
    <section style={styles.section}>
      {/* ── Background Ornaments ── */}
      <div style={{...styles.ornament, top: '-10%', right: '-10%', width: 800, height: 800, animation: 'loginPulseGlow 10s ease-in-out infinite'}} />
      <div style={{...styles.ornament, bottom: '-5%', left: '-5%', width: 600, height: 600, background: 'linear-gradient(135deg, rgba(0,29,61,0.03) 0%, transparent 70%)', animation: 'loginPulseGlow 12s ease-in-out infinite 2s'}} />
      
      <div style={{
        position: 'absolute', top: '15%', left: '45%',
        width: 60, height: 60, border: '1px solid rgba(212,175,55,0.1)',
        borderRadius: 16, transform: 'rotate(45deg)',
        animation: 'regFloat 9s ease-in-out infinite',
        zIndex: 1,
      }} />

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* LEFT CONTENT */}
          <div className="flex-1 text-left" style={{ animation: 'regSlideUp 0.8s ease' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: 100, padding: '8px 20px', marginBottom: 32,
              animation: 'regSlideUp 0.8s ease 0.1s both'
            }}>
              <Sparkles size={14} style={{ color: '#D4AF37' }} />
              <span style={{ color: '#001D3D', fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Excellence Industrielle v6
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(44px, 6vw, 84px)',
              fontWeight: 900,
              color: '#001D3D',
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              margin: '0 0 32px',
              animation: 'regSlideUp 0.8s ease 0.2s both'
            }}>
              L'Art des <br />
              <span style={{ color: '#D4AF37' }}>Ingrédients</span>
            </h1>

            <p style={{
              fontSize: 20,
              color: '#64748B',
              lineHeight: 1.6,
              maxWidth: 580,
              margin: '0 0 48px',
              fontFamily: "'DM Sans', sans-serif",
              animation: 'regSlideUp 0.8s ease 0.3s both'
            }}>
              Rejoignez <span style={{ color: '#001D3D', fontWeight: 800 }}>CSM GIAS</span>. 
              Nous transformons la passion en expertise pour les professionnels de la pâtisserie mondiale.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-5" style={{ animation: 'regSlideUp 0.8s ease 0.4s both' }}>
              <Link 
                to={user ? "/candidature" : "/register"} 
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '18px 40px',
                  background: 'linear-gradient(135deg, #001D3D 0%, #002855 100%)',
                  color: '#FFFFFF',
                  borderRadius: 100,
                  fontSize: 12, fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.2em',
                  textDecoration: 'none',
                  boxShadow: '0 10px 30px rgba(0, 29, 61, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 29, 61, 0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 29, 61, 0.2)';
                }}
              >
                <UserPlus size={18} style={{ color: '#D4AF37' }} />
                {user ? "Ma Candidature" : "Rejoindre l'élite"}
              </Link>

              {!user && (
                <Link 
                  to="/login" 
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '18px 40px',
                    background: '#FFFFFF',
                    color: '#001D3D',
                    borderRadius: 100,
                    fontSize: 12, fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.2em',
                    textDecoration: 'none',
                    border: '1.5px solid #E2E8F0',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#001D3D';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  Identifiez-vous
                </Link>
              )}
            </div>

            {/* Track Dossier */}
            <div style={{ marginTop: 64, borderTop: '1px solid rgba(0, 29, 61, 0.06)', paddingTop: 40, maxWidth: 440 }}>
              {!showTrackInput ? (
                <button 
                  onClick={() => setShowTrackInput(true)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 16,
                    color: '#001D3D', transition: 'all 0.3s',
                    padding: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                  onMouseLeave={e => e.currentTarget.style.color = '#001D3D'}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: '#F8FAFC', border: '1.5px solid #E2E8F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s',
                  }} className="track-icon-container">
                    <Search size={18} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                    Suivre ma candidature
                  </span>
                </button>
              ) : (
                <form 
                  onSubmit={handleTrackSubmit}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 8px 8px 24px', background: '#F8FAFC',
                    borderRadius: 100, border: '2px solid #001D3D',
                    animation: 'regSlideUp 0.3s ease',
                  }}
                >
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Numéro de dossier..."
                    style={{
                      flex: 1, background: 'transparent', border: 'none',
                      outline: 'none', fontSize: 13, fontWeight: 600,
                      color: '#001D3D', fontFamily: "'DM Sans', sans-serif",
                    }}
                    value={trackNumber}
                    onChange={(e) => setTrackNumber(e.target.value)}
                  />
                  <button 
                    type="submit"
                    style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: '#001D3D', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFFFFF', transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <ArrowRight size={18} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowTrackInput(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px', color: '#94A3B8' }}
                  >
                    ×
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT VISUAL */}
          <div className="flex-1 hidden lg:block" style={{ animation: 'regSlideUp 1s ease 0.2s both' }}>
              <div style={{
                borderRadius: 40, overflow: 'hidden', height: 580,
                position: 'relative',
                animation: 'evSlideLeft 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) both'
              }}>
              <div style={{
                borderRadius: 40, overflow: 'hidden', height: 580,
                position: 'relative',
              }}>
                <img 
                  src="/hero-visual.png" 
                  alt="CSM GIAS Excellence" 
                  style={{ width: '100%', height: '100%', objectCover: 'cover', filter: 'contrast(1.05) brightness(1.02)' }}
                />
                <div style={{
                  position: 'absolute', inset: 0, 
                  background: 'linear-gradient(180deg, transparent 40%, rgba(0, 29, 61, 0.8) 100%)',
                }} />
                
                {/* Float Card */}
                <div style={{
                  position: 'absolute', bottom: 40, left: 40, right: 40,
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 24, padding: '24px 32px',
                  display: 'flex', alignItems: 'center', gap: 20,
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: '#D4AF37', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)',
                    color: '#001D3D',
                  }}>
                    <Target size={24} />
                  </div>
                  <div>
                    <h4 style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 800, margin: 0 }}>Standard International</h4>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', margin: '4px 0 0' }}>
                      Certification ISO — GIAS Group
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative side element */}
              <div style={{
                position: 'absolute', top: -30, right: -30,
                width: 140, height: 140, borderRadius: '50%',
                background: 'linear-gradient(135deg, #001D3D 0%, #002855 100%)',
                zIndex: -1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(0, 29, 61, 0.2)',
              }}>
                <div style={{ color: '#D4AF37', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>30+</div>
                  <div style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Années</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}