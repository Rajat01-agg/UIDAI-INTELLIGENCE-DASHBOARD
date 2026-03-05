import React from 'react';
import { StatItem } from '../types';

const STATS: StatItem[] = [
  { label: 'Districts Monitored', value: '700+', description: 'District-level granularity across India' },
  { label: 'Risk Metrics Computed', value: '2,135+', description: 'DerivedMetrics (district × month × metric)' },
  { label: 'Anomalies Detected', value: '226', description: 'ML-detected anomalies with confidence scores' },
  { label: 'States & UTs Covered', value: '36', description: 'Complete national coverage' },
];

export const Stats: React.FC = () => {
  return (
    <section id="stats" className="bg-govt-blue text-white py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-3">Intelligence at Scale</h3>
          <p className="text-blue-200 text-lg">Key metrics from the UIDAI Intelligence System.</p>
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
            <p className="text-xs text-blue-300 italic">Data computed by ML pipeline. Source: UIDAI Intelligence System (Dec 2024 dataset).</p>
        </div>
      </div>
    </section>
  );
};