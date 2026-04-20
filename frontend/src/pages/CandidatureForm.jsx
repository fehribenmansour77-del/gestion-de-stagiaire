/**
 * Page: Assistant de Recrutement — GIAS Premium V6
 * Système d'inscription multi-étapes pour les candidats GIAS.
 * Design professionnel (Navy & Gold), Glassmorphism, Immersif.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  Upload, 
  AlertCircle, 
  Clock, 
  Send, 
  RefreshCw,
  ArrowRight,
  Zap,
  Box,
  Layout,
  ClipboardList,
  Sparkles,
  ShieldCheck,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitCandidature } from '../services/candidatureService';
import { getDepartements } from '../services/departementService';

/* ── Global Styles & Keyframes ── */
const injectStyles = `
@keyframes canFloat {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(1deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}
@keyframes canPulseGlow {
  0% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
  100% { opacity: 0.3; transform: scale(1); }
}
@keyframes canSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes canFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes canShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

const steps = [
  { id: 1, label: "Identité", icon: <User size={18} />, desc: "Informations personnelles" },
  { id: 2, label: "Cursus", icon: <GraduationCap size={18} />, desc: "Parcours académique" },
  { id: 3, label: "Stage", icon: <Briefcase size={18} />, desc: "Détails du projet" },
  { id: 4, label: "Dossier", icon: <FileText size={18} />, desc: "Documents & Fichiers" },
  { id: 5, label: "Validation", icon: <CheckCircle2 size={18} />, desc: "Récapitulatif final" },
];

/* ── Redesigned InputField Helper ── */
const InputField = ({ label, icon: IconComponent, error, children, optional, focused }) => (
  <div style={{ marginBottom: 24, position: 'relative' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingLeft: 4 }}>
      <label style={{ 
        fontSize: 10, fontWeight: 800, color: '#64748B', 
        textTransform: 'uppercase', letterSpacing: '0.12em' 
      }}>
        {label}
      </label>
      {optional && <span style={{ fontSize: 9, color: '#94A3B8', fontStyle: 'italic' }}>(Optionnel)</span>}
    </div>
    <div style={{ position: 'relative' }}>
      {IconComponent && (
        <span style={{ 
          position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
          color: focused ? '#001D3D' : '#94A3B8', transition: 'color 0.3s',
          zIndex: 10, display: 'flex', alignItems: 'center'
        }}>
          {IconComponent}
        </span>
      )}
      {children}
    </div>
    {error && (
      <div style={{ 
        marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, 
        color: '#EF4444', animation: 'canSlideUp 0.3s ease' 
      }}>
        <AlertCircle size={12} />
        <p style={{ fontSize: 11, fontWeight: 600 }}>{error}</p>
      </div>
    )}
  </div>
);

export default function CandidatureForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [departements, setDepartements] = useState([]);
  const [focusedField, setFocusedField] = useState(null);
  const [formData, setFormData] = useState({
    nom: user?.nom || "", 
    prenom: user?.prenom || "", 
    email: user?.email || "", 
    telephone: user?.telephone || "",
    etablissement: "", filiere: "", niveau: "",
    departement_souhaite: "", date_debut: "", date_fin: "",
    theme: "", type_stage: "pfe",
    cv: null, lm: null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nom: user.nom || prev.nom,
        prenom: user.prenom || prev.prenom,
        email: user.email || prev.email,
        telephone: user.telephone || prev.telephone
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchDeps = async () => {
      try {
        const deps = await getDepartements();
        setDepartements(deps);
      } catch (err) {
        console.error("Erreur lors du chargement des départements:", err);
      }
    };
    fetchDeps();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }));
  };

  const handleFile = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData(p => ({ ...p, [name]: files[0] }));
      if (errors[name]) setErrors(p => ({ ...p, [name]: null }));
    }
  };

  const validate = (s) => {
    const e = {};
    if (s === 1 || s === 5) {
      if (!formData.nom?.trim()) e.nom = "Le nom est requis";
      if (!formData.email?.trim()) e.email = "L'email est requis";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Email invalide";
    }
    if (s === 2 || s === 5) {
      if (!formData.etablissement?.trim()) e.etablissement = "L'établissement est requis";
      if (!formData.filiere?.trim()) e.filiere = "La filière est requise";
      if (!formData.niveau?.trim()) e.niveau = "Le niveau d'étude est requis";
    }
    if (s === 3 || s === 5) {
      if (!formData.date_debut) e.date_debut = "La date de début est requise";
      if (!formData.date_fin) e.date_fin = "La date de fin est requise";
      else if (formData.date_debut && new Date(formData.date_fin) <= new Date(formData.date_debut))
        e.date_fin = "La date de fin doit être après la date de début";
      if (!formData.type_stage) e.type_stage = "Le type de stage est requis";
    }
    if (s === 4 || s === 5) {
      if (!formData.cv) e.cv = "Le CV est requis";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep(p => p + 1); };
  const prev = () => setStep(p => p - 1);

  const getDuration = () => {
    if (!formData.date_debut || !formData.date_fin) return null;
    const w = Math.ceil((new Date(formData.date_fin) - new Date(formData.date_debut)) / 604800000);
    return w > 0 ? w : null;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate(5)) return;
    
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== "") {
          data.append(key, formData[key]);
        }
      });

      const response = await submitCandidature(data);
      setSuccess({
        numero_suivi: response.data.numero_suivi,
        email: response.data.email
      });
    } catch (err) {
      setError(err.response?.data?.errors?.[0] || err.response?.data?.error || "Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Redesigned Input Style Helper ── */
  const inputStyle = (fieldName, hasIcon = true) => ({
    width: '100%',
    padding: hasIcon ? '14px 16px 14px 48px' : '14px 16px',
    fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    color: '#001D3D',
    background: focusedField === fieldName ? '#FFFFFF' : '#F8FAFC',
    border: focusedField === fieldName ? '2px solid #001D3D' : '2px solid #E2E8F0',
    borderRadius: 16,
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: focusedField === fieldName ? '0 0 0 4px rgba(0,29,61,0.06)' : 'none',
  });

  if (success) {
    return (
      <div style={{ 
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40, background: '#001D3D', fontFamily: "'DM Sans', sans-serif",
        overflow: 'hidden', position: 'relative'
      }}>
        <style>{injectStyles}</style>
        {/* Background Effects */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)', animation: 'canPulseGlow 8s infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,127,130,0.1) 0%, transparent 70%)', animation: 'canPulseGlow 10s infinite 1s' }} />

        <div style={{ 
          maxWidth: 600, width: '100%', textAlign: 'center',
          animation: 'canSlideUp 0.8s ease-out', position: 'relative', zIndex: 10
        }}>
          <div style={{
            width: 100, height: 100, borderRadius: 32,
            background: 'linear-gradient(135deg, #D4AF37, #F0D060)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 40px', boxShadow: '0 20px 40px rgba(212,175,55,0.3)',
            animation: 'canFloat 3s ease-in-out infinite'
          }}>
            <CheckCircle2 size={50} style={{ color: '#001D3D' }} />
          </div>

          <h2 style={{ fontSize: 42, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Candidature Transmise
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, lineHeight: 1.6, marginBottom: 48 }}>
            Félicitations {formData.prenom}. Votre dossier est désormais entre les mains de notre équipe RH.
          </p>

          <div style={{ 
            background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 32,
            padding: 48, marginBottom: 48, position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.05 }}>
              <Zap size={150} color="#D4AF37" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.4em', display: 'block', marginBottom: 20 }}>
              Accusé de Réception Digital
            </span>
            <div style={{ 
              fontSize: 64, fontWeight: 900, color: '#FFFFFF', 
              letterSpacing: '-0.01em', marginBottom: 20,
              textShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              {success.numero_suivi}
            </div>
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em'
            }}>
              <Search size={14} /> Référence à conserver précieusement
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            <button 
              onClick={() => navigate(`/candidature/suivi?numero=${success.numero_suivi}`)}
              style={{
                padding: '18px 36px', background: '#FFFFFF', color: '#001D3D',
                borderRadius: 100, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Suivre mon dossier <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => setSuccess(null)}
              style={{
                padding: '18px 36px', background: 'transparent', color: '#FFFFFF',
                borderRadius: 100, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
                border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'all 0.3s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = '#FFFFFF'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            >
              Nouveau Dépôt
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div style={{ 
      minHeight: '100vh', background: '#FFFFFF', 
      fontFamily: "'DM Sans', sans-serif", color: '#001D3D',
      paddingBottom: 100
    }}>
      <style>{injectStyles}</style>
      
      {/* ── Fixed Premium Header ── */}
      <div style={{ 
        sticky: 'top', position: 'sticky', top: 0, zIndex: 100, 
        background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #E2E8F0', padding: '16px 40px'
      }}>
        <div style={{ 
          maxWidth: 1400, margin: '0 auto', display: 'flex', 
          alignItems: 'center', justifyContent: 'space-between' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ 
              width: 44, height: 44, background: '#001D3D', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37'
            }}>
              <ClipboardList size={20} />
            </div>
            <div>
              <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', color: '#D4AF37', letterSpacing: '0.3em' }}>GIAS Industries</span>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: '#001D3D', margin: 0, letterSpacing: '-0.01em' }}>Assistant de Recrutement</h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {steps.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: step >= s.id ? '#001D3D' : '#F1F5F9',
                  color: step >= s.id ? '#FFFFFF' : '#94A3B8',
                  fontSize: 12, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.4s'
                }}>
                  {step > s.id ? <CheckCircle2 size={16} /> : s.id}
                </div>
                {step === s.id && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#001D3D', display: 'none', lg: 'block' }}>{s.label}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: `${progress}%`, height: 3, background: '#D4AF37', transition: 'width 0.6s ease-in-out' }} />
      </div>

      <div style={{ maxWidth: 900, margin: '80px auto 0', padding: '0 40px' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: 60, animation: 'canSlideUp 0.8s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: 14, border: '1px solid #E2E8F0', color: '#D4AF37' }}>
              {steps[step-1].icon}
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Étape {step} / 5</span>
              <h2 style={{ fontSize: 36, fontWeight: 900, color: '#001D3D', margin: 0, letterSpacing: '-0.02em' }}>{steps[step-1].desc}</h2>
            </div>
          </div>
          {error && (
            <div style={{ 
              padding: '16px 20px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 16,
              color: '#DC2626', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12, marginTop: 24
            }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}
        </div>

        <div style={{ 
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 32,
          padding: 60, boxShadow: '0 4px 60px rgba(0, 29, 61, 0.05)',
          position: 'relative', overflow: 'hidden'
        }}>
          {loading && (
            <div style={{ 
              position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', 
              backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', flexDirection: 'column', 
              alignItems: 'center', justifyContent: 'center' 
            }}>
              <RefreshCw size={48} className="animate-spin" style={{ color: '#D4AF37', marginBottom: 20 }} />
              <p style={{ fontSize: 11, fontWeight: 800, color: '#001D3D', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Envoi sécurisé...</p>
            </div>
          )}

          {/* ── STEP 1: Personnel ── */}
          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0 40px', animation: 'canFadeIn 0.6s' }}>
              <InputField label="Nom de famille *" icon={<User size={18} />} error={errors.nom} focused={focusedField === 'nom'}>
                <input type="text" name="nom" placeholder="VOTRE NOM" value={formData.nom} 
                  onFocus={() => setFocusedField('nom')} onBlur={() => setFocusedField(null)}
                  onChange={handleChange} style={inputStyle('nom')} />
              </InputField>
              <InputField label="Prénom(s) *" icon={<User size={18} />} error={errors.prenom} focused={focusedField === 'prenom'}>
                <input type="text" name="prenom" placeholder="Prénom" value={formData.prenom} 
                  onFocus={() => setFocusedField('prenom')} onBlur={() => setFocusedField(null)}
                  onChange={handleChange} style={inputStyle('prenom')} />
              </InputField>
              <InputField label="Email professionnel/étudiant *" icon={<Mail size={18} />} error={errors.email} focused={focusedField === 'email'}>
                <input type="email" name="email" placeholder="email@exemple.com" value={formData.email} 
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                  onChange={handleChange} style={inputStyle('email')} />
              </InputField>
              <InputField label="Contact Mobile" icon={<Phone size={18} />} optional focused={focusedField === 'telephone'}>
                <input type="tel" name="telephone" placeholder="+216 -- --- ---" value={formData.telephone} 
                  onFocus={() => setFocusedField('telephone')} onBlur={() => setFocusedField(null)}
                  onChange={handleChange} style={inputStyle('telephone')} />
              </InputField>
            </div>
          )}

          {/* ── STEP 2: Académique ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'canFadeIn 0.6s' }}>
              <InputField label="Établissement / Université *" icon={<Building2 size={18} />} error={errors.etablissement} focused={focusedField === 'etablissement'}>
                <input type="text" name="etablissement" placeholder="Université, Ecole..." value={formData.etablissement}
                  onFocus={() => setFocusedField('etablissement')} onBlur={() => setFocusedField(null)}
                  onChange={handleChange} style={inputStyle('etablissement')} />
              </InputField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
                <InputField label="Filière / Spécialisation *" error={errors.filiere} focused={focusedField === 'filiere'}>
                  <input type="text" name="filiere" placeholder="Ex: Informatique, Marketing..." value={formData.filiere}
                    onFocus={() => setFocusedField('filiere')} onBlur={() => setFocusedField(null)}
                    onChange={handleChange} style={inputStyle('filiere', false)} />
                </InputField>
                <InputField label="Niveau actuel *" error={errors.niveau} focused={focusedField === 'niveau'}>
                  <select name="niveau" value={formData.niveau} onChange={handleChange}
                    onFocus={() => setFocusedField('niveau')} onBlur={() => setFocusedField(null)}
                    style={inputStyle('niveau', false)}>
                    <option value="">Sélectionner</option>
                    {["Bac+1", "Bac+2", "Bac+3 (Licence)", "Bac+4", "Bac+5 (Master/Ing)", "Bac+8"].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </InputField>
              </div>
            </div>
          )}

          {/* ── STEP 3: Stage ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'canFadeIn 0.6s' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
                <InputField label="Département souhaité" optional focused={focusedField === 'departement_souhaite'}>
                  <select name="departement_souhaite" value={formData.departement_souhaite} onChange={handleChange} 
                    onFocus={() => setFocusedField('departement_souhaite')} onBlur={() => setFocusedField(null)}
                    style={inputStyle('departement_souhaite', false)}>
                    <option value="">Indifférent</option>
                    {departements.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                  </select>
                </InputField>
                <InputField label="Type de Stage *" error={errors.type_stage} focused={focusedField === 'type_stage'}>
                  <select name="type_stage" value={formData.type_stage} onChange={handleChange}
                    onFocus={() => setFocusedField('type_stage')} onBlur={() => setFocusedField(null)}
                    style={inputStyle('type_stage', false)}>
                    <option value="pfe">PFE — Fin d'études</option>
                    <option value="ete">Stage d'été</option>
                    <option value="initiation">initiation / Observation</option>
                    <option value="professionnel">Ré-insertion</option>
                  </select>
                </InputField>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
                <InputField label="Date de début *" icon={<Calendar size={18} />} error={errors.date_debut} focused={focusedField === 'date_debut'}>
                  <input type="date" name="date_debut" value={formData.date_debut} 
                    onFocus={() => setFocusedField('date_debut')} onBlur={() => setFocusedField(null)}
                    onChange={handleChange} style={inputStyle('date_debut')} />
                </InputField>
                <InputField label="Date de fin *" icon={<Calendar size={18} />} error={errors.date_fin} focused={focusedField === 'date_fin'}>
                  <input type="date" name="date_fin" value={formData.date_fin} 
                    onFocus={() => setFocusedField('date_fin')} onBlur={() => setFocusedField(null)}
                    onChange={handleChange} style={inputStyle('date_fin')} />
                </InputField>
              </div>

              {getDuration() && (
                <div style={{ 
                  padding: '24px 32px', background: 'rgba(212,175,55,0.05)', borderRadius: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  border: '1px solid rgba(212,175,55,0.2)', marginBottom: 24
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#001D3D' }}>
                    <Clock size={20} />
                    <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Durée Estimée</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#001D3D' }}>
                    {getDuration()} <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>semaines</span>
                  </div>
                </div>
              )}

              <InputField label="Thématique du projet" optional focused={focusedField === 'theme'}>
                <textarea name="theme" value={formData.theme} onChange={handleChange} rows={4}
                  onFocus={() => setFocusedField('theme')} onBlur={() => setFocusedField(null)}
                  placeholder="Décrivez brièvement vos objectifs..."
                  style={{...inputStyle('theme', false), height: 'auto', resize: 'none', padding: '20px'}} />
              </InputField>
            </div>
          )}

          {/* ── STEP 4: Documents ── */}
          {step === 4 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, animation: 'canFadeIn 0.6s' }}>
              {[
                { name: 'cv', label: 'Curriculum Vitae', icon: <Upload size={32} />, required: true },
                { name: 'lm', label: 'Lettre de Motivation', icon: <FileText size={32} />, required: false }
              ].map((doc) => (
                <div key={doc.name} style={{ textAlign: 'center' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#001D3D', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16 }}>
                    {doc.label} {doc.required && '*'}
                  </label>
                  <div style={{
                    position: 'relative', height: 240, borderRadius: 28, border: '2px dashed #E2E8F0',
                    background: formData[doc.name] ? 'rgba(0,127,130,0.05)' : '#F8FAFC',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: 30, transition: 'all 0.3s', cursor: 'pointer',
                    borderColor: formData[doc.name] ? '#007F82' : '#E2E8F0'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#001D3D'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = formData[doc.name] ? '#007F82' : '#E2E8F0'}
                  >
                    <input type="file" name={doc.name} accept=".pdf" onChange={handleFile} 
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                    <div style={{ 
                      width: 64, height: 64, borderRadius: 20, background: '#FFFFFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: formData[doc.name] ? '#007F82' : '#94A3B8',
                      marginBottom: 20, boxShadow: '0 8px 16px rgba(0,0,0,0.05)'
                    }}>
                      {formData[doc.name] ? <CheckCircle2 size={32} /> : doc.icon}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#001D3D', margin: 0 }}>
                      {formData[doc.name] ? formData[doc.name].name : "Choisir un fichier"}
                    </p>
                    <p style={{ fontSize: 10, color: '#94A3B8', marginTop: 8 }}>PDF uniquement (5Mo max)</p>
                  </div>
                  {errors[doc.name] && <p style={{ color: '#EF4444', fontSize: 11, fontWeight: 600, marginTop: 8 }}>{errors[doc.name]}</p>}
                </div>
              ))}
            </div>
          )}

          {/* ── STEP 5: Récap ── */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'canFadeIn 0.6s' }}>
              {[
                { title: "Profil Personnel", data: [["Nom", `${formData.prenom} ${formData.nom}`], ["Contact", formData.email]] },
                { title: "Formation", data: [["Établissement", formData.etablissement], ["Niveau", formData.niveau]] },
                { title: "Projet de Stage", data: [["Type", formData.type_stage.toUpperCase()], ["Période", `${formData.date_debut} au ${formData.date_fin}`]] }
              ].map((section, idx) => (
                <div key={idx} style={{ 
                  background: '#F8FAFC', borderRadius: 24, padding: 32,
                  border: '1px solid #E2E8F0'
                }}>
                  <h4 style={{ fontSize: 11, fontWeight: 800, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 20 }}>
                    {section.title}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {section.data.map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#001D3D' }}>{val || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Navigation */}
          <div style={{ 
            marginTop: 60, paddingTop: 40, borderTop: '1px solid #E2E8F0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            {step > 1 ? (
              <button onClick={prev} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                color: '#64748B', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
                transition: 'all 0.3s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#001D3D'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
              >
                <ChevronLeft size={18} /> Précédent
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: 16 }}>
              {step < 5 ? (
                <button onClick={next} style={{
                  padding: '16px 32px', background: '#001D3D', color: '#FFFFFF',
                  borderRadius: 14, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
                  display: 'flex', alignItems: 'center', gap: 10,
                  boxShadow: '0 10px 20px rgba(0,29,61,0.15)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Suivant <ChevronRight size={18} style={{ color: '#D4AF37' }} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} style={{
                  padding: '18px 40px', background: 'linear-gradient(135deg, #001D3D, #002855)', color: '#FFFFFF',
                  borderRadius: 100, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em',
                  display: 'flex', alignItems: 'center', gap: 12,
                  boxShadow: '0 20px 40px rgba(0,29,61,0.2)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {loading ? <RefreshCw className="animate-spin" size={20} /> : <>Soumettre <Send size={18} /></>}
                </button>
              )}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 60, fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4em' }}>
          CSM GIAS © PORTAIL RECRUTEMENT V6.0 — TUNISIE
        </p>
      </div>
    </div>
  );
}