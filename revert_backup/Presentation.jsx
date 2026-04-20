import React from 'react';

export default function Presentation() {
  return (
    <section id="presentation" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-[var(--brand-primary)] text-sm font-bold mb-4">Qui sommes-nous ?</div>
        <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Présentation</h3>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
          CSM GIAS est une entreprise agroalimentaire spécialisée dans la production d'ingrédients pour pâtisserie et boulangerie. Forte de nombreuses années d'expérience, elle se positionne comme un partenaire incontournable des professionnels du goût.
        </p>
      </div>
    </section>
  );
}