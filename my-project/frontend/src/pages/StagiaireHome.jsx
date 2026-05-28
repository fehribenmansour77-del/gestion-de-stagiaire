import React from 'react';
import StagiaireDashboard from '../components/stagiaire/StagiaireDashboard';

/**
 * Page d'accueil dédiée aux stagiaires
 * Affiche le tableau de bord personnel (suivi de candidature ou stage)
 */
export default function StagiaireHome() {
  return (
    <div className="page-container fade-in">
      {/* Dasboard content handles its own internal structure for a cleaner look */}
      <StagiaireDashboard />
    </div>
  );
}
