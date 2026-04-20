const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/fehri/OneDrive/Bureau/projet pfe/my-project/frontend/src/components/landing';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const headerContent = `
import React from 'react';
import { Link } from 'react-router-dom';
import { BuildingOfficeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Header() {
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
            <Link to="/login" className="bg-[var(--brand-primary)] hover:bg-[#3311cc] text-white px-5 py-2.5 rounded-lg font-medium shadow-md shadow-[var(--brand-primary)]/30 transition-all flex items-center gap-2">
              Se connecter
              <ArrowRightIcon className="w-4 h-4 text-white" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
`;

const heroContent = `
import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
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
          <Link to="/candidature" className="px-8 py-3.5 rounded-xl text-white bg-[var(--brand-primary)] font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            Postuler maintenant
          </Link>
          <a href="#presentation" className="px-8 py-3.5 rounded-xl text-[var(--text-primary)] bg-white border border-gray-200 font-medium shadow-sm hover:bg-gray-50 transition-all">
            Découvrir
          </a>
        </div>
      </div>
      <div className="absolute inset-0 bg-blue-50/30"></div>
    </section>
  );
}
`;

const presentationContent = `
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
`;

const activitesContent = `
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
`;

const departementsContent = `
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
`;

const missionContent = `
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
`;

const valeursContent = `
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
`;

const qualiteContent = `
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
`;

const footerContent = `
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
`;

const appLandingContent = `
import React from 'react';
import Header from '../components/landing/Header';
import Hero from '../components/landing/Hero';
import Presentation from '../components/landing/Presentation';
import Activites from '../components/landing/Activites';
import Departements from '../components/landing/Departements';
import Mission from '../components/landing/Mission';
import Valeurs from '../components/landing/Valeurs';
import Qualite from '../components/landing/Qualite';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="font-inter min-h-screen flex flex-col bg-white">
      <Header />
      <div className="flex-grow">
        <Hero />
        <Presentation />
        <Activites />
        <Departements />
        <Mission />
        <Valeurs />
        <Qualite />
      </div>
      <Footer />
    </div>
  );
}
`;

fs.writeFileSync(path.join(dir, 'Header.jsx'), headerContent.trim());
fs.writeFileSync(path.join(dir, 'Hero.jsx'), heroContent.trim());
fs.writeFileSync(path.join(dir, 'Presentation.jsx'), presentationContent.trim());
fs.writeFileSync(path.join(dir, 'Activites.jsx'), activitesContent.trim());
fs.writeFileSync(path.join(dir, 'Departements.jsx'), departementsContent.trim());
fs.writeFileSync(path.join(dir, 'Mission.jsx'), missionContent.trim());
fs.writeFileSync(path.join(dir, 'Valeurs.jsx'), valeursContent.trim());
fs.writeFileSync(path.join(dir, 'Qualite.jsx'), qualiteContent.trim());
fs.writeFileSync('c:/Users/fehri/OneDrive/Bureau/projet pfe/my-project/frontend/src/pages/LandingPage.jsx', appLandingContent.trim());
fs.writeFileSync(path.join(dir, 'Footer.jsx'), footerContent.trim());

console.log('✅ Pages successfully written to disk.');
