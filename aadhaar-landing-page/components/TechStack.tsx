import React from 'react';
import { Code, Check, Database, Server, Smartphone, Globe, Map, BarChart3, FileText, Brain, Shield, Cloud } from 'lucide-react';

const TECH_ITEMS = [
  { icon: <Code className="w-5 h-5 text-gray-500" />, label: 'React + TypeScript' },
  { icon: <Server className="w-5 h-5 text-gray-500" />, label: 'Express.js' },
  { icon: <Database className="w-5 h-5 text-gray-500" />, label: 'PostgreSQL (Neon)' },
  { icon: <Database className="w-5 h-5 text-gray-500" />, label: 'Prisma ORM' },
  { icon: <Cloud className="w-5 h-5 text-gray-500" />, label: 'Supabase Storage' },
  { icon: <Map className="w-5 h-5 text-gray-500" />, label: 'Mapbox GL JS' },
  { icon: <BarChart3 className="w-5 h-5 text-gray-500" />, label: 'Chart.js' },
  { icon: <Brain className="w-5 h-5 text-gray-500" />, label: 'Python / FastAPI' },
  { icon: <Smartphone className="w-5 h-5 text-gray-500" />, label: 'Tailwind CSS' },
  { icon: <FileText className="w-5 h-5 text-gray-500" />, label: 'pdfkit' },
  { icon: <Globe className="w-5 h-5 text-gray-500" />, label: 'Vite' },
  { icon: <Shield className="w-5 h-5 text-gray-500" />, label: 'Passport.js + JWT' },
];

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
                {TECH_ITEMS.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-3 rounded shadow-sm border border-gray-100">
                    {item.icon}
                    <span className="font-mono text-sm text-gray-700">{item.label}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Right Column: Compliance */}
          <div className="flex flex-col justify-center">
             <h3 className="text-lg font-semibold text-gray-700 mb-6 border-b pb-2">Security & Compliance</h3>
             <ul className="space-y-3">
                {[
                    "Google OAuth 2.0 + JWT Authentication",
                    "Role-Based Access Control (RBAC)",
                    "India-Only Geo-IP Restricted",
                    "DPDP Act 2023 Aligned",
                    "Aadhaar Data Vault Ready",
                    "Rate Limiting on All Endpoints",
                    "ThreatPilot Agentic AI Security"
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