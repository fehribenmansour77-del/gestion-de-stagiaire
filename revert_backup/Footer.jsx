import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#1B254B] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">CSM GIAS</h2>
        <p className="text-white/60">© {new Date().getFullYear()} CSM GIAS - Tous droits réservés</p>
      </div>
    </footer>
  );
}