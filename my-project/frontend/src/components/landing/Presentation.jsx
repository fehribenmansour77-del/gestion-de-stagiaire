import React from 'react';
import { 
  CheckCircle2, 
  Award, 
  Settings, 
  Users
} from 'lucide-react';

export default function Presentation() {
  return (
    <section id="presentation" style={{ 
      padding: '120px 0', 
      background: '#FFFFFF',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          
          {/* IMAGE SIDE */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: 48,
              overflow: 'hidden',
              boxShadow: '0 40px 80px rgba(0, 29, 61, 0.08)',
              border: '12px solid #FFFFFF',
              position: 'relative',
              zIndex: 2,
            }}>
              <img 
                src="/lab-expertise.png" 
                alt="Expertise Industrielle" 
                style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }}
              />
            </div>
            
            {/* Overlay Badge */}
            <div style={{
              position: 'absolute', bottom: -24, right: -24,
              background: 'linear-gradient(135deg, #001D3D 0%, #002855 100%)',
              color: '#FFFFFF', padding: '32px', borderRadius: 28,
              boxShadow: '0 20px 50px rgba(0, 29, 61, 0.25)',
              maxWidth: 240, zIndex: 3,
            }}>
              <Award size={32} style={{ color: '#D4AF37', marginBottom: 16 }} />
              <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Qualité</div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.6 }}>
                Certification ISO <br />Permanente
              </div>
            </div>

            {/* Decorative Grid */}
            <div style={{
              position: 'absolute', top: -40, left: -40,
              width: 140, height: 140,
              backgroundImage: 'radial-gradient(rgba(0, 29, 61, 0.1) 2px, transparent 2px)',
              backgroundSize: '20px 20px',
              zIndex: 1,
            }} />
          </div>

          {/* TEXT SIDE */}
          <div className="stagger-1">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(0, 29, 61, 0.04)', borderRadius: 100,
              padding: '8px 20px', marginBottom: 32,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4AF37' }} />
              <span style={{ color: '#001D3D', fontSize: 10, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                Expertise & Savoir-faire
              </span>
            </div>

            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 900,
              color: '#001D3D',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: 32,
            }}>
              Un Partenaire de <br />
              <span style={{ color: '#D4AF37', fontStyle: 'italic', fontFamily: 'serif', fontWeight: 400 }}>Confiance</span> dans l'Agroalimentaire
            </h2>

            <p style={{
              fontSize: 18, color: '#64748B', lineHeight: 1.7,
              marginBottom: 40, fontFamily: "'DM Sans', sans-serif",
            }}>
              CSM GIAS est bien plus qu'une entreprise. C'est un centre d'excellence technologique 
              spécialisé dans la production d'ingrédients de haute précision pour la pâtisserie 
              et la boulangerie professionnelle.
            </p>

            <div style={{ spaceY: 24 }}>
              {[
                "Innovation constante & R&D avancée",
                "Distribution internationale (30+ pays)",
                "Standard de qualité Premium & Certifié"
              ].map((item, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16,
                  padding: '12px 20px', background: '#F8FAFC', borderRadius: 16,
                  border: '1px solid rgba(0, 29, 61, 0.03)',
                }}>
                  <div style={{ color: '#D4AF37' }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#001D3D' }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ 
              marginTop: 48, padding: '24px', background: 'rgba(212, 175, 55, 0.05)',
              borderRadius: 24, borderLeft: '6px solid #D4AF37',
            }}>
              <p style={{ 
                margin: 0, fontSize: 18, fontStyle: 'italic', fontWeight: 600, 
                color: '#001D3D', fontFamily: 'serif', lineHeight: 1.5 
              }}>
                "Innover pour offrir le meilleur du goût au monde entier."
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}