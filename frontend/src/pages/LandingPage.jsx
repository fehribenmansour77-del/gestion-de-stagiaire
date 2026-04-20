import React, { useEffect } from 'react';
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
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="font-inter min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Header />
      <div className="flex-grow">
        <Hero />
        <div className="reveal-on-scroll"><Presentation /></div>
        <div className="reveal-on-scroll"><Activites /></div>
        <div className="reveal-on-scroll"><Departements /></div>
        <div className="reveal-on-scroll"><Mission /></div>
        <div className="reveal-on-scroll"><Valeurs /></div>
        <div className="reveal-on-scroll"><Qualite /></div>
      </div>
      <Footer />
    </div>
  );
}