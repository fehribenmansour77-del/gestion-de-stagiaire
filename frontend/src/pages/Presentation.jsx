import React from 'react';
import { Building2, Award, Globe, Users, ShoppingBag, ShieldCheck, Heart, Target, Zap } from 'lucide-react';

const Presentation = () => {
  const brands = {
    gias: ['Goldina', 'Vanoise', 'Laziza', 'Jouto', 'Oppa', 'ChocoPing'],
    csm: ['Vanoise', 'Voluma', 'La Délicieuse', 'Excellior', 'Mezij', 'Feuille d\'Or']
  };

  const values = [
    { title: 'Équipe', icon: <Users size={24} />, desc: 'Esprit de collaboration et de solidarité entre tous les membres du groupe.' },
    { title: 'Engagement', icon: <Heart size={24} />, desc: 'Dévouement total envers nos clients, nos partenaires et nos missions.' },
    { title: 'Excellence', icon: <Target size={24} />, desc: 'Recherche constante de la qualité et de la performance dans chaque action.' },
    { title: 'Éthique', icon: <ShieldCheck size={24} />, desc: 'Respect rigoureux des normes morales et professionnelles.' }
  ];

  return (
    <div className="animate-in" style={{ paddingBottom: 60 }}>
      <div className="page-wrapper" style={{ maxWidth: 1100 }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <span className="badge" style={{ marginBottom: 16 }}>Héritage & Vision</span>
          <h1 className="font-display" style={{ fontSize: '56px', color: 'var(--primary)', margin: 0, lineHeight: 1.1 }}>
            L'excellence Industrielle <br /> au Service du Goût
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 18, marginTop: 24, maxWidth: 700, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            Découvrez l'écosystème HMS, un groupe leader regroupant GIAS Industries et CSM GIAS, acteurs majeurs de l'agroalimentaire en Afrique et en Europe.
          </p>
          <div style={{ width: 60, height: 4, background: 'var(--accent)', margin: '40px auto 0', borderRadius: 2 }}></div>
        </div>

        {/* Major Entities */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 80 }}>
          {/* GIAS Industries */}
          <div className="premium-card" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 24 }}>
            <div style={{ 
              width: 80, height: 80, borderRadius: 24, background: 'var(--surface-container-low)', 
              color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--outline-variant)'
            }}>
              <Factory size={40} />
            </div>
            <div>
              <h2 className="font-display" style={{ fontSize: 28, color: 'var(--primary)', margin: '0 0 12px' }}>GIAS Industries</h2>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                Spécialisée dans la transformation de graisses végétales et de cacao. GIAS est le pilier historique de notre expertise industrielle, rayonnant sur le marché local et international.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              {brands.gias.map(b => (
                <span key={b} className="badge" style={{ fontSize: 10, background: 'white' }}>{b}</span>
              ))}
            </div>
          </div>

          {/* CSM GIAS */}
          <div className="premium-card" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 24 }}>
            <div style={{ 
              width: 80, height: 80, borderRadius: 24, background: 'var(--surface-container-low)', 
              color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--outline-variant)'
            }}>
              <ShoppingBag size={40} />
            </div>
            <div>
              <h2 className="font-display" style={{ fontSize: 28, color: 'var(--primary)', margin: '0 0 12px' }}>CSM GIAS</h2>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                Joint-venture de renfommée mondiale dédiée aux solutions pour la boulangerie et la pâtisserie. Nous accompagnons les artisans avec des ingrédients d'exception.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              {brands.csm.map(b => (
                <span key={b} className="badge" style={{ fontSize: 10, background: 'white' }}>{b}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Identity & Values */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 48 }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.4em', whiteSpace: 'nowrap' }}>ADN du Groupe</h3>
            <div style={{ flex: 1, height: 1, background: 'var(--outline-variant)' }}></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {values.map(v => (
              <div key={v.title} className="premium-card" style={{ padding: 32, textAlign: 'center', transition: 'transform 0.3s ease' }}>
                <div style={{ color: 'var(--primary)', marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
                  {v.icon}
                </div>
                <h4 className="font-display" style={{ fontSize: 18, color: 'var(--primary)', marginBottom: 12 }}>{v.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Global Stats */}
        <div className="premium-card" style={{ background: 'var(--primary)', border: 'none', padding: 60, position: 'relative', overflow: 'hidden' }}>
          <Globe style={{ position: 'absolute', right: -40, bottom: -40, color: 'white', opacity: 0.05 }} size={280} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 44, fontWeight: 300, color: 'var(--accent)', margin: 0 }}>400+</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>Membres</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 44, fontWeight: 300, color: 'var(--accent)', margin: 0 }}>120</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>Produits</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 44, fontWeight: 300, color: 'var(--accent)', margin: 0 }}>18</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>Exportations</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 44, fontWeight: 300, color: 'var(--accent)', margin: 0 }}>30+</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>Ans de Savoir</p>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
           <span className="badge" style={{ background: 'var(--surface-container-low)', padding: '10px 24px', fontSize: 11 }}>
             <Globe size={14} style={{ marginRight: 8, color: 'var(--accent)' }} /> Siège Social & Sites de Production — Bouargoub, Tunisie
           </span>
        </div>

      </div>
    </div>
  );
};

export default Presentation;

const Factory = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20V9l4-2 4 2 4-2 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/><path d="M7 14h1"/><path d="M12 14h1"/><path d="M17 14h1"/><path d="M7 10h1"/><path d="M12 10h1"/><path d="M17 10h1"/>
  </svg>
);
