import React from 'react';
import { Database, Brain, LayoutDashboard, FileText } from 'lucide-react';

export const Workflow: React.FC = () => {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-govt-saffron uppercase tracking-widest">System Workflow</span>
          <h2 className="text-3xl md:text-4xl font-bold text-govt-blue mt-2">
            From Data to Decisions in 4 Steps
          </h2>
        </div>

        <div className="relative">
            {/* Connecting line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-gray-200 -z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                {/* Step 1 */}
                <div className="bg-white p-6">
                    <div className="flex flex-col items-center text-center">
                        <Database className="w-10 h-10 text-gray-400 mb-4" />
                        <div className="w-16 h-16 rounded-full bg-govt-saffron text-white flex items-center justify-center text-2xl font-bold mb-6 border-4 border-white shadow-sm">
                            01
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Data Ingestion</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Aadhaar enrollment and update datasets processed and aggregated at district × month × metric level into PostgreSQL via Prisma ORM.
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
                        <h3 className="text-xl font-bold text-gray-900 mb-2">ML Analysis</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Python pipeline computes four risk indexes (0–10 scale), detects 226 anomalies, and generates 2,135 predictive indicators.
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
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Visual Dashboards</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Interactive heatmaps (Mapbox), 5 chart types (Chart.js), alerts with severity tiers, and role-based officer views.
                        </p>
                    </div>
                </div>

                {/* Step 4 */}
                <div className="bg-white p-6">
                    <div className="flex flex-col items-center text-center">
                        <FileText className="w-10 h-10 text-gray-400 mb-4" />
                        <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-bold mb-6 border-4 border-white shadow-sm">
                            04
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Report Generation</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            PDF intelligence reports generated on-demand with pdfkit and stored in Supabase cloud storage for download.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};