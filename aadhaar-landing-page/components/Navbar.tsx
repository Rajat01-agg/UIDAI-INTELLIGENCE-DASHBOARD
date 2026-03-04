import React from 'react';
import { Menu, X, Shield, Search, BookOpen } from 'lucide-react';
import { NavItem, View } from '../types';

interface NavbarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  currentView: View;
  onNavigate: (view: View) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isMenuOpen, setIsMenuOpen, currentView, onNavigate }) => {
  
  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (href === 'docs') {
      onNavigate('docs');
    } else {
      onNavigate('home');
      // If it's an anchor link and we are going home, wait a tick for render then scroll
      if (href.startsWith('#')) {
        setTimeout(() => {
          const element = document.querySelector(href);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
    setIsMenuOpen(false);
  };

  const NAV_ITEMS: NavItem[] = [
    { label: 'Home', href: '#' },
    { label: 'Services', href: '#features' },
    { label: 'Analytics', href: '#stats' },
    { label: 'Resources', href: '#' },
    { label: 'Documentation', href: 'docs' }, 
  ];

  return (
    <div className="w-full shadow-md bg-white">
      {/* Top Strip - National Colors */}
      <div className="h-1.5 w-full flex">
        <div className="w-1/3 bg-govt-saffron"></div>
        <div className="w-1/3 bg-white"></div>
        <div className="w-1/3 bg-govt-green"></div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo Section */}
          <div 
            className="flex items-center space-x-3 md:space-x-4 cursor-pointer" 
            onClick={() => onNavigate('home')}
          >
            <div className="flex flex-col items-center justify-center border-r-2 border-gray-200 pr-4">
               {/* Emulated Emblem */}
               <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="National Emblem" className="h-10 w-auto opacity-90" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-govt-blue leading-tight">
                Aadhaar Intelligence Dashboard
              </h1>
              <p className="text-xs md:text-sm text-gray-600 font-medium">
                Unique Identification Authority of India
              </p>
              <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide">
                Government of India
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-6">
            <nav className="flex space-x-6">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`text-sm font-medium transition-colors border-b-2 py-1 ${
                    (currentView === 'docs' && item.href === 'docs') || (currentView === 'home' && item.href === '#') 
                    ? 'text-govt-blue border-govt-blue' 
                    : 'text-gray-700 hover:text-govt-blue border-transparent hover:border-govt-blue'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <button className="p-2 text-gray-600 hover:text-govt-blue" aria-label="Search">
                <Search size={20} />
              </button>
              <a 
                href="http://localhost:3001" 
                className="bg-govt-blue text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm"
              >
                Official Login
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-govt-blue focus:outline-none focus:ring-2 focus:ring-govt-blue rounded"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gray-50 border-t border-gray-200">
          <nav className="flex flex-col px-4 py-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-white hover:text-govt-blue hover:shadow-sm"
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <a 
                href="http://localhost:3001" 
                className="w-full block text-center bg-govt-blue text-white px-4 py-2 rounded font-medium hover:bg-blue-800 transition-colors"
              >
                Official Login
              </a>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}; 