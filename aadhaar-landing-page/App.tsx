import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { ChatWidget } from './components/ChatWidget';
import { Documentation } from './components/Documentation';
import { View } from './types';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('home');

  const navigateTo = (view: View) => {
    setCurrentView(view);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="sticky top-0 z-50">
        <Navbar 
          isMenuOpen={isMenuOpen} 
          setIsMenuOpen={setIsMenuOpen} 
          currentView={currentView}
          onNavigate={navigateTo}
        />
      </header>

      <main className="flex-grow">
        {currentView === 'home' ? (
          <>
            <Hero />
            <Stats />
            <Features />
          </>
        ) : (
          <Documentation />
        )}
      </main>

      <Footer />
      {currentView === 'home' && <ChatWidget />}
    </div>
  );
}