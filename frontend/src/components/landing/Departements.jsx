import React from 'react';
import { 
  FlaskConical, 
  BarChart3, 
  Users2, 
  Terminal, 
  Settings,
  ArrowRight,
  Building2
} from 'lucide-react';

const deps = [
  { name: 'Production', icon: Settings, desc: 'Optimisation des flux et excellence industrielle.' },
  { name: 'Qualité & R&D', icon: FlaskConical, desc: 'Innovation produit et contrôle rigoureux.' },
  { name: 'Marketing', icon: BarChart3, desc: 'Stratégie de marque et expansion mondiale.' },
  { name: 'RH', icon: Users2, desc: 'Accompagnement et développement des talents.' },
  { name: 'Informatique', icon: Terminal, desc: 'Digitalisation et support technologique.' }
];

export default function Departements() {
  return (
    <section id="departements" style={{ 
      padding: '120px 0', 
      background: '#FFFFFF',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div style={{ textAlign: 'center', marginBottom: 80, animation: 'regSlideUp 1s ease' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(0, 29, 61, 0.04)', borderRadius: 100,
            padding: '8px 20px', marginBottom: 24,
          }}>
            <Building2 size={14} style={{ color: '#001D3D' }} />
            <span style={{ color: '#001D3D', fontSize: 10, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
              Pôles d'Excellence
            </span>
          </div>
          <h3 style={{
            fontSize: 'clamp(32px, 4vw, 42px)',
            fontWeight: 900,
            color: '#001D3D',
            letterSpacing: '-0.02em',
            margin: '0 0 24px'
          }}>
            Nos <span style={{ color: '#D4AF37' }}>Départements</span>
          </h3>
          <p style={{
            fontSize: 18, color: '#64748B', lineHeight: 1.6,
            maxWidth: 700, margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
          }}>
            Chaque département est un pilier de notre réussite, offrant un environnement propice à l'apprentissage et à l'innovation stratégique.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {deps.map((dep, idx) => (
            <div 
              key={idx} 
              className={`stagger-${idx + 1}`}
              style={{
                background: '#F8FAFC',
                borderRadius: 32,
                padding: '40px 32px',
                border: '1px solid rgba(0, 29, 61, 0.04)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 29, 61, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#F8FAFC';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(0, 29, 61, 0.04)';
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: '#FFFFFF', border: '1px solid rgba(0, 29, 61, 0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 32, color: '#001D3D',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.3s',
              }} className="icon-box">
                <dep.icon size={26} />
              </div>
              
              <h4 style={{
                fontSize: 19, fontWeight: 800, color: '#001D3D',
                marginBottom: 16, letterSpacing: '-0.01em'
              }}>
                {dep.name}
              </h4>
              
              <p style={{
                fontSize: 13, color: '#64748B', lineHeight: 1.6,
                fontFamily: "'DM Sans', sans-serif", marginBottom: 24,
              }}>
                {dep.desc}
              </p>
              
              <div style={{
                marginTop: 'auto',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 10, fontWeight: 800, color: '#D4AF37',
                textTransform: 'uppercase', letterSpacing: '0.15em',
                transition: 'all 0.3s',
              }}>
                Explorer
                <ArrowRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}