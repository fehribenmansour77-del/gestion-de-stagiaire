/**
 * Page: Tableau de Bord Stratégique — GIAS Premium V6
 * Pilotage des indicateurs clés et supervision des effectifs.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import documentService from '../services/documentService';
import { Link } from 'react-router-dom';
import {
  Users, Inbox, Building2, BarChart3,
  RefreshCw, ChevronRight, AlertCircle, CheckCircle2,
  Download, ShieldCheck, PenTool, Loader2, TrendingUp,
  Calendar, UserCheck, FileText, Clock, ArrowUpRight,
  Zap, Award, Sparkles, Target, Layers
} from 'lucide-react';
import { toast } from '../store/useToastStore';

/* ── Global Styles ── */
const injectStyles = `
@keyframes dashFadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes dashPulse { 0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); } 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); } }
.dash-glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 15px 35px rgba(0,29,61,0.05); }
.dash-card-hover { transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); cursor: pointer; }
.dash-card-hover:hover { transform: translateY(-8px); box-shadow: 0 30px 60px rgba(0,29,61,0.12); }
.dash-gradient-text { background: linear-gradient(135deg, #001D3D 0%, #007F82 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
`;

/* ── KPI Card Component ── */
const KpiCard = ({ title, value, sub, icon: Icon, trend, delay = 0 }) => (
  <div 
    className="dash-glass dash-card-hover" 
    style={{ 
      padding: '32px', 
      borderRadius: '32px', 
      animation: `dashFadeUp 0.6s ease forwards ${delay}s`,
      opacity: 0,
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #D4AF37, transparent)' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: '#F8FAFC', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#001D3D' }}>
        <Icon size={24} />
      </div>
      {trend && (
         <div style={{ background: '#ECFDF5', color: '#059669', padding: '6px 12px', borderRadius: 12, fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowUpRight size={14} /> {trend}
         </div>
      )}
    </div>
    <div>
      <h3 style={{ fontSize: 36, fontWeight: 900, color: '#001D3D', margin: 0, letterSpacing: '-0.02em' }}>{value ?? '—'}</h3>
      <p style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '8px 0 12px' }}>{title}</p>
      {sub && <p style={{ fontSize: 12, fontWeight: 600, color: '#64748B', margin: 0 }}>{sub}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const [kpisRes, deptsRes] = await Promise.all([
        dashboardService.getKPIs(),
        dashboardService.getDepartementsStats()
      ]);
      setKpis(kpisRes.kpis || {});
      setDepts(deptsRes.departements || []);
    } catch (err) {
      toast.error('Échec de la synchronisation des données');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAttestation = async (stageId) => {
    try {
      toast.success('Génération en cours...');
      await documentService.generateAttestation(stageId);
      toast.success('Attestation disponible dans l\'archive');
    } catch {
      toast.error('Erreur de génération PDF');
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={48} className="animate-spin" style={{ color: '#D4AF37', margin: '0 auto 24px' }} />
          <p style={{ fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Intelligence Artificielle GIAS...</p>
        </div>
      </div>
    );
  }

  const totalStagiaires = depts.reduce((s, d) => s + (d.effectif || 0), 0) || 1;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 100 }}>
      <style>{injectStyles}</style>

      {/* ── Immersive Header ── */}
      <div style={{ background: '#001D3D', padding: '80px 0 160px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'linear-gradient(225deg, rgba(212,175,55,0.08) 0%, transparent 100%)' }} />
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px', position: 'relative' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 40 }}>
              <div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4AF37', animation: 'dashPulse 2s infinite' }} />
                    <span style={{ fontSize: 10, fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.4em', opacity: 0.6 }}>Pilotage Institutionnel · {today}</span>
                 </div>
                 <h1 style={{ fontSize: 56, fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.02em', fontFamily: 'serif' }}>
                    Tableau de <span style={{ color: '#D4AF37' }}>Bord</span>
                 </h1>
                 <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, marginTop: 16, fontWeight: 500, maxWidth: 600 }}>
                    Bienvenue, <span style={{ color: 'white', fontWeight: 700 }}>{user?.prenom}</span>. Supervision globale des effectifs et flux opérationnels.
                 </p>
              </div>
              <button 
                onClick={() => fetchData(true)} 
                disabled={refreshing}
                style={{ padding: '18px 32px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, backdropFilter: 'blur(10px)' }}
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} style={{ color: '#D4AF37' }} /> Synchro Temps Réel
              </button>
           </div>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div style={{ maxWidth: 1240, margin: '-80px auto 0', padding: '0 20px' }}>
        
        {/* ── KPI Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 40 }}>
          <KpiCard title="Stagiaires Actifs" value={kpis?.stagiaires_actifs ?? 0} icon={Users} sub="Présents en filiale" trend="+12%" delay={0.1} />
          <KpiCard title="Pipeline Reçu" value={kpis?.total_candidatures ?? 0} icon={Inbox} sub="Candidatures archivées" delay={0.2} />
          <KpiCard title="Indice de Présence" value={kpis?.taux_presence ? `${kpis.taux_presence}%` : '96%'} icon={Target} sub="Moyenne mensuelle" trend="+0.4%" delay={0.3} />
          <KpiCard title="Alertes Échéances" value={kpis?.fins_proches?.length ?? 0} icon={Clock} sub="Fins de stage imminentes" delay={0.4} />
        </div>

        {/* ── Secondary Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40 }}>
          
          {/* Distribution Section */}
          <div className="dash-glass" style={{ padding: 48, borderRadius: 40 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 900, color: '#001D3D', margin: 0, letterSpacing: '-0.01em' }}>Cartographie des Départements</h3>
                  <p style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600, marginTop: 4 }}>Répartition stratégique des talents par pôle.</p>
                </div>
                <BarChart3 size={24} style={{ color: '#D4AF37' }} />
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {depts.map((dept, i) => {
                  const pct = Math.round((dept.effectif / totalStagiaires) * 100);
                  const colors = ['#001D3D', '#007F82', '#D4AF37', '#94A3B8'];
                  const color = colors[i % colors.length];
                  return (
                    <div key={i} style={{ animation: `dashFadeUp 0.6s ease forwards ${0.5 + (i * 0.1)}s`, opacity: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'flex-end' }}>
                         <span style={{ fontSize: 14, fontWeight: 800, color: '#001D3D' }}>{dept.nom}</span>
                         <span style={{ fontSize: 12, fontWeight: 900, color: color }}>{dept.effectif} Talents · {pct}%</span>
                      </div>
                      <div style={{ height: 10, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
                         <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 1.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>

          {/* Quick Access Sidebar */}
          <div style={{ spaceY: 24 }}>
             <div className="dash-glass" style={{ padding: 32, borderRadius: 40, background: '#001D3D' }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: 'white', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                   <Zap size={20} style={{ color: '#D4AF37' }} /> Raccourcis RH
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {[
                     { to: '/candidatures', label: 'Pipeline Recrutement', icon: Layers, color: 'rgba(212,175,55,0.2)' },
                     { to: '/stagiaires', label: 'Annuaire Talent', icon: Users, color: 'rgba(255,255,255,0.05)' },
                     { to: '/presences', label: 'Registre Présence', icon: Calendar, color: 'rgba(255,255,255,0.05)' },
                     { to: '/evaluations', label: 'Bilans Performance', icon: Award, color: 'rgba(255,255,255,0.05)' }
                   ].map((link, i) => (
                     <Link key={i} to={link.to} style={{ 
                        textDecoration: 'none', 
                        padding: '16px 20px', 
                        background: link.color, 
                        borderRadius: 20, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        transition: '0.3s'
                     }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateX(8px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                     >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                           <link.icon size={18} style={{ color: link.color.includes('212') ? '#D4AF37' : 'white' }} />
                           <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{link.label}</span>
                        </div>
                        <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
                     </Link>
                   ))}
                </div>
             </div>

             <div className="dash-glass" style={{ padding: 32, borderRadius: 40, marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                   <Sparkles size={18} style={{ color: '#D4AF37' }} />
                   <span style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.25em' }}>Certifications</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#001D3D', lineHeight: 1.6, margin: 0 }}>Générez instantanément des attestations certifiées GIAS.</p>
                <Link to="/documents" style={{ display: 'block', marginTop: 20, fontSize: 11, fontWeight: 900, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>Accéder au coffre-fort →</Link>
             </div>
          </div>

        </div>

        {/* ── Alerts Table ── */}
        {kpis?.fins_proches?.length > 0 && (
          <div className="dash-glass" style={{ marginTop: 40, padding: 0, borderRadius: 40, overflow: 'hidden', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
            <div style={{ padding: '24px 40px', background: '#FEF2F2', borderBottom: '1px solid #FEE2E2', display: 'flex', alignItems: 'center', gap: 16 }}>
               <AlertCircle size={20} style={{ color: '#DC2626' }} />
               <h4 style={{ fontSize: 12, fontWeight: 900, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>Points de vigilance : Fins de stages imminentes ({kpis.fins_proches.length})</h4>
            </div>
            <div style={{ padding: 20 }}>
               <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                  <thead>
                     <tr>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Talent</th>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Pôle</th>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Échéance</th>
                        <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {kpis.fins_proches.map((s, i) => (
                        <tr key={i} style={{ background: 'white' }}>
                           <td style={{ padding: '16px 24px', borderRadius: '16px 0 0 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                 <div style={{ width: 32, height: 32, borderRadius: 10, background: '#001D3D', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>
                                    {s.utilisateur?.prenom?.charAt(0)}
                                 </div>
                                 <span style={{ fontWeight: 800, color: '#001D3D' }}>{s.utilisateur?.prenom} {s.utilisateur?.nom}</span>
                              </div>
                           </td>
                           <td style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: '#64748B' }}>{s.departement?.nom}</td>
                           <td style={{ padding: '16px 24px' }}>
                              <span style={{ padding: '6px 12px', background: '#FEF2F2', color: '#DC2626', borderRadius: 10, fontSize: 11, fontWeight: 900 }}>
                                 {new Date(s.date_fin).toLocaleDateString()}
                              </span>
                           </td>
                           <td style={{ padding: '16px 24px', textAlign: 'right', borderRadius: '0 16px 16px 0' }}>
                              <button onClick={() => handleAttestation(s.id)} style={{ padding: '10px 20px', background: '#F8FAFC', color: '#001D3D', border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                 <Download size={14} /> Attestation
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
