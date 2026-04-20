import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarCheck,
  GraduationCap,
  LogOut,
  Bell,
  Building2,
  GitGraph,
  FileCheck,
  Settings,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  super_admin:      'Super Administrateur',
  admin_rh:         'Admin RH',
  chef_departement: 'Chef de Département',
  tuteur:           'Tuteur',
  stagiaire:        'Stagiaire',
};

const getMenuItems = (user) => [
  {
    section: 'PRINCIPAL',
    items: [
      { icon: <LayoutDashboard size={18} />, label: user?.role === 'stagiaire' ? 'Mon Espace' : 'Tableau de bord', id: user?.role === 'stagiaire' ? 'home-stagiaire' : 'dashboard', roles: ['admin_rh','super_admin','chef_departement','tuteur', 'stagiaire'] },
      { icon: <Users size={18} />,           label: 'Stagiaires',       id: 'stagiaires',       roles: ['admin_rh','super_admin','chef_departement','tuteur'] },
      { icon: <FileText size={18} />,        label: 'Candidatures',     id: 'candidatures',     roles: ['admin_rh','super_admin'], badge: null },
    ]
  },
  {
    section: 'ENTREPRISE',
    items: [
      { icon: <Building2 size={18} />,  label: 'Présentation',      id: 'presentation',       roles: ['admin_rh','super_admin','chef_departement','tuteur','stagiaire'] },
      { icon: <BookOpen size={18} />,    label: 'Règlement Interne', id: 'reglement',          roles: ['admin_rh','super_admin','chef_departement','tuteur','stagiaire'] },
      { icon: <GitGraph size={18} />,   label: 'Org. GIAS',         id: 'organigramme-gias',  roles: ['admin_rh','super_admin','chef_departement'] },
      { icon: <GitGraph size={18} />,   label: 'Org. CSM GIAS',     id: 'organigramme-csm',   roles: ['admin_rh','super_admin','chef_departement'] },
    ]
  },
  {
    section: 'ORGANISATION',
    items: [
      { icon: <Building2 size={18} />,  label: 'Départements',      id: 'departements',       roles: ['admin_rh','super_admin','chef_departement'] },
    ]
  },
  {
    section: 'SUIVI',
    items: [
      { icon: <CalendarCheck size={18} />, label: user?.role === 'stagiaire' ? 'Ma Présence' : 'Présences',    id: 'presences',   roles: ['admin_rh','super_admin','chef_departement','tuteur', 'stagiaire'] },
      { icon: <GraduationCap size={18} />, label: user?.role === 'stagiaire' ? 'Mes Évaluations' : 'Évaluations',  id: 'evaluations', roles: ['admin_rh','super_admin','chef_departement','tuteur', 'stagiaire'] },
      { icon: <FileCheck size={18} />,     label: 'Documents',    id: 'documents',   roles: ['admin_rh','super_admin'] },
    ]
  },
  {
    section: 'AUTRE',
    items: [
      { icon: <Bell size={18} />,     label: 'Notifications', id: 'notifications', roles: ['admin_rh','super_admin','chef_departement','tuteur','stagiaire'] },
    ]
  },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = `${user?.prenom?.charAt(0) ?? ''}${user?.nom?.charAt(0) ?? ''}`.toUpperCase();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">G</div>
        <div className="logo-text">
          <div className="logo-title">GIAS INDUSTRIES</div>
          <div className="logo-sub">GESTION STAGIAIRES</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {getMenuItems(user).map((section) => {
          const visible = section.items.filter(
            item => !item.roles || item.roles.includes(user?.role)
          );
          if (!visible.length) return null;

          return (
            <div key={section.section}>
              <p className="nav-section-label">{section.section}</p>
              {visible.map((item) => (
                <NavLink
                  key={item.id}
                  to={`/${item.id}`}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  {item.icon}
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge !== undefined && item.badge !== null && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-details">
            <div className="user-name">{user?.prenom} {user?.nom}</div>
            <div className="user-role">{ROLE_LABELS[user?.role] ?? user?.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
