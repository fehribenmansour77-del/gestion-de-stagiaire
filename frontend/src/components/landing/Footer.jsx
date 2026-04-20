import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Youtube,
  Linkedin,
  Globe,
  ArrowRight
} from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ 
      background: '#001D3D', 
      padding: '100px 0 40px',
      position: 'relative',
      overflow: 'hidden'
    }} className="reveal-on-scroll">
      {/* Decorative Top Border */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '6px', background: 'linear-gradient(90deg, #D4AF37 0%, #001D3D 100%)'
      }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-80">
          
          {/* BRAND BLOCK */}
          <div className="lg:col-span-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{
                width: 52, height: 52, background: '#D4AF37', 
                borderRadius: 16, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(212, 175, 55, 0.2)',
              }}>
                <span style={{ color: '#001D3D', fontSize: 32, fontWeight: 900 }}>G</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em' }}>GIAS</span>
                <span style={{ color: '#D4AF37', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4em' }}>Industries</span>
              </div>
            </div>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.5)', fontSize: 16, lineHeight: 1.7,
              maxWidth: 440, marginBottom: 40, fontFamily: "'DM Sans', sans-serif"
            }}>
              Leader mondial des ingrédients pour la pâtisserie et la boulangerie. 
              Nous cultivons l'excellence et l'innovation technologique depuis plus de trois décennies.
            </p>

            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { Icon: Instagram, url: '#' },
                { Icon: Facebook, url: '#' },
                { Icon: Linkedin, url: '#' },
                { Icon: Youtube, url: '#' }
              ].map((item, i) => (
                <a key={i} href={item.url} style={{
                  width: 44, height: 44, borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFFFFF', transition: 'all 0.3s',
                  textDecoration: 'none'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#D4AF37';
                  e.currentTarget.style.borderColor = '#D4AF37';
                  e.currentTarget.style.color = '#001D3D';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <item.Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 style={{ 
              color: '#FFFFFF', fontSize: 13, fontWeight: 800, 
              textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 32 
            }}>
              Candidature
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: "S'inscrire", to: "/register" },
                { label: "Se connecter", to: "/login" },
                { label: "Suivre un dossier", to: "/candidature/suivi" },
                { label: "Le Groupe", to: "/presentation" }
              ].map((item, idx) => (
                <li key={idx} style={{ marginBottom: 16 }}>
                  <Link to={item.to} style={{
                    color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, fontWeight: 600,
                    textDecoration: 'none', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: 8
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; e.currentTarget.style.paddingLeft = '4px'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'; e.currentTarget.style.paddingLeft = '0'; }}
                  >
                    <ArrowRight size={12} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div>
            <h4 style={{ 
              color: '#FFFFFF', fontSize: 13, fontWeight: 800, 
              textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 32 
            }}>
              Coordonnées
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, spaceY: 20 }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
                <MapPin size={20} style={{ color: '#D4AF37', marginTop: 2 }} />
                <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, lineHeight: 1.5, fontWeight: 500 }}>
                  Zone Industrielle Borj Ghorbel,<br />Ben Arous, Tunisie
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <Phone size={20} style={{ color: '#D4AF37' }} />
                <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, fontWeight: 600 }}>
                  +216 71 000 000
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Mail size={20} style={{ color: '#D4AF37' }} />
                <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, fontWeight: 600 }}>
                  contact@gias-industries.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div style={{ 
          paddingTop: 40, borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 20
        }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            © {new Date().getFullYear()} GIAS INDUSTRIES • DESIGNED FOR EXCELLENCE
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            <a href="#" style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none' }}>Confidentialité</a>
            <a href="#" style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none' }}>Mentions Légales</a>
          </div>
        </div>
      </div>

      {/* Background Decorative Mesh */}
      <div style={{
        position: 'absolute', bottom: -100, left: '50%', transform: 'translateX(-50%)',
        width: '120%', height: 400, background: 'radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none'
      }} />
    </footer>
  );
}