/**
 * ProtectedRoute Component
 * Protège les routes nécessitant une authentification
 */

import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Pendant le chargement, afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  // Si pas connecté, rediriger vers la page de connexion
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier les rôles autorisés
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role || user.type_utilisateur;
    if (!allowedRoles.includes(userRole)) {
      // Rediriger selon le rôle pour éviter les boucles
      const redirect = userRole === 'stagiaire' ? '/home-stagiaire' : '/dashboard';
      return <Navigate to={redirect} replace />;
    }
  }

  // Sinon, afficher le contenu protégé
  return children;
};

export default ProtectedRoute;
