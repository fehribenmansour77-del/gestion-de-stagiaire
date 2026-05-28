/**
 * Page: Gouvernance CSM GIAS — Premium V6
 * Visualisation de la structure hiérarchique de l'entité de Services et Management.
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import StaticOrgChart from '../components/StaticOrgChart';
import { 
  ShieldCheck, 
  UserCheck,
  LayoutDashboard,
  LayoutGrid,
  TrendingUp,
  Compass
} from 'lucide-react';

export default function OrgCsm() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const isChefDepartement = user?.role === 'chef_departement';

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: 100 }}>
       
       {/* ── Immersive Navy Header ── */}
       <div style={{ background: '#001D3D', padding: '100px 0 160px', position: 'relative', overflow: 'hidden' }}>
          {/* Background FX */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 80% 20%, rgba(212,175,55,0.05) 0%, transparent 50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 20% 80%, rgba(0,127,130,0.03) 0%, transparent 50%)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 10 }}>
             <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                   <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#007F82' }}>
                      <Compass size={24} />
                   </div>
                   <span style={{ fontSize: 10, fontWeight: 900, color: '#007F82', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Service & Management</span>
                </div>
                <h1 style={{ fontSize: 48, fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
                   Gouvernance <span style={{ color: '#D4AF37', fontStyle: 'italic', fontWeight: 400, fontFamily: 'serif' }}>CSM GIAS</span>
                </h1>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 600, marginTop: 16, lineHeight: 1.6, fontWeight: 500 }}>
                   Représentation officielle de l'unité de pilotage et services partagés de GIAS Group.
                </p>
             </div>

             <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {isSuperAdmin && (
                   <div style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: 'white', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <ShieldCheck size={16} style={{ color: '#D4AF37' }} /> Admin Mode
                   </div>
                )}
                {isChefDepartement && (
                   <div style={{ padding: '12px 24px', background: 'rgba(5, 150, 105, 0.1)', border: '1px solid rgba(5, 150, 105, 0.2)', borderRadius: 16, color: '#059669', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <UserCheck size={16} /> Unit Leader
                   </div>
                )}
                <div style={{ padding: '12px 24px', background: '#D4AF37', borderRadius: 16, color: '#001D3D', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 10 }}>
                   <TrendingUp size={16} /> Strategy Board
                </div>
             </div>
          </div>
       </div>

       {/* ── Content Container (Glass) ── */}
       <div style={{ maxWidth: 1400, margin: '-80px auto 0', padding: '0 24px', position: 'relative', zIndex: 20 }}>
          <div style={{ background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 48, padding: '40px', boxShadow: '0 40px 100px rgba(0,29,61,0.05)' }}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, padding: '0 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <LayoutGrid size={20} style={{ color: '#001D3D' }} />
                   <h2 style={{ fontSize: 14, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>Cartographie de Gouvernance CSM</h2>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>Version du registre : V6.2.0</div>
             </div>
             
             <StaticOrgChart />
          </div>
       </div>

    </div>
  );
}
