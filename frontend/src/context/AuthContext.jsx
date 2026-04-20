/**
 * AuthContext - Gestion de l'état d'authentification
 * Fournit l'état et les fonctions pour la connexion/déconnexion
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Rôles définis selon la constitution
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN_RH: 'admin_rh',
  CHEF_DEPARTEMENT: 'chef_departement',
  TUTEUR: 'tuteur',
  STAGIAIRE: 'stagiaire'
};

// Helper pour vérifier les permissions
export function hasPermission(role, permission) {
  const permissions = {
    [ROLES.SUPER_ADMIN]: ['*'],
    [ROLES.ADMIN_RH]: [
      'users:read', 'stagiaires:*', 'candidatures:*', 
      'conventions:*', 'presences:*', 'evaluations:*', 
      'documents:*', 'dashboard:read', 'notifications:*'
    ],
    [ROLES.CHEF_DEPARTEMENT]: [
      'users:read', 'stagiaires:read', 'conventions:read',
      'presences:*', 'evaluations:*', 'documents:*', 'dashboard:read'
    ],
    [ROLES.TUTEUR]: [
      'stagiaires:read', 'presences:*', 'evaluations:*', 
      'documents:*', 'dashboard:read'
    ],
    [ROLES.STAGIAIRE]: [
      'profile:*', 'documents:read'
    ]
  };
  
  const rolePerms = permissions[role] || [];
  return rolePerms.includes('*') || rolePerms.includes(permission);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (err) {
          // Token invalide ou expiré
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // Fonction de connexion
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      return userData;
    } catch (err) {
      const message = err.response?.data?.error || 'Erreur de connexion';
      setError(message);
      throw new Error(message);
    }
  }, []);

  // Fonction de déconnexion
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignorer les erreurs de déconnexion
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  }, []);

  // Fonction pour changer le mot de passe
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Erreur de changement de mot de passe';
      throw new Error(message);
    }
  }, []);

  // Fonction pour réinitialiser le mot de passe
  const requestPasswordReset = useCallback(async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Erreur de demande de réinitialisation';
      throw new Error(message);
    }
  }, []);

  // Fonction pour mettre à jour le profil
  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await api.put(`/users/${user.id}/profile`, profileData);
      setUser(response.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Erreur de mise à jour du profil';
      throw new Error(message);
    }
  }, [user?.id]);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    changePassword,
    requestPasswordReset,
    updateProfile,
    isAuthenticated: !!user,
    hasPermission: (permission) => user ? hasPermission(user.role, permission) : false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}

export default AuthContext;
