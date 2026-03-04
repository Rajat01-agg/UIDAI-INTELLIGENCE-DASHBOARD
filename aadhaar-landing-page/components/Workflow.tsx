import React from 'react';
import { Database, Brain, LayoutDashboard } from 'lucide-react';

export const Workflow: React.FC = () => {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-govt-saffron uppercase tracking-widest">System Workflow</span>
          <h2 className="text-3xl md:text-4xl font-bold text-govt-blue mt-2">
            From Data to Decisions in 3 Steps
          </h2>
        </div>

        <div className="relative">
            {/* Connecting line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-gray-200 -z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {/* Step 1 */}
                <div className="bg-white p-6">
                    <div className="flex flex-col items-center text-center">
                        <Database className="w-10 h-10 text-gray-400 mb-4" />
                        <div className="w-16 h-16 rounded-full bg-govt-saffron text-white flex items-center justify-center text-2xl font-bold mb-6 border-4 border-white shadow-sm">
                            01
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Continuous Data Ingestion</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            System processes Aadhaar enrollment and update datasets in batch mode, aggregating at district × month × metric level.
                        </p>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-6">
                    <div className="flex flex-col items-center text-center">
                        <Brain className="w-10 h-10 text-gray-400 mb-4" />
                        <div className="w-16 h-16 rounded-full bg-govt-blue text-white flex items-center justify-center text-2xl font-bold mb-6 border-4 border-white shadow-sm">
                            02
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Intelligent Analysis</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            ML pipeline learns baselines, detects anomalies, identifies trends, and computes risk indexes with explainability.
                        </p>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white p-6">
                    <div className="flex flex-col items-center text-center">
                        <LayoutDashboard className="w-10 h-10 text-gray-400 mb-4" />
                        <div className="w-16 h-16 rounded-full bg-govt-green text-white flex items-center justify-center text-2xl font-bold mb-6 border-4 border-white shadow-sm">
                            03
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Actionable Insights</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Role-based dashboards present alerts and policy recommendations to district, state, and national officers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mt-4">
            <a href="#" className="text-xs text-govt-blue font-semibold hover:underline">Learn More</a>
            <a href="#" className="text-xs text-govt-blue font-semibold hover:underline">Learn More</a>
            <a href="#" className="text-xs text-govt-blue font-semibold hover:underline">Learn More</a>
        </div>
      </div>
    </section>
  );
};