import React from 'react';
import { ShieldCheck, Database, Fingerprint } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative bg-white overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 pattern-grid-lg text-govt-blue"></div>
      
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 relative z-10 flex flex-col md:flex-row items-center">
        
        {/* Text Content */}
        <div className="w-full md:w-1/2 mb-10 md:mb-0 md:pr-10">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-govt-blue"></span>
            <span className="text-xs font-semibold text-govt-blue tracking-wide uppercase">AI-Powered Governance</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Strengthening Identity with <span className="text-govt-blue">Artificial Intelligence</span>
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
            The Aadhaar Intelligence System leverages advanced machine learning to ensure de-duplication, fraud prevention, and seamless authentication for over 1.38 billion residents.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex items-center justify-center bg-govt-saffron text-white px-6 py-3 rounded font-semibold shadow-md hover:bg-orange-600 transition-colors">
              <ShieldCheck className="mr-2 h-5 w-5" />
              Verify Aadhaar
            </button>
            <button className="flex items-center justify-center bg-white text-govt-blue border border-govt-blue px-6 py-3 rounded font-semibold hover:bg-blue-50 transition-colors">
              <Database className="mr-2 h-5 w-5" />
              View Analytics
            </button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative">
             {/* Abstract Govt Tech Illustration using CSS/SVG */}
             <div className="w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-blue-50 to-white rounded-full border-4 border-gray-100 flex items-center justify-center shadow-inner">
                <div className="absolute top-0 right-0 p-4 bg-white rounded-lg shadow-lg animate-bounce border-l-4 border-govt-green">
                    <p className="text-xs font-bold text-gray-500">System Status</p>
                    <p className="text-sm font-bold text-govt-green flex items-center gap-1">
                        <span className="w-2 h-2 bg-govt-green rounded-full"></span> Operational
                    </p>
                </div>
                <div className="absolute bottom-10 left-[-20px] p-4 bg-white rounded-lg shadow-lg border-l-4 border-govt-saffron">
                    <p className="text-xs font-bold text-gray-500">Daily Auth</p>
                    <p className="text-sm font-bold text-gray-800">100 Million+</p>
                </div>
                <Fingerprint className="text-govt-blue opacity-20 w-48 h-48" />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};