import React from 'react';
import { StatItem } from '../types';

const STATS: StatItem[] = [
  { label: 'Aadhaar Generated', value: '1.38 Billion', description: 'Total unique identities issued' },
  { label: 'Authentications', value: '102.5 Billion', description: 'Secure transactions processed' },
  { label: 'e-KYC Completed', value: '16.8 Billion', description: 'Paperless verifications done' },
  { label: 'Savings', value: '₹ 2.5 Trillion', description: 'Estimated savings to exchequer' },
];

export const Stats: React.FC = () => {
  return (
    <section id="stats" className="bg-govt-blue text-white py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-3">Scale of Operations</h3>
          <p className="text-blue-200 text-lg">Real-time impact metrics of the Aadhaar ecosystem.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm p-8 rounded-lg border border-blue-400/30 hover:border-blue-400/50 transition-colors">
              <p className="text-4xl font-bold text-white mb-3 font-mono tracking-tight">{stat.value}</p>
              <p className="text-sm font-bold text-blue-100 uppercase tracking-wider mb-2">{stat.label}</p>
              <p className="text-xs text-blue-300 leading-relaxed">{stat.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
            <p className="text-xs text-blue-300 italic">Data as of last quarter. Source: UIDAI Analytics Dashboard.</p>
        </div>
      </div>
    </section>
  );
};