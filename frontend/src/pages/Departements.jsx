/**
 * Page: Structure Organisationnelle — GIAS Premium V6
 * Cartographie des unités opérationnelles et pilotage des pôles du groupe.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import departementService from '../services/departementService';
import { 
  Building2, Plus, Edit2, Trash2, Filter, Search, X, 
  MoreVertical, Users, Network, MapPin, PieChart, User, 
  ShieldCheck, Building, RefreshCw, MoreHorizontal, 
  ChevronRight, Loader2, Briefcase, Zap, Sparkles, Target,
  Layers, ArrowUpRight
} from 'lucide-react';
import { toast } from '../store/useToastStore';

/* ── Global Styles ── */
const injectStyles = `
@keyframes deptFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.dept-glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.4); }
.dept-card { background: white; border-radius: 32px; border: 1px solid #E2E8F0; transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); cursor: pointer; }
.dept-card:hover { transform: translateY(-8px); box-shadow: 0 30px 60px rgba(0,29,61,0.1); border-color: #001D3D; }
`;

const Departements = () => {
  const { user } = useAuth();
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingDepartement, setEditingDepartement] = useState(null);
  const [formData, setFormData] = useState({
    nom: '', code: '', description: '', entity: 'GIAS',
    parent_id: '', capacite_accueil: 10, responsable_id: ''
  });

  const isSuperAdmin = user?.role === 'super_admin';

  const loadDepartements = async () => {
    try {
      setLoading(true);
      const data = await departementService.getDepartements(entityFilter || null);
      setDepartements(data);
    } catch (err) {
      toast.error('Erreur de chargement de la structure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDepartements(); }, [entityFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = () => {
    setEditingDepartement(null);
    setFormData({ nom: '', code: '', description: '', entity: 'GIAS', parent_id: '', capacite_accueil: 10, responsable_id: '' });
    setShowModal(true);
  };

  const handleEdit = (departement) => {
    setEditingDepartement(departement);
    setFormData({
      nom: departement.nom, code: departement.code, description: departement.description || '',
      entity: departement.entity, parent_id: departement.parent_id || '',
      capacite_accueil: departement.capacite_accueil, responsable_id: departement.responsable_id || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, parent_id: formData.parent_id ? parseInt(formData.parent_id) : null, capacite_accueil: parseInt(formData.capacite_accueil) };
      if (editingDepartement) await departementService.updateDepartement(editingDepartement.id, data);
      else await departementService.createDepartement(data);
      toast.success('Structure mise à jour');
      setShowModal(false);
      loadDepartements();
    } catch (err) { toast.error('Erreur technique'); }
  };

  const getEntityBadge = (entity) => {
    const colors = { GIAS: '#001D3D', CSM: '#007F82', SHARED: '#D4AF37' };
    const color = colors[entity] || '#94A3B8';
    return (
      <span style={{ padding: '6px 12px', background: `${color}10`, color: color, borderRadius: 10, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', border: `1px solid ${color}20` }}>
        {entity}
      </span>
    );
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 100 }}>
       <style>{injectStyles}</style>

       <div style={{ maxWidth: 1400, margin: '0 auto', padding: '60px 20px' }}>
          
          {/* ── Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60, flexWrap: 'wrap', gap: 40 }}>
             <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <Layers size={18} style={{ color: '#D4AF37' }} />
                  <span style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Organisation · GIAS Group</span>
                </div>
                <h1 style={{ fontSize: 44, fontWeight: 900, color: '#001D3D', letterSpacing: '-0.02em', margin: 0 }}>Pôles & <span style={{ color: '#001D3D' }}>Unités</span></h1>
                <p style={{ color: '#64748B', fontSize: 16, marginTop: 12, fontWeight: 500, maxWidth: 600 }}>Architecture opérationnelle et cartographie des départements du groupe.</p>
             </div>
             
             {isSuperAdmin && (
                <button onClick={handleCreate} style={{ padding: '18px 32px', background: '#001D3D', color: 'white', borderRadius: 20, border: 'none', fontWeight: 900, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                   <Plus size={18} style={{ color: '#D4AF37' }} /> Nouveau Pôle
                </button>
             )}
          </div>

          {/* ── Filter Bar ── */}
          <div className="dept-glass" style={{ padding: '24px 32px', borderRadius: 28, marginBottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F1F5F9', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#001D3D' }}>
                   <Building2 size={20} />
                </div>
                <select 
                  style={{ minWidth: 280, padding: '14px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 14, fontWeight: 600 }}
                  value={entityFilter} 
                  onChange={(e) => setEntityFilter(e.target.value)}
                >
                   <option value="">Toutes les filiales du groupe</option>
                   <option value="GIAS">GIAS Industries</option>
                   <option value="CSM">CSM GIAS</option>
                </select>
             </div>
             <div style={{ fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <span style={{ color: '#001D3D' }}>{departements.length}</span> Unités Opérationnelles Actives
             </div>
          </div>

          {/* ── Grid Area ── */}
          {loading ? (
             <div style={{ padding: 100, textAlign: 'center' }}>
                <RefreshCw size={40} className="animate-spin" style={{ color: '#D4AF37', margin: '0 auto 20px' }} />
                <p style={{ fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Déploiement structure...</p>
             </div>
          ) : (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 32 }}>
                {departements.map((dept, i) => (
                   <div key={dept.id} className="dept-card" style={{ animation: `deptFadeIn 0.5s ease forwards ${i * 0.1}s`, opacity: 0, padding: 0 }}>
                      <div style={{ height: 6, background: dept.entity === 'GIAS' ? '#001D3D' : '#007F82', borderRadius: '32px 32px 0 0' }} />
                      <div style={{ padding: 40 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                               <div style={{ width: 52, height: 52, borderRadius: 14, background: '#F8FAFC', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#001D3D', fontSize: 14 }}>
                                  {dept.code}
                               </div>
                               <div>
                                  <h3 style={{ fontSize: 22, fontWeight: 900, color: '#001D3D', margin: 0, letterSpacing: '-0.01em' }}>{dept.nom}</h3>
                                  <p style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', margin: 0 }}>Unité stratégique</p>
                               </div>
                            </div>
                            {isSuperAdmin && (
                               <div style={{ display: 'flex', gap: 4 }}>
                                  <button onClick={() => handleEdit(dept)} style={{ width: 36, height: 36, background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}><Edit2 size={16}/></button>
                               </div>
                            )}
                         </div>

                         <p style={{ fontSize: 14, color: '#64748B', fontWeight: 500, lineHeight: 1.6, marginBottom: 32, minHeight: 44 }}>
                            {dept.description || "Pôle d'excellence opérationnelle assurant la gestion des flux et des performances industrielles."}
                         </p>

                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '24px 0', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', marginBottom: 32 }}>
                            <div>
                               <p style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 }}>Occupation</p>
                               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <Users size={16} style={{ color: '#D4AF37' }}/>
                                  <span style={{ fontSize: 15, fontWeight: 900, color: '#001D3D' }}>{dept.nombre_stagiaires || 0} <span style={{ color: '#E2E8F0', fontWeight: 400 }}>/</span> {dept.capacite_accueil}</span>
                               </div>
                            </div>
                            <div>
                               <p style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 }}>Entité</p>
                               {getEntityBadge(dept.entity)}
                            </div>
                         </div>

                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                               <div style={{ width: 36, height: 36, borderRadius: 10, background: '#001D3D', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>
                                  {dept.responsable?.prenom?.charAt(0) || <User size={14}/>}
                               </div>
                               <div>
                                  <p style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', margin: 0 }}>Responsable</p>
                                  <p style={{ fontSize: 13, fontWeight: 800, color: '#001D3D', margin: 0 }}>{dept.responsable ? `${dept.responsable.prenom} ${dept.responsable.nom}` : "Non assigné"}</p>
                               </div>
                            </div>
                            <div style={{ width: 44, height: 44, borderRadius: 22, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E2E8F0' }}>
                               <ChevronRight size={20} />
                            </div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          )}
       </div>

       {/* ── Form Modal ── */}
       {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
             <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,29,61,0.4)', backdropFilter: 'blur(10px)' }} onClick={() => setShowModal(false)}></div>
             <div className="dept-glass" style={{ position: 'relative', width: '100%', maxWidth: 640, padding: 0, borderRadius: 40, border: 'none', overflow: 'hidden' }}>
                <div style={{ padding: '40px', background: '#001D3D', color: 'white' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                         <h3 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>Configuration Unité</h3>
                         <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 8 }}>Architecture Organisationnelle GIAS</p>
                      </div>
                      <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer' }}><X size={28}/></button>
                   </div>
                </div>
                
                <form onSubmit={handleSubmit} style={{ padding: 60 }}>
                   <div style={{ marginBottom: 24 }}>
                      <label style={{ fontSize: 11, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Nom du Département / Pôle *</label>
                      <input type="text" name="nom" style={{ width: '100%', padding: '16px', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 15, fontWeight: 600 }} value={formData.nom} onChange={handleInputChange} required />
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                      <div>
                         <label style={{ fontSize: 11, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Code Abréviation *</label>
                         <input type="text" name="code" style={{ width: '100%', padding: '16px', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 15, fontWeight: 800, textTransform: 'uppercase' }} value={formData.code} onChange={handleInputChange} required maxLength={10} />
                      </div>
                      <div>
                         <label style={{ fontSize: 11, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Filiale Associée *</label>
                         <select name="entity" style={{ width: '100%', padding: '16px', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 14, fontWeight: 600 }} value={formData.entity} onChange={handleInputChange} required>
                            <option value="GIAS">GIAS Industries</option>
                            <option value="CSM">CSM GIAS</option>
                            <option value="SHARED">Services Partagés</option>
                         </select>
                      </div>
                   </div>

                   <div style={{ marginBottom: 24 }}>
                      <label style={{ fontSize: 11, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Description Opérationnelle</label>
                      <textarea name="description" style={{ width: '100%', minHeight: 100, padding: 16, border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 15, fontWeight: 500, resize: 'none' }} value={formData.description} onChange={handleInputChange} />
                   </div>

                   <div style={{ marginBottom: 32 }}>
                      <label style={{ fontSize: 11, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Capacité d'Accueil Stratégique</label>
                      <input type="number" name="capacite_accueil" style={{ width: '100%', padding: '16px', border: '1.5px solid #E2E8F0', borderRadius: 16, fontSize: 15, fontWeight: 600 }} value={formData.capacite_accueil} onChange={handleInputChange} min={1} />
                   </div>

                   <div style={{ display: 'flex', gap: 16 }}>
                      <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '18px', background: '#F1F5F9', border: 'none', borderRadius: 16, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>Annuler</button>
                      <button type="submit" style={{ flex: 2, padding: '18px', background: '#001D3D', color: 'white', border: 'none', borderRadius: 16, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                         {editingDepartement ? 'Enregistrer les Rectifications' : 'Déployer le Pôle'} <Zap size={18} style={{ color: '#D4AF37' }} />
                      </button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};

export default Departements;
