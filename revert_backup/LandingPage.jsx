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