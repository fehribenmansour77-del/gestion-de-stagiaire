/**
 * Page: Échanges & Alertes — GIAS Premium V6
 * Centre de communication et de pilotage des notifications GIAS.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import userService from '../services/userService';
import { toast } from '../store/useToastStore';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Plus, 
  X, 
  Paperclip, 
  Send,
  MoreVertical,
  Calendar,
  User,
  AlertTriangle,
  FileText,
  Check,
  RefreshCw,
  Inbox,
  ArrowRight,
  Zap,
  ShieldCheck,
  Search,
  ChevronRight,
  Award,
  Sparkles,
  Target
} from 'lucide-react';

/* ── Type Data ── */
const typeLabels = {
  CANDIDATURE_NOUVELLE: 'Candidature Entrante',
  CANDIDATURE_ACCEPTEE: 'Candidature Validée',
  CANDIDATURE_REFUSEE: 'Candidature Rejetée',
  ABSENCE: 'Alerte Absence',
  EVALUATION: 'Évaluation de Stage',
  DOCUMENT: 'Nouveau Document',
  CONVENTION: 'Convention de Stage',
  PRESENCE: 'Pointage Présence',
  MESSAGE: 'Message Interne',
  SYSTEM: 'Notification Système'
};

const typeColors = {
  CANDIDATURE_NOUVELLE: '#001D3D',
  CANDIDATURE_ACCEPTEE: '#059669',
  CANDIDATURE_REFUSEE: '#DC2626',
  ABSENCE: '#D4AF37',
  EVALUATION: '#007F82',
  MESSAGE: '#001D3D',
  SYSTEM: '#94A3B8'
};

/* ── Global Styles ── */
const injectStyles = `
@keyframes notifSlideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes notifPulse { 0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); } 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); } }
.notif-glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.4); }
.notif-card { background: white; border: 1px solid #E2E8F0; border-radius: 28px; transition: all 0.4s ease; border-left: 4px solid transparent; }
.notif-card:hover { transform: translateX(8px); border-color: #001D3D; box-shadow: 0 15px 40px rgba(0,29,61,0.06); }
.notif-tab { padding: 18px 24px; border-radius: 20px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; display: flex; align-items: center; gap: 16px; transition: all 0.3s; border: none; cursor: pointer; width: 100%; text-align: left; }
.notif-unread { border-left-color: #D4AF37 !important; background: #FFFAF0; }
`;

