import React from 'react';

const deps = ['Production', 'Qualité', 'Marketing', 'Ressources Humaines', 'Informatique'];

export default function Departements() {
  return (
    <section className="py-20 bg-[var(--brand-primary)] text-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h3 className="text-3xl font-bold mb-12">Nos Départements</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {deps.map((dep, idx) => (
            <div key={idx} className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 font-medium text-lg hover:bg-white/20 transition-colors">
              {dep}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}