import React from 'react';

const valeurs = ['Respect', 'Intégrité', 'Travail d’équipe', 'Innovation'];

export default function Valeurs() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-12">Nos Valeurs</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {valeurs.map((val, idx) => (
            <div key={idx} className="flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl shadow-sm text-lg font-bold text-[var(--text-primary)]">
              {val}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}