export default function Notifications() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [msgType, setMsgType] = useState('received');
  
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ destinataire_id: '', objet: '', contenu: '', fichier: null });
  const [sending, setSending] = useState(false);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    loadData();
    loadContacts();
  }, [user, msgType]);

  const loadContacts = async () => {
    try {
      const params = {};
      if (user?.role === 'stagiaire') {
        params.role = ['admin_rh', 'super_admin'];
      } else if (['admin_rh', 'super_admin'].includes(user?.role)) {
        params.role = 'stagiaire';
      }
      const data = await userService.listUsers(params);
      setContacts(data || []);
    } catch (error) {
       console.error('Erreur chargement contacts:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [notifData, msgData, countData] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getMessages({ type: msgType }),
        notificationService.getNotificationCount()
      ]);
      setNotifications(notifData.notifications || []);
      setMessages(msgData.messages || []);
      setUnreadCount(countData.count || 0);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      setUnreadCount(0);
      toast.success('Toutes les alertes sont archivées');
    } catch (error) {
       console.error(error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!composeData.destinataire_id || !composeData.contenu) {
      toast.warning('Informations manquantes');
      return;
    }
    try {
      setSending(true);
      await notificationService.sendMessage({
        destinataire_id: composeData.destinataire_id,
        sujet: composeData.objet,
        contenu: composeData.contenu,
        piece_jointe: composeData.fichier
      });
      toast.success('Communication transmise');
      setShowCompose(false);
      setComposeData({ destinataire_id: '', objet: '', contenu: '', fichier: null });
      if (msgType === 'sent') loadData();
    } catch (error) {
      toast.error('Échec de la transmission');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 100 }}>
       <style>{injectStyles}</style>

       <div style={{ maxWidth: 1240, margin: '0 auto', padding: '60px 20px' }}>
          
          {/* ── Header System ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 80, flexWrap: 'wrap', gap: 40 }}>
             <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <Bell size={18} style={{ color: '#D4AF37' }} />
                  <span style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Centre de Flux · GIAS Industries</span>
                </div>
                <h1 style={{ fontSize: 44, fontWeight: 900, color: '#001D3D', letterSpacing: '-0.02em', margin: 0 }}>Échanges & <span style={{ color: '#D4AF37' }}>Alertes</span></h1>
                <p style={{ color: '#64748B', fontSize: 16, marginTop: 12, fontWeight: 500, maxWidth: 600 }}>Gestion des communications internes et supervision des événements critiques de la plateforme.</p>
             </div>

             <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'white', padding: '12px 16px', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <div style={{ padding: '0 24px', textAlign: 'center' }}>
                   <p style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>Non lus</p>
                   <p style={{ fontSize: 24, fontWeight: 900, color: '#001D3D', margin: 0 }}>{unreadCount}</p>
                </div>
                {activeTab === 'notifications' && unreadCount > 0 && (
                   <button onClick={handleMarkAllRead} style={{ padding: '14px 28px', background: '#F1F5F9', color: '#001D3D', borderRadius: 16, border: 'none', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Check size={16} /> Tout marquer
                   </button>
                )}
                {activeTab === 'messages' && (
                   <button onClick={() => setShowCompose(true)} style={{ padding: '14px 28px', background: '#001D3D', color: 'white', borderRadius: 16, border: 'none', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Plus size={16} style={{ color: '#D4AF37' }} /> Nouveau
                   </button>
                )}
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 60, flexWrap: 'wrap' }}>
             
             {/* ── Sidebar Navigation ── */}
             <div style={{ spaceY: 32 }}>
                <div style={{ background: 'white', padding: 12, borderRadius: 32, border: '1px solid #E2E8F0' }}>
                   <p style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em', margin: '20px 0 20px 24px' }}>Flux Principal</p>
                   <button 
                     onClick={() => setActiveTab('notifications')}
                     className="notif-tab"
                     style={{ background: activeTab === 'notifications' ? '#001D3D' : 'transparent', color: activeTab === 'notifications' ? 'white' : '#64748B' }}
                   >
                     <Inbox size={20} style={{ color: activeTab === 'notifications' ? '#D4AF37' : 'inherit' }} /> Alertes Système
                   </button>
                   <button 
                     onClick={() => setActiveTab('messages')}
                     className="notif-tab"
                     style={{ background: activeTab === 'messages' ? '#001D3D' : 'transparent', color: activeTab === 'messages' ? 'white' : '#64748B', marginTop: 8 }}
                   >
                     <MessageSquare size={20} style={{ color: activeTab === 'messages' ? '#D4AF37' : 'inherit' }} /> Dossiers Internes
                   </button>
                </div>

                {activeTab === 'messages' && (
                  <div style={{ marginTop: 32, background: '#F1F5F9', padding: 12, borderRadius: 32, border: '1px solid #E2E8F0' }}>
                      <p style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em', margin: '20px 0 20px 24px' }}>Filtres Message</p>
                      <button 
                        onClick={() => setMsgType('received')}
                        className="notif-tab"
                        style={{ padding: '14px 20px', background: msgType === 'received' ? 'white' : 'transparent', color: '#001D3D', shadow: msgType === 'received' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none' }}
                      >Réception</button>
                      <button 
                        onClick={() => setMsgType('sent')}
                        className="notif-tab"
                        style={{ padding: '14px 20px', background: msgType === 'sent' ? 'white' : 'transparent', color: '#001D3D', marginTop: 4 }}
                      >Envoyés</button>
                  </div>
                )}
             </div>

             {/* ── Main Content Area ── */}
             <div style={{ animation: 'notifSlideIn 0.5s ease' }}>
                {loading ? (
                   <div style={{ padding: 100, textAlign: 'center', background: 'white', borderRadius: 40, border: '1px solid #E2E8F0' }}>
                      <RefreshCw size={40} className="animate-spin" style={{ color: '#D4AF37', margin: '0 auto 24px' }} />
                      <p style={{ fontSize: 11, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Synchronisation...</p>
                   </div>
                ) : (
                  <div style={{ display: 'grid', gap: 24 }}>
                     {activeTab === 'notifications' && (
                        notifications.length === 0 ? (
                           <div style={{ padding: 100, textAlign: 'center', background: 'white', borderRadius: 40, border: '1px solid #E2E8F0' }}>
                              <Award size={64} style={{ color: '#E2E8F0', marginBottom: 24 }} />
                              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#001D3D', margin: '0 0 8px' }}>Tout est à jour</h3>
                              <p style={{ color: '#94A3B8', fontWeight: 600 }}>Aucune alerte prioritaire en attente.</p>
                           </div>
                        ) : notifications.map(notif => (
                           <div 
                             key={notif.id} 
                             onClick={() => !notif.lu && handleMarkRead(notif.id)}
                             className={`notif-card ${!notif.lu ? 'notif-unread' : ''}`}
                             style={{ padding: '32px 40px', cursor: 'pointer' }}
                           >
                              <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                                 <div style={{ width: 44, height: 44, borderRadius: 14, background: '#F8FAFC', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeColors[notif.type] || '#001D3D' }}>
                                    <Zap size={22} />
                                 </div>
                                 <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                       <h4 style={{ fontSize: 17, fontWeight: 900, color: '#001D3D', margin: 0 }}>{typeLabels[notif.type]}</h4>
                                       <span style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>{formatDate(notif.createdAt)}</span>
                                    </div>
                                    <p style={{ fontSize: 15, color: '#64748B', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>{notif.message}</p>
                                    {!notif.lu && (
                                       <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 9, fontWeight: 900, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4AF37', animation: 'notifPulse 2s infinite' }} /> À consulter
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        ))
                     )}

                     {activeTab === 'messages' && (
                        messages.length === 0 ? (
                           <div style={{ padding: 100, textAlign: 'center', background: 'white', borderRadius: 40, border: '1px solid #E2E8F0' }}>
                              <Mail size={64} style={{ color: '#E2E8F0', marginBottom: 24 }} />
                              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#001D3D', margin: '0 0 8px' }}>Boîte vide</h3>
                           </div>
                        ) : messages.map(msg => (
                           <div key={msg.id} className="notif-card" style={{ padding: 0, overflow: 'hidden' }}>
                              <div style={{ padding: '24px 40px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#001D3D', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 }}>
                                       {msgType === 'received' ? msg.expediteur?.prenom?.charAt(0) : msg.destinataire?.prenom?.charAt(0)}
                                    </div>
                                    <div>
                                       <p style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                          {msgType === 'received' ? 'Expéditeur' : 'Destinataire'}
                                       </p>
                                       <p style={{ fontSize: 14, fontWeight: 800, color: '#001D3D', margin: 0 }}>
                                          {msgType === 'received' ? `${msg.expediteur?.prenom} ${msg.expediteur?.nom}` : `${msg.destinataire?.prenom} ${msg.destinataire?.nom}`}
                                       </p>
                                    </div>
                                 </div>
                                 <span style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>{formatDate(msg.createdAt)}</span>
                              </div>
                              <div style={{ padding: 40 }}>
                                 <h5 style={{ fontSize: 20, fontWeight: 900, color: '#001D3D', marginBottom: 16, letterSpacing: '-0.01em' }}>{msg.objet}</h5>
                                 <p style={{ fontSize: 16, color: '#64748B', fontWeight: 500, lineHeight: 1.8, margin: 0, fontStyle: 'italic' }}>"{msg.contenu}"</p>
                                 {msg.fichier && (
                                    <div style={{ marginTop: 32, padding: 24, background: '#F1F5F9', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                       <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                          <Paperclip size={18} style={{ color: '#D4AF37' }} />
                                          <span style={{ fontSize: 13, fontWeight: 700, color: '#001D3D' }}>{msg.fichier}</span>
                                       </div>
                                       <button style={{ padding: '8px 20px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>Ouvrir</button>
                                    </div>
                                 )}
                              </div>
                           </div>
                        ))
                     )}
                  </div>
                )}
             </div>

          </div>
       </div>

       {/* ── Compose Modal ── */}
       {showCompose && (
         <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,29,61,0.4)', backdropFilter: 'blur(10px)' }} onClick={() => setShowCompose(false)}></div>
            <div className="notif-card" style={{ position: 'relative', width: '100%', maxWidth: 700, padding: 0, overflow: 'hidden', boxShadow: '0 50px 100px rgba(0,0,0,0.2)', border: 'none' }}>
               <div style={{ padding: '40px', background: '#001D3D', color: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                        <h3 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Nouvelle Communication</h3>
                        <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 8 }}>Espace d'échanges sécurisé GIAS</p>
                     </div>
                     <button onClick={() => setShowCompose(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><X size={28} /></button>
                  </div>
               </div>
               <form onSubmit={handleSend} style={{ padding: 60 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
                     <div className="form-group">
                        <label style={{ fontSize: 11, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Réseau Talent / RH</label>
                        <select 
                           style={{ width: '100%', padding: '16px', border: '1.5px solid #E2E8F0', borderRadius: 16, fontWeight: 600, fontSize: 14 }}
                           value={composeData.destinataire_id}
                           onChange={e => setComposeData({...composeData, destinataire_id: e.target.value})}
                           required
                        >
                           <option value="">Sélectionnez un contact...</option>
                           {contacts.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom} ({c.role})</option>)}
                        </select>
                     </div>
                     <div className="form-group">
                        <label style={{ fontSize: 11, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Objet de l'échange</label>
                        <input 
                           type="text" 
                           style={{ width: '100%', padding: '16px', border: '1.5px solid #E2E8F0', borderRadius: 16, fontWeight: 600, fontSize: 14 }}
                           placeholder="Entrez un sujet..."
                           value={composeData.objet}
                           onChange={e => setComposeData({...composeData, objet: e.target.value})}
                           required
                        />
                     </div>
                  </div>

                  <div style={{ marginBottom: 40 }}>
                     <label style={{ fontSize: 11, fontWeight: 900, color: '#001D3D', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Votre Message</label>
                     <textarea 
                        style={{ width: '100%', minHeight: 180, padding: 32, border: '1.5px solid #E2E8F0', borderRadius: 24, fontWeight: 500, fontSize: 15, lineHeight: 1.6, resize: 'none', fontStyle: 'italic' }}
                        placeholder="Rédigez ici..."
                        value={composeData.contenu}
                        onChange={e => setComposeData({...composeData, contenu: e.target.value})}
                        required
                     />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>
                        <ShieldCheck size={16} style={{ color: '#059669' }} /> Transmission Sécurisée
                     </div>
                     <button 
                        type="submit" 
                        disabled={sending}
                        style={{ padding: '20px 48px', background: '#001D3D', color: '#FFFFFF', borderRadius: 20, border: 'none', fontWeight: 900, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: '0.3s' }}
                     >
                        {sending ? <RefreshCw className="animate-spin" size={18} /> : <>Envoyer <Send size={18} style={{ color: '#D4AF37' }} /></>}
                     </button>
                  </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );
}
