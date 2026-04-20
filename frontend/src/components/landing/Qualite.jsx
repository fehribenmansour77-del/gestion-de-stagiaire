import React from 'react';
import { Award, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function Qualite() {
  return (
    <section style={{ 
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
            <ShieldCheck size={14} style={{ color: '#001D3D' }} />
            <span style={{ color: '#001D3D', fontSize: 10, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
              Standard de Qualité
            </span>
          </div>
          <h3 style={{
            fontSize: 'clamp(32px, 4vw, 42px)',
            fontWeight: 900,
            color: '#001D3D',
            letterSpacing: '-0.02em',
            margin: '0 0 24px'
          }}>
            Excellence <span style={{ color: '#D4AF37' }}>Certifiée</span>
          </h3>
          <p style={{
            fontSize: 18, color: '#64748B', lineHeight: 1.6,
            maxWidth: 700, margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
          }}>
            Notre rigueur industrielle est attestée par les certifications internationales les plus exigeantes, garantissant une sécurité alimentaire et environnementale totale.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-10">
          {[
            { tag: 'ISO 9001', desc: 'Management Qualité' },
            { tag: 'ISO 22000', desc: 'Sécurité Alimentaire' },
            { tag: 'ISO 14001', desc: 'Gestion Environnement' }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`stagger-${idx + 1}`}
              style={{
                background: '#F8FAFC',
                borderRadius: 40,
                padding: '48px 54px',
                textAlign: 'center',
                border: '1px solid rgba(0, 29, 61, 0.03)',
                minWidth: 280,
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 29, 61, 0.06)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = 'rgba(0, 29, 61, 0.03)';
                e.currentTarget.style.background = '#F8FAFC';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: idx === 1 ? 'rgba(212,175,55,0.08)' : 'rgba(0, 29, 61, 0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', color: idx === 1 ? '#D4AF37' : '#001D3D',
              }}>
                <CheckCircle2 size={28} />
              </div>
              
              <div style={{ fontSize: 26, fontWeight: 900, color: '#001D3D', marginBottom: 8, letterSpacing: '-0.02em' }}>
                {item.tag}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {item.desc}
              </div>

              {/* Decorative side line */}
              <div style={{
                position: 'absolute', top: 0, right: 0, width: 6, height: '100%',
                background: idx === 1 ? '#D4AF37' : 'rgba(0, 29, 61, 0.05)',
              }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}