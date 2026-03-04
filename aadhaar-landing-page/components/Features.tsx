import React from 'react';
import { FeatureItem } from '../types';
import { Activity, Siren, Map, BarChart2, Brain, FileCheck } from 'lucide-react';

const FEATURES: FeatureItem[] = [
  {
    title: 'Nationwide Risk Monitoring',
    description: 'AI continuously analyses Aadhaar enrolment and update data across all states and districts to surface abnormal spikes, drops, and operational stress in near real-time.',
    icon: <Activity className="w-8 h-8 text-govt-blue" />,
  },
  {
    title: 'Early-Warning Anomaly Detection',
    description: 'Machine learning models detect unusual patterns before they escalate into service breakdowns, fraud risks, or accessibility gaps—moving from reaction to prevention.',
    icon: <Siren className="w-8 h-8 text-govt-blue" />,
  },
  {
    title: 'District-Level Intelligence',
    description: 'Every district is monitored independently, allowing officers to identify localised issues that national averages completely hide.',
    icon: <Map className="w-8 h-8 text-govt-blue" />,
  },
  {
    title: 'Policy-Ready Indexes',
    description: 'Raw numbers are transformed into decision-friendly indexes like Demand Pressure, Operational Stress, and Accessibility Gap—designed for quick policy interpretation.',
    icon: <BarChart2 className="w-8 h-8 text-govt-blue" />,
  },
  {
    title: 'Explainable Alerts & Insights',
    description: 'Each alert comes with confidence scores, historical context, and explanatory signals so officers know what happened, why, and how serious it is.',
    icon: <Brain className="w-8 h-8 text-govt-blue" />,
  },
  {
    title: 'Actionable Policy Suggestions',
    description: 'Based on trends and predictive indicators, the system recommends suitable intervention frameworks—monitoring, capacity augmentation, outreach, or stabilisation.',
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