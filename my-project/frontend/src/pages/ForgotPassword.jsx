import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import { Mail, ArrowRight, ChevronLeft, Loader2, CheckCircle, AlertCircle, ShieldQuestion } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'envoi de l\'email.');
    } finally {
      setLoading(false);
    }
  };

  const injectStyles = `
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0A0F1C',
      fontFamily: "'Inter', sans-serif",
      padding: '20px'
    }}>
      <style>{injectStyles}</style>

      {/* Decorative background elements */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(0,127,130,0.05) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
      </div>

      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        position: 'relative',
        animation: 'fadeIn 0.6s ease-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', background: '#F8FAFC', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0'
          }}>
            <ShieldQuestion size={32} style={{ color: '#D4AF37' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#001D3D', margin: '0 0 10px' }}>
            Mot de passe oublié ?
          </h2>
          <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.6' }}>
            Pas d'inquiétude ! Entrez votre email et nous vous enverrons un lien pour réinitialiser votre accès.
          </p>
        </div>

        {success ? (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{
              background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '16px',
              padding: '24px', textAlign: 'center', marginBottom: '24px'
            }}>
              <CheckCircle size={48} style={{ color: '#22C55E', margin: '0 auto 16px' }} />
              <h3 style={{ color: '#166534', fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Email envoyé !</h3>
              <p style={{ color: '#166534', fontSize: '14px', margin: 0 }}>
                Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation d'ici quelques instants.
              </p>
            </div>
            <Link to="/login" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              width: '100%', padding: '14px', background: '#001D3D', color: '#FFF',
              borderRadius: '12px', textDecoration: 'none', fontWeight: '600', transition: 'all 0.3s'
            }}>
              <ChevronLeft size={18} />
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px',
                padding: '12px 16px', color: '#DC2626', fontSize: '13px', display: 'flex',
                alignItems: 'center', gap: '8px', marginBottom: '20px'
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Adresse Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={18} />
                <input
                  type="email"
                  required
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px',
                    border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px',
                    outline: 'none', transition: 'all 0.3s'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '16px', background: 'linear-gradient(135deg, #001D3D 0%, #002855 100%)',
                color: '#FFF', borderRadius: '12px', border: 'none', fontSize: '15px',
                fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: '0 10px 20px rgba(0,29,61,0.2)', transition: 'transform 0.2s'
              }}
            >
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Envoyer le lien'}
              {!loading && <ArrowRight size={18} />}
            </button>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link to="/login" style={{
                color: '#64748B', fontSize: '14px', textDecoration: 'none', fontWeight: '600',
                display: 'inline-flex', alignItems: 'center', gap: '4px'
              }}>
                <ChevronLeft size={16} />
                Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
