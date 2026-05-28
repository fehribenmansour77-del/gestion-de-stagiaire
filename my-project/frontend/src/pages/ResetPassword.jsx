import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setError('Lien de réinitialisation invalide ou expiré.');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Les mots de passe ne correspondent pas.');
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/reset-password', {
        email,
        token,
        password
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

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
      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', background: '#F0F7FF', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            border: '1px solid #D1E9FF'
          }}>
            <ShieldCheck size={32} style={{ color: '#0066CC' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#001D3D', margin: '0 0 10px' }}>
            Nouveau mot de passe
          </h2>
          <p style={{ color: '#64748B', fontSize: '14px' }}>
            Choisissez un mot de passe sécurisé pour protéger votre accès.
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '16px',
              padding: '24px', marginBottom: '24px'
            }}>
              <CheckCircle size={48} style={{ color: '#22C55E', margin: '0 auto 16px' }} />
              <h3 style={{ color: '#166534', fontSize: '16px', fontWeight: '700' }}>Mot de passe réinitialisé !</h3>
              <p style={{ color: '#166534', fontSize: '14px', marginTop: '8px' }}>
                Vous allez être redirigé vers la page de connexion...
              </p>
            </div>
            <Link to="/login" style={{ color: '#001D3D', fontWeight: '700', textDecoration: 'none' }}>
              Aller à la connexion maintenant
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>
                Nouveau mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 44px 14px 14px', borderRadius: '12px',
                    border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>
                Confirmer le mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 14px', borderRadius: '12px',
                    border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              style={{
                width: '100%', padding: '16px', background: '#001D3D', color: '#FFF',
                borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '700',
                cursor: (loading || !token) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
              }}
            >
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Enregistrer le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
