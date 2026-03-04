import React from 'react';
import { Code, Check, Database, Server, Smartphone, Globe } from 'lucide-react';

export const TechStack: React.FC = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-govt-green uppercase tracking-widest">Built With Trusted Technologies</span>
          <h2 className="text-3xl font-bold text-govt-blue mt-2">
            Government-Grade Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left Column: Tech Stack */}
          <div className="flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-6 border-b pb-2">Core Technology</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-white p-3 rounded shadow-sm border border-gray-100">
                    <Code className="w-5 h-5 text-gray-500" />
                    <span className="font-mono text-sm text-gray-700">React</span>
                </div>
                 <div className="flex items-center gap-3 bg-white p-3 rounded shadow-sm border border-gray-100">
                    <Server className="w-5 h-5 text-gray-500" />
                    <span className="font-mono text-sm text-gray-700">Node.js</span>
                </div>
                 <div className="flex items-center gap-3 bg-white p-3 rounded shadow-sm border border-gray-100">
                    <Database className="w-5 h-5 text-gray-500" />
                    <span className="font-mono text-sm text-gray-700">PostgreSQL</span>
                </div>
                 <div className="flex items-center gap-3 bg-white p-3 rounded shadow-sm border border-gray-100">
                    <Smartphone className="w-5 h-5 text-gray-500" />
                    <span className="font-mono text-sm text-gray-700">TailwindCSS</span>
                </div>
            </div>
          </div>

          {/* Right Column: Compliance */}
          <div className="flex flex-col justify-center">
             <h3 className="text-lg font-semibold text-gray-700 mb-6 border-b pb-2">Security & Compliance</h3>
             <ul className="space-y-3">
                {[
                    "UX4G Compliant",
                    "WCAG 2.0 AA Accessible",
                    "DPDP Act 2023 Aligned",
                    "Aadhaar Data Vault Ready",
                    "India-Only Geo-IP Restricted"
                ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-govt-green" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{item}</span>
                    </li>
                ))}
             </ul>
          </div>

        </div>
      </div>
    </section>
  );
};