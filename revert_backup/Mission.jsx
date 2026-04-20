import React from 'react';

export default function Mission() {
  return (
    <section className="py-20 bg-gray-50 border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 text-center flex flex-col items-center">
        <div className="text-5xl mb-6">🚀</div>
        <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Notre Mission</h3>
        <p className="text-xl text-[var(--text-secondary)] italic">
          "Offrir des produits de haute qualité et satisfaire pleinement les exigences de nos clients."
        </p>
      </div>
    </section>
  );
}