import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Hero() {
  const { user } = useAuth();
  
  return (
    <section className="relative bg-white overflow-hidden border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative z-10">
        <h2 className="text-5xl md:text-6xl font-extrabold text-[var(--text-primary)] tracking-tight mb-6">
          Bienvenue chez <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--brand-primary)] to-[#6b4cff]">CSM GIAS</span>
        </h2>
        <p className="text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
          Leader en ingrédients de pâtisserie et boulangerie. Nous révolutionnons le secteur avec excellence et innovation.
        </p>
        <div className="flex justify-center gap-4">
          {user ? (
            <div className="flex gap-4">
              <Link to="/candidature" className="px-8 py-3.5 rounded-xl text-white bg-[var(--brand-primary)] font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                {user.role === 'stagiaire' ? 'Déposer une candidature' : 'Aller au Dashboard'}
              </Link>
              {user.role === 'stagiaire' && (
                <Link to="/candidature/suivi" className="px-8 py-3.5 rounded-xl text-[var(--text-primary)] bg-white border border-gray-200 font-medium shadow-sm hover:bg-gray-50 transition-all">
                  Suivre mon dossier
                </Link>
              )}
            </div>
          ) : (
            <Link to="/register" className="px-8 py-3.5 rounded-xl text-white bg-[var(--brand-primary)] font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              Déposer ma candidature
            </Link>
          )}
          {!user && (
            <a href="#presentation" className="px-8 py-3.5 rounded-xl text-[var(--text-primary)] bg-white border border-gray-200 font-medium shadow-sm hover:bg-gray-50 transition-all">
              Découvrir
            </a>
          )}
        </div>
      </div>
      <div className="absolute inset-0 bg-blue-50/30"></div>
    </section>
  );
}