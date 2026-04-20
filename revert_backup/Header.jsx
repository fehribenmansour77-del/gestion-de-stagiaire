import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BuildingOfficeIcon, ArrowLeftOnRectangleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--brand-primary)] text-white shadow-md">
              <BuildingOfficeIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--brand-primary)] to-[#6b4cff] m-0">CSM GIAS</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/home-stagiaire" className="hidden md:flex items-center gap-2 text-[var(--brand-primary)] font-semibold hover:opacity-80 px-4 py-2 border border-transparent hover:border-[var(--brand-primary)] rounded-lg transition-all">
                   Mon Espace
                </Link>
                <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2">
                  Se déconnecter
                  <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/register" className="hidden md:flex items-center gap-2 text-[var(--brand-primary)] font-semibold hover:opacity-80 px-4 py-2 border border-[var(--brand-primary)] rounded-lg transition-all">
                  Déposer Candidature
                </Link>
                <Link to="/login" className="bg-[var(--brand-primary)] hover:bg-[#3311cc] text-white px-5 py-2.5 rounded-lg font-medium shadow-md shadow-[var(--brand-primary)]/30 transition-all flex items-center gap-2">
                  Se connecter
                  <ArrowRightIcon className="w-4 h-4 text-white" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}