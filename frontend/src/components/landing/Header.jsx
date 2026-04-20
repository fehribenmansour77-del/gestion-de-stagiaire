import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  ArrowRight, 
  Search,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navStyles = {
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 84,
      display: 'flex',
      alignItems: 'center',
      zIndex: 1000,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      background: isScrolled ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
      backdropFilter: isScrolled ? 'blur(16px)' : 'none',
      borderBottom: isScrolled ? '1px solid rgba(0, 29, 61, 0.08)' : '1px solid transparent',
      padding: '0 40px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      textDecoration: 'none',
      transition: 'transform 0.3s',
    },
    logoIcon: {
      width: 42,
      height: 42,
      background: 'linear-gradient(135deg, #001D3D 0%, #002855 100%)',
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 15px rgba(0, 29, 61, 0.15)',
    },
    logoText: {
      display: 'flex',
      flexDirection: 'column',
    },
    logoTitle: {
      color: '#001D3D',
      fontSize: 22,
      fontWeight: 900,
      letterSpacing: '-0.02em',
      lineHeight: 1,
    },
    logoSub: {
      color: '#D4AF37',
      fontSize: 8,
      fontWeight: 800,
      letterSpacing: '0.35em',
      textTransform: 'uppercase',
      marginTop: 4,
    },
    navLink: {
      fontSize: 12,
      fontWeight: 700,
      color: '#64748B',
      textDecoration: 'none',
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      transition: 'all 0.3s',
      position: 'relative',
      padding: '8px 0',
    },
    primaryBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 28px',
      background: 'linear-gradient(135deg, #001D3D 0%, #002855 100%)',
      color: '#FFFFFF',
      borderRadius: 100,
      fontSize: 11,
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      textDecoration: 'none',
      boxShadow: '0 4px 20px rgba(0, 29, 61, 0.2)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: 'none',
      cursor: 'pointer',
    }
  };

  return (
    <header style={navStyles.header} className="ev-animate-header">
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        
        {/* LOGO */}
        <Link to="/" style={navStyles.logo} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          <div style={navStyles.logoIcon}>
            <span style={{ color: '#D4AF37', fontSize: 22, fontWeight: 900 }}>G</span>
          </div>
          <div style={navStyles.logoText}>
            <span style={navStyles.logoTitle}>GIAS</span>
            <span style={navStyles.logoSub}>Industries</span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-12">
          {user ? (
            <>
              <Link 
                to={user.role === 'stagiaire' ? '/home-stagiaire' : '/dashboard'}
                style={navStyles.navLink}
                onMouseEnter={e => e.currentTarget.style.color = '#001D3D'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
              >
                Tableau de Bord
              </Link>
              <button 
                onClick={handleLogout}
                style={{
                  ...navStyles.navLink,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#EF4444'
                }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/presentation" 
                style={navStyles.navLink}
                onMouseEnter={e => e.currentTarget.style.color = '#001D3D'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
              >
                Le Groupe
              </Link>
              <Link 
                to="/candidature/suivi" 
                style={{...navStyles.navLink, display: 'flex', alignItems: 'center', gap: 6}}
                onMouseEnter={e => e.currentTarget.style.color = '#002855'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
              >
                <Search size={14} />
                Suivi
              </Link>
              
              <div style={{ width: 1, height: 24, background: 'rgba(0, 29, 61, 0.1)' }} />
              
              <Link 
                to="/login" 
                style={{...navStyles.navLink, color: '#001D3D'}}
                onMouseEnter={e => e.currentTarget.style.opacity = 0.7}
                onMouseLeave={e => e.currentTarget.style.opacity = 1}
              >
                Se connecter
              </Link>
              
              <Link 
                to="/register" 
                style={navStyles.primaryBtn}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 29, 61, 0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 29, 61, 0.2)';
                }}
              >
                Rejoindre
                <ArrowRight size={14} style={{ color: '#D4AF37' }} />
              </Link>
            </>
          )}
        </nav>

        {/* MOBILE TOGGLE */}
        <button 
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'none', border: 'none', color: '#001D3D' }}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed', top: 84, left: 0, right: 0, bottom: 0,
          background: '#FFFFFF', zIndex: 999, padding: 40,
          display: 'flex', flexDirection: 'column', gap: 32,
          animation: 'regSlideUp 0.4s ease',
        }}>
          {/* Mobile links here if needed */}
        </div>
      )}
    </header>
  );
}