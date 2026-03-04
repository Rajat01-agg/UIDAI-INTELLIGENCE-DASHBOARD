import React from 'react';
import { AlertTriangle, IndianRupee, BarChart3 } from 'lucide-react';

export const ProblemStatement: React.FC = () => {
  return (
    <section id="problem" className="bg-white py-20">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-govt-saffron uppercase tracking-widest">The Challenge</span>
          <h2 className="text-3xl md:text-4xl font-bold text-govt-blue mt-2">
            Current Aadhaar Operations Face Critical Gaps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group bg-white p-8 rounded-lg border border-gray-200 border-l-[3px] border-l-red-500 hover:shadow-lg transition-all duration-300">
            <div className="mb-4">
               <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delayed Detection</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Operational issues identified 28 days after occurrence, causing preventable disruptions affecting millions of citizens.
            </p>
            <div className="inline-block bg-red-50 text-red-700 text-sm font-bold px-3 py-1 rounded">
              4 weeks delay
            </div>
          </div>

          {/* Card 2 */}
          <div className="group bg-white p-8 rounded-lg border border-gray-200 border-l-[3px] border-l-govt-saffron hover:shadow-lg transition-all duration-300">
            <div className="mb-4">
               <IndianRupee className="w-12 h-12 text-govt-saffron mb-4" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">High Disruption Costs</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Emergency responses to service outages cost ₹2-5 Crores per incident due to reactive crisis management.
            </p>
            <div className="inline-block bg-orange-50 text-orange-700 text-sm font-bold px-3 py-1 rounded">
              ₹20-50 Cr annual cost
            </div>
          </div>

          {/* Card 3 */}
          <div className="group bg-white p-8 rounded-lg border border-gray-200 border-l-[3px] border-l-gray-500 hover:shadow-lg transition-all duration-300">
            <div className="mb-4">
               <BarChart3 className="w-12 h-12 text-gray-500 mb-4" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Limited Intelligence</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Manual analysis takes 40+ hours per month, providing only descriptive statistics without predictive insights.
            </p>
            <div className="inline-block bg-gray-100 text-gray-700 text-sm font-bold px-3 py-1 rounded">
              60% accuracy
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};