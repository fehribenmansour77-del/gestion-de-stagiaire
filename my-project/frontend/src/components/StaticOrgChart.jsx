/**
 * Composant: StaticOrgChart — GIAS Premium V6
 * Visualisation architecturale de la structure organisationnelle.
 * Design : Navy, Gold, Glassmorphism, Sophistication Industrielle.
 */

import React from 'react';
import { 
  Building2, Users, PieChart, ShoppingCart, Truck, Factory, 
  Globe, ShieldCheck, Briefcase, BarChart3, ChevronDown,
  Layers, Network, Zap, Target
} from 'lucide-react';

const departments = [
  { id: 'cdg', name: 'CDG / SI / Logistique', icon: Truck, color: '#001D3D', desc: 'Gestion des flux et systèmes' },
  { id: 'grh', name: 'Ressources Humaines', icon: Users, color: '#D4AF37', desc: 'Capital et talents' },
  { id: 'mkt_csm', name: 'Marketing CSM', icon: PieChart, color: '#007F82', desc: 'Stratégie marque CSM' },
  { id: 'mkt_gias', name: 'Marketing GIASIND', icon: BarChart3, color: '#001D3D', desc: 'Stratégie GIAS INDUSTRIE' },
  { id: 'vente_csm', name: 'Vente CSM', icon: ShoppingCart, color: '#007F82', desc: 'Force de vente CSM' },
  { id: 'vente_gias', name: 'Vente GIASIND', icon: Briefcase, color: '#001D3D', desc: 'Force de vente GIASIND' },
  { id: 'export', name: 'Export', icon: Globe, color: '#D4AF37', desc: 'Développement International' },
  { id: 'achat', name: 'Achat', icon: ShoppingCart, color: '#007F82', desc: 'Approvisionnements' },
  { id: 'df', name: 'Dir. Financière', icon: ShieldCheck, color: '#001D3D', desc: 'Gestion du patrimoine' },
  { id: 'usine', name: 'Usine', icon: Factory, color: '#D4AF37', desc: 'Opérations Industrielles' },
];

/* ── UI Styles ── */
const injectStyles = `
@keyframes orgFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes orgLineFlow { 0% { stroke-dashoffset: 100; } 100% { stroke-dashoffset: 0; } }
.org-glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1.5px solid rgba(255, 255, 255, 0.4); }
.node-card { transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); cursor: default; }
.node-card:hover { transform: translateY(-8px); border-color: #001D3D; box-shadow: 0 30px 60px rgba(0,29,61,0.08); }
.line-gradient { background: linear-gradient(to bottom, #001D3D, #D4AF37, #E2E8F0); width: 2px; }
`;

export default function StaticOrgChart() {
  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto', padding: '60px 0' }}>
      <style>{injectStyles}</style>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 1200 }}>
        
        {/* ── Level 1: Direction Générale ── */}
        <div style={{ position: 'relative', marginBottom: 120, animation: 'orgFadeIn 0.8s ease' }}>
           <div style={{ 
             width: 400, padding: '48px', borderRadius: 40, background: '#001D3D', color: 'white',
             boxShadow: '0 40px 100px rgba(0,29,61,0.2)', border: '1px solid rgba(212,175,55,0.2)',
             display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
             position: 'relative', overflow: 'hidden'
           }}>
              {/* Gold Ornament */}
              <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: 'linear-gradient(225deg, rgba(212,175,55,0.1) 0%, transparent 70%)' }} />
              
              <div style={{ width: 72, height: 72, borderRadius: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, color: '#D4AF37' }}>
                 <Building2 size={32} />
              </div>
              <p style={{ fontSize: 10, fontWeight: 900, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: 12 }}>Sommet Stratégique GIAS</p>
              <h3 style={{ fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Direction Générale</h3>
           </div>
           
           {/* Connection Down */}
           <div className="line-gradient" style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', height: 120 }} />
        </div>

        {/* ── Level 2: Core Business Units ── */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 1400 }}>
           
           {/* Horizontal Bar */}
           <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 2, background: '#D4AF37', opacity: 0.3 }} />

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 32, paddingTop: 40 }}>
              {departments.map((dept, idx) => (
                 <div key={dept.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: `orgFadeIn 0.8s ease ${idx * 0.1}s both` }}>
                    
                    {/* Tick connection */}
                    <div style={{ position: 'absolute', top: -40, left: '50%', width: 2, height: 40, background: '#D4AF37', opacity: 0.3, transform: 'translateX(-50%)' }} />

                    <div className="org-glass node-card" style={{ width: '100%', padding: 24, borderRadius: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                       <div style={{ width: 52, height: 52, borderRadius: 16, background: 'white', border: '1.5px solid #E2E8F0', color: dept.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                          <dept.icon size={24} />
                       </div>
                       <h4 style={{ fontSize: 12, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px', lineHeight: 1.4 }}>{dept.name}</h4>
                       <p style={{ fontSize: 9, fontWeight: 600, color: '#94A3B8', margin: 0 }}>{dept.desc}</p>
                       
                       {/* Subtle Accent */}
                       <div style={{ width: 20, height: 2, background: dept.color, marginTop: 24, borderRadius: 99, opacity: 0.5 }} />
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* ── Footer / Methodology ── */}
        <div style={{ marginTop: 100, display: 'flex', gap: 16 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 100 }}>
              <Zap size={14} style={{ color: '#D4AF37' }} />
              <span style={{ fontSize: 9, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Structure Interactive V6</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', background: '#001D3D', borderRadius: 100, color: 'white' }}>
              <ShieldCheck size={14} style={{ color: '#D4AF37' }} />
              <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Gouvernance Institutionnelle</span>
           </div>
        </div>

      </div>
    </div>
  );
}
