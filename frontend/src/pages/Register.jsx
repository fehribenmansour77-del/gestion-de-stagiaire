/**
 * Page: Inscription Candidat — GIAS Premium V6
 * Assistant d'inscription sécurisé en 2 étapes (Détails + OTP).
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, CheckCircle2, 
  ChevronLeft, AlertCircle, User, Mail, Phone, Lock, KeyRound, Sparkles,
} from 'lucide-react';
import axios from 'axios';

const registerSchema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  prenom: z.string().min(2, 'Prénom requis'),
  email: z.string().min(1, 'Email requis').email('Format email invalide'),
  telephone: z.string().min(8, 'Téléphone requis').regex(/^[0-9+\s()-]*$/, 'Format de téléphone invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[a-z]/, 'Doit contenir une minuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Doit contenir un caractère spécial'),
  confirmPassword: z.string().min(1, 'La confirmation est requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

/* ── Keyframe styles ── */
const injectStyles = `
@keyframes regFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-12px) rotate(2deg); }
  66% { transform: translateY(6px) rotate(-1deg); }
}
@keyframes regPulseGlow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.08); }
}
@keyframes regGradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes regSlideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes regFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes regShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes regBounceIn {
  0% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.05); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
@keyframes regPulseRing {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}
`;


const Register = () => {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const telephoneValue = watch('telephone');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/send-otp', { telephone: data.telephone });
      setStep(2);
    } catch (err) {
      console.error("OTP Send Error:", err);
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi du code OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (data) => {
    setOtpLoading(true);
    setError('');
    try {
      const verifyRes = await axios.post('/api/auth/verify-otp', {
        telephone: data.telephone,
        code: otpCode
      });
      const { verificationToken: token } = verifyRes.data;
      const regRes = await axios.post('/api/auth/register', {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        password: data.password,
        telephone: data.telephone,
        verificationToken: token
      });
      const { token: sessionToken } = regRes.data;
      localStorage.setItem('token', sessionToken);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/candidature';
      }, 1500);
    } catch (err) {
      console.error("Full Registration Error:", err);
      setError(err.response?.data?.error || 'Code OTP invalide ou erreur d\'inscription.');
    } finally {
      setOtpLoading(false);
    }
  };

  /* ── Input style helper ── */
  const inputStyle = (fieldName, extraPadding) => ({
    width: '100%',
    padding: extraPadding || '12px 16px',
    fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    color: '#001D3D',
    background: focusedField === fieldName ? '#FFFFFF' : '#F8FAFC',
    border: focusedField === fieldName ? '2px solid #001D3D' : '2px solid #E2E8F0',
    borderRadius: 12,
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: focusedField === fieldName ? '0 0 0 4px rgba(0,29,61,0.06)' : 'none',
  });

  const labelStyle = (fieldName) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.12em', marginBottom: 8,
    color: focusedField === fieldName ? '#001D3D' : '#64748B',
    transition: 'color 0.3s',
  });

  /* ── Success Screen ── */
  if (success) {
    return (
      <>
        <style>{injectStyles}</style>
        <div style={{
          height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(180deg, #F7F8FC 0%, #EEF0F7 100%)',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{
            maxWidth: 440, width: '100%', background: '#FFFFFF',
            borderRadius: 24, padding: '64px 48px', textAlign: 'center',
            boxShadow: '0 4px 60px rgba(0,29,61,0.06)',
            border: '1px solid rgba(226,232,240,0.8)',
            animation: 'regSlideUp 0.6s ease-out',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: 'linear-gradient(90deg, #22C55E, #10B981, #059669)',
            }} />
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'linear-gradient(135deg, #DCFCE7, #D1FAE5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 28px',
              animation: 'regBounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              position: 'relative',
            }}>
              <CheckCircle2 size={40} style={{ color: '#22C55E' }} />
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '2px solid rgba(34,197,94,0.3)',
                animation: 'regPulseRing 2s ease-out infinite',
              }} />
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: '#001D3D', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              Bienvenue !
            </h2>
            <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.6, margin: '0 0 32px' }}>
              Votre compte est désormais actif.<br />Préparation de votre espace candidat...
            </p>
            <Loader2 size={32} style={{ color: '#D4AF37', animation: 'spin 1s linear infinite' }} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{injectStyles}</style>
      <div style={{
        height: '100vh', display: 'flex',
        fontFamily: "'DM Sans', sans-serif",
        overflow: 'hidden', background: '#0A0F1C',
      }}>

        {/* ══════════════ LEFT PANEL — Immersive Brand ══════════════ */}
        <div style={{
          width: '42%',
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 52px',
          background: 'linear-gradient(135deg, #001229 0%, #001D3D 30%, #002855 60%, #001229 100%)',
          backgroundSize: '400% 400%',
          animation: 'regGradientShift 12s ease infinite',
          flexShrink: 0,
        }}>
          {/* Animated orbs */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <div style={{
              position: 'absolute', top: '15%', left: '20%',
              width: 280, height: 280, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
              animation: 'regPulseGlow 6s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', bottom: '10%', right: '10%',
              width: 180, height: 180, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,127,130,0.12) 0%, transparent 70%)',
              animation: 'regPulseGlow 8s ease-in-out infinite 2s',
            }} />
            <div style={{
              position: 'absolute', top: '30%', right: '12%',
              width: 50, height: 50, border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: 14, transform: 'rotate(45deg)',
              animation: 'regFloat 8s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', bottom: '25%', left: '8%',
              width: 35, height: 35, border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, transform: 'rotate(30deg)',
              animation: 'regFloat 10s ease-in-out infinite 1s',
            }} />
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.03,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }} />
          </div>

          {/* Top: Logo */}
          <div style={{ position: 'relative', zIndex: 10, animation: 'regFadeIn 1s ease' }}>
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
          <div style={{ position: 'relative', zIndex: 10, animation: 'regSlideUp 0.8s ease-out 0.3s both' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: 100, padding: '8px 18px', marginBottom: 28,
            }}>
              <Sparkles size={14} style={{ color: '#D4AF37' }} />
              <span style={{ color: '#D4AF37', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Inscription Candidat
              </span>
            </div>

            <h1 style={{ color: '#fff', fontSize: 48, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0 }}>
              Rejoignez
            </h1>
            <h2 style={{
              fontSize: 48, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em',
              margin: '4px 0 0', padding: 0,
              background: 'linear-gradient(135deg, #D4AF37, #F0D060, #D4AF37)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'regShimmer 4s linear infinite',
            }}>
              L'Avenir.
            </h2>

            <p style={{
              color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7,
              maxWidth: 300, marginTop: 24, fontStyle: 'italic',
              borderLeft: '2px solid rgba(212,175,55,0.3)', paddingLeft: 20,
            }}>
              "Bâtir l'industrie du futur en accompagnant les talents d'aujourd'hui."
            </p>

            {/* Feature pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 40 }}>
              {[
                { label: 'Programme de Stage', sub: 'Plateforme de candidature en ligne' },
                { label: 'Vérification Sécurisée', sub: 'Confirmation par SMS (OTP)' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  animation: `regSlideUp 0.6s ease-out ${0.6 + i * 0.15}s both`,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #D4AF37, #F0D060)',
                    boxShadow: '0 0 12px rgba(212,175,55,0.4)',
                    flexShrink: 0,
                  }} />
                  <div>
                    <p style={{ color: '#fff', fontSize: 13, fontWeight: 700, margin: 0 }}>{item.label}</p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '2px 0 0' }}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: copyright */}
          <div style={{ position: 'relative', zIndex: 10, animation: 'regFadeIn 1s ease 1s both' }}>
            <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 16 }} />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
              © 2026 GIAS Group — Industrial Portal
            </p>
          </div>
        </div>

        {/* ══════════════ RIGHT PANEL — Form ══════════════ */}
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          height: '100%', overflow: 'auto',
          background: 'linear-gradient(180deg, #F7F8FC 0%, #EEF0F7 100%)',
        }}>
          {/* Top bar */}
          <div style={{
            padding: '20px 36px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            animation: 'regFadeIn 0.6s ease',
          }}>
            <Link to="/login" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: '#94A3B8', fontSize: 13, fontWeight: 500,
              textDecoration: 'none', transition: 'color 0.3s',
            }}>
              <ChevronLeft size={16} />
              Retour à la connexion
            </Link>

            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: step === 1 ? 'rgba(0,29,61,0.06)' : 'rgba(34,197,94,0.08)',
                borderRadius: 100, padding: '6px 16px',
                transition: 'all 0.4s',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: step >= 1 ? '#001D3D' : '#E2E8F0',
                  color: '#fff', fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s',
                }}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#001D3D' }}>Détails</span>
              </div>
              <div style={{ width: 24, height: 2, background: step > 1 ? '#001D3D' : '#E2E8F0', borderRadius: 1, transition: 'background 0.4s' }} />
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: step === 2 ? 'rgba(0,29,61,0.06)' : 'transparent',
                borderRadius: 100, padding: '6px 16px',
                transition: 'all 0.4s',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: step >= 2 ? '#001D3D' : '#E2E8F0',
                  color: step >= 2 ? '#fff' : '#94A3B8',
                  fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s',
                }}>2</div>
                <span style={{ fontSize: 11, fontWeight: 600, color: step >= 2 ? '#001D3D' : '#94A3B8', transition: 'color 0.3s' }}>Vérification</span>
              </div>
            </div>
          </div>

          {/* Centered form */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 36px 32px',
          }}>
            <div style={{
              width: '100%', maxWidth: 520,
              animation: 'regSlideUp 0.7s ease-out 0.2s both',
            }}>
              {/* Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: 24,
                boxShadow: '0 4px 60px rgba(0,29,61,0.06), 0 1px 3px rgba(0,0,0,0.04)',
                border: '1px solid rgba(226,232,240,0.8)',
                padding: '40px 40px 36px',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Decorative top line */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: step === 1
                    ? 'linear-gradient(90deg, #001D3D, #D4AF37, #007F82)'
                    : 'linear-gradient(90deg, #007F82, #D4AF37, #001D3D)',
                  transition: 'background 0.5s',
                }} />

                {/* Icon & Title */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #001D3D, #002855)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0,29,61,0.2), 0 0 0 5px rgba(0,29,61,0.05)',
                    position: 'relative',
                  }}>
                    {step === 1 
                      ? <ShieldCheck size={24} style={{ color: '#D4AF37' }} />
                      : <KeyRound size={24} style={{ color: '#D4AF37' }} />
                    }
                  </div>
                </div>

                {step === 1 ? (
                  <>
                    <h2 style={{
                      textAlign: 'center', fontSize: 22, fontWeight: 800,
                      color: '#001D3D', margin: '0 0 6px', letterSpacing: '-0.02em',
                    }}>Créer un compte</h2>
                    <p style={{
                      textAlign: 'center', color: '#94A3B8', fontSize: 13,
                      lineHeight: 1.5, margin: '0 auto 28px', maxWidth: 320,
                    }}>
                      Remplissez vos informations pour commencer votre candidature.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 style={{
                      textAlign: 'center', fontSize: 22, fontWeight: 800,
                      color: '#001D3D', margin: '0 0 6px', letterSpacing: '-0.02em',
                    }}>Vérification Sécurisée</h2>
                    <p style={{
                      textAlign: 'center', color: '#94A3B8', fontSize: 13,
                      lineHeight: 1.5, margin: '0 auto 28px', maxWidth: 320,
                    }}>
                      Un code a été envoyé par SMS au{' '}
                      <span style={{ color: '#001D3D', fontWeight: 700 }}>{telephoneValue}</span>
                    </p>
                  </>
                )}

                {/* Error Alert */}
                {error && (
                  <div style={{
                    marginBottom: 20, padding: '12px 16px',
                    background: 'linear-gradient(135deg, #FEF2F2, #FFF1F2)',
                    border: '1px solid #FECACA',
                    borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10,
                    animation: 'regSlideUp 0.3s ease',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: '#FEE2E2', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <AlertCircle size={14} style={{ color: '#EF4444' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#DC2626', lineHeight: 1.4 }}>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  {step === 1 ? (
                    <>
                      {/* Nom & Prénom */}
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1, marginBottom: 16 }}>
                          <label style={labelStyle('nom')}>
                            <User size={12} /> Nom
                          </label>
                          <input
                            {...register('nom')}
                            onFocus={() => setFocusedField('nom')}
                            onBlur={() => setFocusedField(null)}
                            style={inputStyle('nom')}
                            placeholder="Nom"
                          />
                          {errors.nom && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 5, fontWeight: 600 }}>{errors.nom.message}</p>}
                        </div>
                        <div style={{ flex: 1, marginBottom: 16 }}>
                          <label style={labelStyle('prenom')}>
                            <User size={12} /> Prénom
                          </label>
                          <input
                            {...register('prenom')}
                            onFocus={() => setFocusedField('prenom')}
                            onBlur={() => setFocusedField(null)}
                            style={inputStyle('prenom')}
                            placeholder="Prénom"
                          />
                          {errors.prenom && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 5, fontWeight: 600 }}>{errors.prenom.message}</p>}
                        </div>
                      </div>

                      {/* Email */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle('email')}>
                          <Mail size={12} /> E-mail Professionnel
                        </label>
                        <input
                          type="email"
                          {...register('email')}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          style={inputStyle('email')}
                          placeholder="nom.prenom@exemple.com"
                        />
                        {errors.email && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 5, fontWeight: 600 }}>{errors.email.message}</p>}
                      </div>

                      {/* Téléphone */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle('telephone')}>
                          <Phone size={12} /> Téléphone Mobile
                        </label>
                        <input
                          {...register('telephone')}
                          onFocus={() => setFocusedField('telephone')}
                          onBlur={() => setFocusedField(null)}
                          style={inputStyle('telephone')}
                          placeholder="+216 -- --- ---"
                        />
                        {errors.telephone && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 5, fontWeight: 600 }}>{errors.telephone.message}</p>}
                      </div>

                      {/* Password */}
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1, marginBottom: 16 }}>
                          <label style={labelStyle('password')}>
                            <Lock size={12} /> Mot de passe
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type={showPw ? 'text' : 'password'}
                              {...register('password')}
                              onFocus={() => setFocusedField('password')}
                              onBlur={() => setFocusedField(null)}
                              style={inputStyle('password', '12px 40px 12px 16px')}
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPw(!showPw)}
                              style={{
                                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#94A3B8', padding: 2, display: 'flex', transition: 'color 0.2s',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#001D3D'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                            >
                              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                          {errors.password && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 5, fontWeight: 600, lineHeight: 1.3 }}>{errors.password.message}</p>}
                        </div>
                        <div style={{ flex: 1, marginBottom: 16 }}>
                          <label style={labelStyle('confirmPassword')}>
                            <Lock size={12} /> Confirmer
                          </label>
                          <input
                            type="password"
                            {...register('confirmPassword')}
                            onFocus={() => setFocusedField('confirmPassword')}
                            onBlur={() => setFocusedField(null)}
                            style={inputStyle('confirmPassword')}
                            placeholder="••••••••"
                          />
                          {errors.confirmPassword && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 5, fontWeight: 600 }}>{errors.confirmPassword.message}</p>}
                        </div>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          width: '100%', padding: '14px 24px', marginTop: 8,
                          fontSize: 14, fontWeight: 700,
                          fontFamily: "'DM Sans', sans-serif",
                          color: '#FFFFFF',
                          background: loading ? '#334155' : 'linear-gradient(135deg, #001D3D 0%, #002855 100%)',
                          border: 'none', borderRadius: 14,
                          cursor: loading ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                          boxShadow: loading ? 'none' : '0 4px 20px rgba(0,29,61,0.25)',
                          opacity: loading ? 0.7 : 1,
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
                        {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                        Continuer
                        {!loading && <ArrowRight size={15} />}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* OTP Input */}
                      <div style={{ marginBottom: 20 }}>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                          style={{
                            width: '100%', padding: '20px',
                            fontSize: 36, fontWeight: 900,
                            textAlign: 'center', letterSpacing: '0.4em',
                            fontFamily: "'DM Sans', sans-serif",
                            color: '#001D3D',
                            background: '#F8FAFC',
                            border: '2px solid #E2E8F0',
                            borderRadius: 16,
                            outline: 'none',
                            transition: 'all 0.3s',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#001D3D';
                            e.target.style.background = '#FFFFFF';
                            e.target.style.boxShadow = '0 0 0 4px rgba(0,29,61,0.06)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#E2E8F0';
                            e.target.style.background = '#F8FAFC';
                            e.target.style.boxShadow = 'none';
                          }}
                          placeholder="000000"
                        />
                        <p style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 12 }}>
                          Vous n'avez rien reçu ?{' '}
                          <button type="button" style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#001D3D', fontWeight: 700, fontSize: 12,
                            fontFamily: "'DM Sans', sans-serif",
                          }}>
                            Renvoyer le code
                          </button>
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          style={{
                            flex: 1, padding: '14px',
                            fontSize: 13, fontWeight: 700,
                            fontFamily: "'DM Sans', sans-serif",
                            color: '#64748B',
                            background: 'transparent',
                            border: '2px solid #E2E8F0',
                            borderRadius: 14, cursor: 'pointer',
                            transition: 'all 0.3s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#001D3D';
                            e.currentTarget.style.color = '#001D3D';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.color = '#64748B';
                          }}
                        >
                          Retour
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmit(handleVerifyOtp)}
                          disabled={otpLoading || otpCode.length < 6}
                          style={{
                            flex: 2, padding: '14px 24px',
                            fontSize: 14, fontWeight: 700,
                            fontFamily: "'DM Sans', sans-serif",
                            color: '#FFFFFF',
                            background: (otpLoading || otpCode.length < 6) ? '#94A3B8' : 'linear-gradient(135deg, #001D3D 0%, #002855 100%)',
                            border: 'none', borderRadius: 14,
                            cursor: (otpLoading || otpCode.length < 6) ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            transition: 'all 0.3s',
                            boxShadow: (otpLoading || otpCode.length < 6) ? 'none' : '0 4px 20px rgba(0,29,61,0.25)',
                          }}
                          onMouseEnter={(e) => {
                            if (!otpLoading && otpCode.length >= 6) {
                              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,29,61,0.35)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = (otpLoading || otpCode.length < 6) ? 'none' : '0 4px 20px rgba(0,29,61,0.25)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          {otpLoading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                          Valider
                          {!otpLoading && <ArrowRight size={14} />}
                        </button>
                      </div>
                    </>
                  )}

                  {/* Bottom link */}
                  <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <p style={{ color: '#94A3B8', fontSize: 13, margin: 0 }}>
                      Vous avez déjà un compte ?{' '}
                      <Link to="/login" style={{
                        color: '#001D3D', fontWeight: 700,
                        textDecoration: 'none', borderBottom: '2px solid rgba(0,29,61,0.15)',
                        paddingBottom: 1,
                      }}>
                        Se connecter
                      </Link>
                    </p>
                  </div>
                </form>
              </div>

              {/* Security badge */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, marginTop: 20,
                animation: 'regFadeIn 1s ease 0.8s both',
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#22C55E', boxShadow: '0 0 8px rgba(34,197,94,0.4)',
                }} />
                <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, letterSpacing: '0.05em' }}>
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

export default Register;
