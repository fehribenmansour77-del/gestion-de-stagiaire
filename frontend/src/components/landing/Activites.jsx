import React from 'react';
import { 
  Droplets, 
  CakeSlice, 
  ChefHat, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const activities = [
  { 
    title: 'Margarines & Corps Gras', 
    icon: Droplets, 
    desc: 'Haute performance pour la pâtisserie et la boulangerie industrielle de précision.',
    color: '#001D3D'
  },
  { 
    title: 'Chocolat & Fourrages', 
    icon: CakeSlice, 
    desc: 'Une sélection de saveurs raffinées pour des finitions d’exception et gourmandes.',
    color: '#D4AF37'
  },
  { 
    title: 'Mixes & Préparations', 
    icon: ChefHat, 
    desc: 'Solutions complètes innovantes pour faciliter la production artisanale et industrielle.',
    color: '#007F82'
  }
];

export default function Activites() {
  return (
    <section style={{ 
      padding: '120px 0', 
      background: '#F8FAFC',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background element */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(0, 29, 61, 0.05), transparent)'
      }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div style={{ textAlign: 'center', marginBottom: 80, animation: 'regSlideUp 1s ease' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(212,175,55,0.08)', borderRadius: 100,
            padding: '8px 20px', marginBottom: 24,
          }}>
            <Sparkles size={14} style={{ color: '#D4AF37' }} />
            <span style={{ color: '#001D3D', fontSize: 10, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
              Notre Savoir-Faire
            </span>
          </div>
          <h3 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 900,
            color: '#001D3D',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Expertise <span style={{ color: '#D4AF37' }}>Produit</span>
          </h3>
          <div style={{ width: 60, height: 4, background: '#D4AF37', margin: '24px auto 0', borderRadius: 2 }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {activities.map((item, idx) => (
            <div 
              key={idx} 
              className={`stagger-${idx + 1}`}
              style={{
                background: '#FFFFFF',
                borderRadius: 40,
                padding: '54px 40px',
                border: '1px solid rgba(0, 29, 61, 0.05)',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-12px)';
                e.currentTarget.style.boxShadow = '0 30px 60px rgba(0, 29, 61, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(0, 29, 61, 0.05)';
              }}
            >
              {/* Icon Container */}
              <div style={{
                width: 72, height: 72, borderRadius: 24,
                background: idx === 1 ? 'rgba(212,175,55,0.08)' : 'rgba(0, 29, 61, 0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 40, color: idx === 1 ? '#D4AF37' : '#001D3D',
                transition: 'all 0.3s',
              }}>
                <item.icon size={32} />
              </div>

              <h4 style={{
                fontSize: 24, fontWeight: 800, color: '#001D3D',
                marginBottom: 20, letterSpacing: '-0.01em'
              }}>
                {item.title}
              </h4>
              <p style={{
                fontSize: 15, color: '#64748B', lineHeight: 1.6,
                fontFamily: "'DM Sans', sans-serif", marginBottom: 32,
              }}>
                {item.desc}
              </p>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 11, fontWeight: 800, color: '#001D3D',
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                Découvrir la gamme
                <ArrowRight size={14} style={{ color: '#D4AF37' }} />
              </div>

              {/* Decorative Corner Ornaments */}
              <div style={{
                position: 'absolute', bottom: -20, right: -20,
                width: 100, height: 100, borderRadius: '50%',
                background: idx === 1 ? 'rgba(212,175,55,0.03)' : 'rgba(0, 29, 61, 0.02)',
                zIndex: 0,
              }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}