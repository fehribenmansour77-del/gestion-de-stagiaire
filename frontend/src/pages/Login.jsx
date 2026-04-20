/**
 * Page: Accès Sécurisé — GIAS Premium V6
 * Interface d'authentification ultra-premium avec glassmorphism et animations.
 */

import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, ArrowRight, ChevronLeft, Lock, Mail, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email:    z.string().min(1, 'Email requis').email('Format email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

/* ── Keyframe styles injected once ── */
const injectStyles = `
@keyframes loginFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-12px) rotate(2deg); }
  66% { transform: translateY(6px) rotate(-1deg); }
}
@keyframes loginPulseGlow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.08); }
}
@keyframes loginGradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes loginSlideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes loginFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes loginShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes loginOrbit {
  0% { transform: rotate(0deg) translateX(120px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
}
`;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const userData = await login(data.email, data.password);
      
      // 1. Rediriger si on venait d'une page spécifique
      const from = location.state?.from?.pathname;
      if (from) { navigate(from, { replace: true }); return; }
      
      // 2. Redirection selon le rôle métier
      const role = userData?.role;
      if (['super_admin', 'admin_rh', 'chef_departement', 'tuteur'].includes(role)) {
        navigate('/dashboard', { replace: true });
      } else if (role === 'stagiaire') {
        navigate('/home-stagiaire', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{injectStyles}</style>
      <div style={{
        height: '100vh',
        display: 'flex',
        fontFamily: "'DM Sans', sans-serif",
        overflow: 'hidden',
        background: '#0A0F1C',
      }}>

        {/* ══════════════ LEFT PANEL — Immersive Brand ══════════════ */}
        <div style={{
          width: '45%',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          background: 'linear-gradient(135deg, #001229 0%, #001D3D 30%, #002855 60%, #001229 100%)',
          backgroundSize: '400% 400%',
          animation: 'loginGradientShift 12s ease infinite',
        }}>

          {/* Animated orbs */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <div style={{
              position: 'absolute', top: '15%', left: '20%',
              width: 300, height: 300, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
              animation: 'loginPulseGlow 6s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', bottom: '10%', right: '10%',
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,127,130,0.12) 0%, transparent 70%)',
              animation: 'loginPulseGlow 8s ease-in-out infinite 2s',
            }} />
            {/* Floating geometric shapes */}
            <div style={{
              position: 'absolute', top: '25%', right: '15%',
              width: 60, height: 60, border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: 16, transform: 'rotate(45deg)',
              animation: 'loginFloat 8s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', bottom: '30%', left: '10%',
              width: 40, height: 40, border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, transform: 'rotate(30deg)',
              animation: 'loginFloat 10s ease-in-out infinite 1s',
            }} />
            <div style={{
              position: 'absolute', top: '60%', right: '30%',
              width: 24, height: 24, borderRadius: '50%',
              background: 'rgba(212,175,55,0.08)',
              animation: 'loginFloat 7s ease-in-out infinite 3s',
            }} />
            {/* Grid pattern */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.03,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }} />
          </div>

          {/* Top: Logo */}
          <div style={{ position: 'relative', zIndex: 10, animation: 'loginFadeIn 1s ease' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', width: 'max-content' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'linear-gradient(135deg, #D4AF37, #F0D060)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(212,175,55,0.3)',
              }}>
                <span style={{ color: '#001D3D', fontSize: 22, fontWeight: 900, lineHeight: 1 }}>G</span>
              </div>
              <div>
                <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block' }}>
                  GIAS Industries
                </span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Portail Digital
                </span>
              </div>
            </Link>
          </div>

          {/* Middle: Hero text */}
          <div style={{ position: 'relative', zIndex: 10, animation: 'loginSlideUp 0.8s ease-out 0.3s both' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: 100, padding: '8px 18px', marginBottom: 32,
            }}>
              <Sparkles size={14} style={{ color: '#D4AF37' }} />
              <span style={{ color: '#D4AF37', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Espace Sécurisé
              </span>
            </div>

            <h1 style={{
              color: '#fff', fontSize: 52, fontWeight: 900,
              lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0,
            }}>
              L'excellence
            </h1>
            <h2 style={{
              fontSize: 52, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em',
              margin: '4px 0 0', padding: 0,
              background: 'linear-gradient(135deg, #D4AF37, #F0D060, #D4AF37)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'loginShimmer 4s linear infinite',
            }}>
              Digitale.
            </h2>

            <p style={{
              color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7,
              maxWidth: 320, marginTop: 28, fontStyle: 'italic',
              borderLeft: '2px solid rgba(212,175,55,0.3)', paddingLeft: 20,
            }}>
              "Bâtir l'industrie du futur en accompagnant les talents d'aujourd'hui."
            </p>

            {/* Feature pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 48 }}>
              {[
                { label: 'Certifié ISO 9001', sub: 'Standard de qualité groupe' },
                { label: 'Plateforme v6', sub: 'Innovation RH & Digitalisation' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  animation: `loginSlideUp 0.6s ease-out ${0.6 + i * 0.15}s both`,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #D4AF37, #F0D060)',
                    boxShadow: '0 0 12px rgba(212,175,55,0.4)',
                    flexShrink: 0,
                  }} />
                  <div>
                    <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0 }}>{item.label}</p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '2px 0 0' }}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: copyright */}
          <div style={{ position: 'relative', zIndex: 10, animation: 'loginFadeIn 1s ease 1s both' }}>
            <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 16 }} />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
              © 2026 GIAS Group — Industrial Portal
            </p>
          </div>
        </div>

        {/* ══════════════ RIGHT PANEL — Form ══════════════ */}
        <div style={{
          width: '55%',
          display: 'flex', flexDirection: 'column',
          height: '100%', overflow: 'auto',
          background: 'linear-gradient(180deg, #F7F8FC 0%, #EEF0F7 100%)',
        }}>

          {/* Top bar */}
          <div style={{
            padding: '24px 40px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            animation: 'loginFadeIn 0.6s ease',
          }}>
            <Link to="/" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: '#94A3B8', fontSize: 14, fontWeight: 500,
              textDecoration: 'none', transition: 'color 0.3s',
            }}>
              <ChevronLeft size={16} />
              Retour
            </Link>
          </div>

          {/* Centered form */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 40px 40px',
          }}>
            <div style={{
              width: '100%', maxWidth: 480,
              animation: 'loginSlideUp 0.7s ease-out 0.2s both',
            }}>
              {/* Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: 24,
                boxShadow: '0 4px 60px rgba(0,29,61,0.06), 0 1px 3px rgba(0,0,0,0.04)',
                border: '1px solid rgba(226,232,240,0.8)',
                padding: '48px 44px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Decorative top line */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: 'linear-gradient(90deg, #001D3D, #D4AF37, #007F82)',
                }} />

                {/* Icon */}
                <div style={{
                  display: 'flex', justifyContent: 'center', marginBottom: 28,
                }}>
                  <div style={{
                    width: 68, height: 68, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #001D3D, #002855)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0,29,61,0.2), 0 0 0 6px rgba(0,29,61,0.05)',
                    position: 'relative',
                  }}>
                    <ShieldCheck size={28} style={{ color: '#D4AF37' }} />
                    {/* Subtle ring */}
                    <div style={{
                      position: 'absolute', inset: -8, borderRadius: '50%',
                      border: '1px solid rgba(0,29,61,0.08)',
                    }} />
                  </div>
                </div>

                {/* Title */}
                <h2 style={{
                  textAlign: 'center', fontSize: 26, fontWeight: 800,
                  color: '#001D3D', margin: '0 0 8px', letterSpacing: '-0.02em',
                }}>
                  Bienvenue
                </h2>
                <p style={{
                  textAlign: 'center', color: '#94A3B8', fontSize: 14,
                  lineHeight: 1.6, margin: '0 auto 32px', maxWidth: 300,
                }}>
                  Saisissez vos identifiants pour accéder à votre espace de pilotage.
                </p>

                {/* Error Alert */}
                {error && (
                  <div style={{
                    marginBottom: 24, padding: '14px 18px',
                    background: 'linear-gradient(135deg, #FEF2F2, #FFF1F2)',
                    border: '1px solid #FECACA',
                    borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12,
                    animation: 'loginSlideUp 0.3s ease',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: '#FEE2E2', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <AlertCircle size={16} style={{ color: '#EF4444' }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#DC2626', lineHeight: 1.4 }}>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Email Field */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.12em', marginBottom: 10,
                      color: focusedField === 'email' ? '#001D3D' : '#64748B',
                      transition: 'color 0.3s',
                    }}>
                      <Mail size={13} />
                      E-mail Professionnel
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        {...register('email')}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                          color: '#001D3D',
                          background: focusedField === 'email' ? '#FFFFFF' : '#F8FAFC',
                          border: focusedField === 'email' ? '2px solid #001D3D' : '2px solid #E2E8F0',
                          borderRadius: 14,
                          outline: 'none',
                          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                          boxShadow: focusedField === 'email' ? '0 0 0 4px rgba(0,29,61,0.06)' : 'none',
                        }}
                        placeholder="nom.prenom@gias.com.tn"
                      />
                    </div>
                    {errors.email && (
                      <p style={{ fontSize: 12, color: '#EF4444', marginTop: 6, fontWeight: 600 }}>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: 10,
                    }}>
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        color: focusedField === 'password' ? '#001D3D' : '#64748B',
                        transition: 'color 0.3s',
                      }}>
                        <Lock size={13} />
                        Mot de passe
                      </label>
                      <Link to="#" style={{
                        fontSize: 12, fontWeight: 700, color: '#D4AF37',
                        textDecoration: 'none', transition: 'opacity 0.2s',
                      }}>
                        Oublié ?
                      </Link>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPw ? 'text' : 'password'}
                        {...register('password')}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        style={{
                          width: '100%',
                          padding: '14px 52px 14px 18px',
                          fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                          color: '#001D3D',
                          background: focusedField === 'password' ? '#FFFFFF' : '#F8FAFC',
                          border: focusedField === 'password' ? '2px solid #001D3D' : '2px solid #E2E8F0',
                          borderRadius: 14,
                          outline: 'none',
                          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                          boxShadow: focusedField === 'password' ? '0 0 0 4px rgba(0,29,61,0.06)' : 'none',
                        }}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        style={{
                          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#94A3B8', padding: 4, display: 'flex',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#001D3D'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                      >
                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p style={{ fontSize: 12, color: '#EF4444', marginTop: 6, fontWeight: 600 }}>
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      fontSize: 15, fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#FFFFFF',
                      background: loading ? '#334155' : 'linear-gradient(135deg, #001D3D 0%, #002855 100%)',
                      border: 'none',
                      borderRadius: 14,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                      boxShadow: loading ? 'none' : '0 4px 20px rgba(0,29,61,0.25), 0 0 0 0 rgba(0,29,61,0)',
                      opacity: loading ? 0.7 : 1,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,29,61,0.35), 0 0 0 4px rgba(0,29,61,0.08)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,29,61,0.25)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                    Se connecter
                    {!loading && <ArrowRight size={16} />}
                  </button>

                  {/* Bottom links */}
                  <div style={{ textAlign: 'center', marginTop: 28 }}>
                    <p style={{ color: '#94A3B8', fontSize: 14, margin: '0 0 10px' }}>
                      Nouveau candidat ?{' '}
                      <Link to="/register" style={{
                        color: '#001D3D', fontWeight: 700,
                        textDecoration: 'none', borderBottom: '2px solid rgba(0,29,61,0.15)',
                        paddingBottom: 1, transition: 'border-color 0.2s',
                      }}>
                        Créer un dossier
                      </Link>
                    </p>
                    <Link to="/" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
                      textTransform: 'uppercase', color: '#D4AF37',
                      textDecoration: 'none', transition: 'opacity 0.2s',
                      opacity: 0.8,
                    }}>
                      <span style={{
                        width: 16, height: 1, background: '#D4AF37', display: 'inline-block',
                      }} />
                      Site Public
                    </Link>
                  </div>
                </form>
              </div>

              {/* Security badge below card */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, marginTop: 24,
                animation: 'loginFadeIn 1s ease 0.8s both',
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#22C55E', boxShadow: '0 0 8px rgba(34,197,94,0.4)',
                }} />
                <span style={{
                  fontSize: 11, color: '#94A3B8', fontWeight: 500, letterSpacing: '0.05em',
                }}>
                  Connexion sécurisée SSL — Données chiffrées
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
