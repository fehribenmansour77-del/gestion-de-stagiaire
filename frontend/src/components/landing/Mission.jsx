import React from 'react';
import { Target, Sparkles, Quote } from 'lucide-react';

export default function Mission() {
  return (
    <section style={{ 
      padding: '140px 0', 
      background: '#001D3D',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Immersive background effects */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle at 20% 30%, rgba(212,175,55,0.08) 0%, transparent 60%)',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', top: -100, right: -100,
        width: 400, height: 400, borderRadius: '50%',
        background: 'rgba(212,175,55,0.03)', filter: 'blur(80px)',
        zIndex: 1,
      }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Icon Container */}
          <div style={{
            width: 80, height: 80, borderRadius: 28,
            background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#D4AF37', marginBottom: 40,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          }}>
            <Target size={36} />
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(255, 255, 255, 0.05)', borderRadius: 100,
            padding: '8px 20px', marginBottom: 24,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Sparkles size={12} style={{ color: '#D4AF37' }} />
            <span style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
              Vision Stratégique
            </span>
          </div>

          <h3 style={{
            fontSize: 'clamp(32px, 5vw, 64px)',
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            margin: '0 0 40px'
          }}>
            Notre <span style={{ color: '#D4AF37' }}>Mission</span>
          </h3>
          
          <div style={{ width: 80, height: 4, background: '#D4AF37', borderRadius: 2, marginBottom: 64 }} />

          <div style={{ position: 'relative', maxWidth: 900 }}>
            <Quote 
              size={60} 
              style={{ 
                position: 'absolute', top: -30, left: -40, 
                color: 'rgba(212, 175, 55, 0.1)', 
                transform: 'rotate(180deg)' 
              }} 
            />
            <p style={{
              fontSize: 'clamp(24px, 3vw, 42px)',
              color: '#FFFFFF',
              fontStyle: 'italic',
              fontFamily: 'serif',
              lineHeight: 1.4,
              fontWeight: 400,
              margin: 0,
              opacity: 0.95
            }}>
              "Offrir des solutions d'ingrédients de haute qualité et satisfaire pleinement les exigences de nos partenaires mondiaux."
            </p>
          </div>

          {/* Business Unit Tag */}
          <div style={{
            marginTop: 80, fontSize: 11, fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase',
            letterSpacing: '0.4em',
          }}>
            GIAS INDUSTRIES • INTERNATIONAL STANDARDS
          </div>
        </div>
      </div>
    </section>
  );
}