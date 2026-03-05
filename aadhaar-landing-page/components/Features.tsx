import React from 'react';
import { FeatureItem } from '../types';
import { Activity, Siren, Map, BarChart2, Brain, FileCheck } from 'lucide-react';

const FEATURES: FeatureItem[] = [
  {
    title: 'Nationwide Risk Monitoring',
    description: 'Four standardized indexes (0–10 scale)—Demand Pressure, Operational Stress, Accessibility Gap, and Composite Risk—computed for 700+ districts across 36 states and UTs.',
    icon: <Activity className="w-8 h-8 text-govt-blue" />,
  },
  {
    title: 'Anomaly Detection Engine',
    description: '226 anomalies detected via the ML pipeline with confidence scoring and five-tier severity classification (Low → Critical). Each anomaly links to historical context for explainability.',
    icon: <Siren className="w-8 h-8 text-govt-blue" />,
  },
  {
    title: 'Interactive Heatmap',
    description: 'Mapbox GL-powered map with geocoded district markers, color-coded by risk severity. Supports state filtering with fly-to animation, coordinate validation, and zoom reset on clear.',
    icon: <Map className="w-8 h-8 text-govt-blue" />,
  },
  {
    title: 'Five Chart Visualizations',
    description: 'Trend lines, risk distribution histograms, state comparison bars with drill-down, radar overlays, and polar area breakdowns—all powered by Chart.js with real backend data.',
    icon: <BarChart2 className="w-8 h-8 text-govt-blue" />,
  },
  {
    title: 'Intelligence Report Generation',
    description: 'Generate PDF intelligence reports filtered by state, district, period, and metric category. Reports stored in Supabase cloud storage for download, listing, and management.',
    icon: <Brain className="w-8 h-8 text-govt-blue" />,
  },
  {
    title: 'Policy-Safe Recommendations',
    description: 'Predictive indicators feed into policy suggestion frameworks—monitoring, capacity augmentation, outreach, or stabilisation—presented to role-based officer dashboards.',
    icon: <FileCheck className="w-8 h-8 text-govt-blue" />,
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">From Aadhaar Data to Policy Intelligence</h2>
          <p className="text-gray-600">
            Turning Aadhaar Operations into Actionable Intelligence for data-driven governance.
          </p>
          <div className="h-1 w-20 bg-govt-saffron mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="mb-6 p-3 bg-blue-50 inline-block rounded-lg">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};