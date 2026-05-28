import React from 'react';
import { Heart, ShieldCheck, Users, Lightbulb, Sparkles } from 'lucide-react';

const valeurs = [
  { name: 'Respect', icon: Heart, color: '#EF4444' },
  { name: 'Intégrité', icon: ShieldCheck, color: '#D4AF37' },
  { name: 'Esprit d’équipe', icon: Users, color: '#007F82' },
  { name: 'Innovation', icon: Lightbulb, color: '#001D3D' }
];

export default function Valeurs() {
  return (
    <section style={{ 
      padding: '120px 0', 
      background: '#F8FAFC',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div style={{ textAlign: 'center', marginBottom: 80, animation: 'regSlideUp 1s ease' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(212,175,55,0.08)', borderRadius: 100,
            padding: '8px 20px', marginBottom: 24,
          }}>
            <Sparkles size={14} style={{ color: '#D4AF37' }} />
            <span style={{ color: '#001D3D', fontSize: 10, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
              La Culture GIAS
            </span>
          </div>
          <h3 style={{
            fontSize: 'clamp(32px, 4vw, 42px)',
            fontWeight: 900,
            color: '#001D3D',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Nos <span style={{ color: '#D4AF37' }}>Valeurs</span> Fondamentales
          </h3>
          <div style={{ width: 60, height: 4, background: '#D4AF37', margin: '24px auto 0', borderRadius: 2 }} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {valeurs.map((val, idx) => (
            <div 
              key={idx} 
              className={`stagger-${idx + 1}`}
              style={{
                background: '#FFFFFF',
                borderRadius: 40,
                padding: '48px 32px',
                textAlign: 'center',
                border: '1px solid rgba(0, 29, 61, 0.04)',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-12px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 29, 61, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(0, 29, 61, 0.04)';
              }}
            >
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                background: `${val.color}08`, 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 32px', color: val.color,
                border: `1px solid ${val.color}15`,
                transition: 'all 0.4s',
              }} className="valeur-icon">
                <val.icon size={36} />
              </div>
              
              <span style={{
                fontSize: 20, fontWeight: 800, color: '#001D3D',
                letterSpacing: '-0.01em', display: 'block'
              }}>
                {val.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}