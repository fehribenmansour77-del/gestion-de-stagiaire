import React from 'react';
import { 
  Clock, 
  Coffee, 
  ShieldCheck, 
  AlertOctagon, 
  Info, 
  Users, 
  MapPin, 
  BookOpen,
  CheckCircle2,
  Lock
} from 'lucide-react';

const Reglement = () => {
  const schedule = [
    { label: 'Début de Séance', time: '08:00', icon: <Clock size={20} /> },
    { label: 'Pause Méridienne', time: '13:00', icon: <Coffee size={20} /> },
    { label: 'Fin de Séance', time: '16:00', icon: <Clock size={20} /> }
  ];

  const rules = [
    { 
      title: 'Confidentialité', 
      icon: <Lock />, 
      content: 'Toutes les informations techniques, commerciales ou stratégiques sont strictement confidentielles. Aucun document ne doit quitter le site sans autorisation.' 
    },
    { 
      title: 'Assiduité', 
      icon: <CheckCircle2 />, 
      content: 'Les stagiaires doivent respecter rigoureusement les horaires. Toute absence doit être justifiée auprès du tuteur et du département RH.' 
    },
    { 
      title: 'Sécurité & Hygiène', 
      icon: <ShieldCheck />, 
      content: 'Le port des Équipements de Protection Individuelle (EPI) est obligatoire dans les zones de production (Usine).' 
    },
    { 
      title: 'Comportement', 
      icon: <Users />, 
      content: 'Engagement, Excellence, Équipe et Éthique. Le respect mutuel et le professionnalisme sont les piliers de notre culture.' 
    }
  ];

  return (
    <div className="animate-in" style={{ paddingBottom: 60 }}>
      <div className="page-wrapper" style={{ maxWidth: 1000 }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60, borderBottom: '1px solid var(--outline-variant)', paddingBottom: 40 }}>
          <div>
            <span className="badge" style={{ marginBottom: 12 }}>Conformité & Éthique</span>
            <h1 className="font-display" style={{ fontSize: '48px', color: 'var(--primary)', margin: 0, lineHeight: 1 }}>
              Règlement Intérieur
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 18, marginTop: 12 }}>
              Principes directeurs et protocoles pour l'intégration des nouveaux talents HMS.
            </p>
          </div>
          <div className="badge" style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', display: 'flex', gap: 10, fontSize: 12 }}>
             <BookOpen size={16} />
             <span>Document de Référence</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 48 }}>
          
          {/* Left Column: Temporal Markers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Horaires & Disponibilité</h3>
            <div className="premium-card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 40 }}>
              {schedule.map((s, i) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative' }}>
                  {i < schedule.length - 1 && (
                    <div style={{ position: 'absolute', top: 40, left: 24, width: 1, height: 40, background: 'var(--outline-variant)' }}></div>
                  )}
                  <div style={{ 
                    width: 48, height: 48, borderRadius: 16, background: 'var(--surface-container-low)', 
                    color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--outline-variant)'
                  }}>
                    {s.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>{s.label}</p>
                    <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)', margin: 0 }}>{s.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="premium-card" style={{ background: 'var(--primary)', color: 'white', padding: 24, border: 'none' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <AlertOctagon size={20} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>Logistique</span>
               </div>
               <p style={{ fontSize: 13, color: 'var(--on-primary-container)', lineHeight: 1.6, opacity: 0.9, margin: 0 }}>
                 Le service de restauration est disponible à 13h00 (Cantine Newrest). Le badge stagiaire est obligatoire.
               </p>
            </div>
          </div>

          {/* Right Column: Doctrines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Piliers Culturels</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {rules.map(rule => (
                <div key={rule.title} className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ color: 'var(--accent)' }}>
                    {React.cloneElement(rule.icon, { size: 24 })}
                  </div>
                  <h4 className="font-display" style={{ fontSize: 18, color: 'var(--primary)', margin: 0 }}>{rule.title}</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                    {rule.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Warning Section */}
            <div className="premium-card" style={{ background: 'var(--surface-container-low)', padding: 40, border: '1px dashed var(--outline)', position: 'relative', overflow: 'hidden' }}>
              <ShieldCheck style={{ position: 'absolute', right: -20, bottom: -20, color: 'var(--outline-variant)', opacity: 0.3 }} size={160} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 className="font-display" style={{ fontSize: 24, color: 'var(--primary)', marginBottom: 16 }}>Clause d'Application</h3>
                <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '80%' }}>
                  Tout manquement aux protocoles de sécurité ou de confidentialité peut entraîner la résiliation immédiate de la convention de stage. Nous cultivons l'excellence par la rigueur.
                </p>
                <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                  <span className="badge" style={{ fontSize: 10, fontWeight: 700 }}>Direction Capital Humain</span>
                  <span className="badge" style={{ fontSize: 10, fontWeight: 700 }}>Bouargoub — 2026</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.4em' }}>
            HMS Group — Excellence in Food Industry
          </p>
        </div>

      </div>
    </div>
  );
};

export default Reglement;
