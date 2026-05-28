import React from 'react';

export default function Qualite() {
  return (
    <section className="py-20 bg-blue-50 border-y border-blue-100 text-center">
      <div className="max-w-5xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-[var(--brand-primary)] mb-4">Démarche Qualité</h3>
        <p className="text-lg text-[var(--text-secondary)] mb-8">
          Certifications reconnues mondialement attestant de notre rigueur.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {['ISO 9001', 'ISO 22000', 'ISO 14001'].map(iso => (
            <div key={iso} className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl border border-gray-200 shadow-sm font-bold text-gray-800 text-lg">
              {iso}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}