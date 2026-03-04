import React from 'react';
import { Rocket, FileText } from 'lucide-react';

export const CallToAction: React.FC = () => {
  return (
    <section id="cta" className="bg-gradient-to-r from-govt-saffron to-orange-500 py-24 text-white">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
        
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Experience the Future of Aadhaar Governance
        </h2>
        
        <p className="text-xl opacity-90 mb-10 font-medium">
          See the live system in action with real Aadhaar dataset analysis
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
          <button className="bg-white text-govt-blue px-8 py-4 rounded-lg text-lg font-bold shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all flex items-center transform hover:-translate-y-1">
            <Rocket className="w-6 h-6 mr-3" />
            Access Live Demo
          </button>
          
          <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white/10 transition-all flex items-center">
            <FileText className="w-6 h-6 mr-3" />
            Download Technical Report
          </button>
        </div>
        
        <p className="text-sm opacity-80">
          Test credentials provided | Works on mobile | No installation required
        </p>

      </div>
    </section>
  );
};