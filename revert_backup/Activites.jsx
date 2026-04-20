import React from 'react';

const data = [
  { title: 'Margarine', icon: '🧈' },
  { title: 'Chocolat', icon: '🍫' },
  { title: 'Produits de boulangerie', icon: '🥐' }
];

export default function Activites() {
  return (
    <section className="py-20 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-12">Nos Activités</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.map((item, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all text-center flex flex-col items-center">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h4 className="text-xl font-bold text-gray-800">{item.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}