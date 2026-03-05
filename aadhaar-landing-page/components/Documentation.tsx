import React, { useState } from 'react';
import { 
  Book, 
  ChevronRight, 
  Copy, 
  Check, 
  Search, 
  Terminal, 
  Shield, 
  Server, 
  Activity,
  Cpu,
  Menu,
  AlertTriangle,
  HelpCircle,
  Lock,
  Database
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  items: { id: string; title: string }[];
}

const SECTIONS: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    items: [
      { id: 'introduction', title: 'Introduction' },
      { id: 'quick-start', title: 'Quick Start' },
      { id: 'first-login', title: 'First Login' }
    ]
  },
  {
    id: 'architecture',
    title: 'Architecture',
    items: [
      { id: 'system-overview', title: 'System Overview' },
      { id: 'data-flow', title: 'Data Flow' }
    ]
  },
  {
    id: 'core-features',
    title: 'Core Features',
    items: [
      { id: 'alert-system', title: 'Alert System' },
      { id: 'predictive-analytics', title: 'Predictive Analytics' },
      { id: 'dashboard-views', title: 'Dashboard Views' }
    ]
  },
  {
    id: 'technical-specs',
    title: 'Technical Specs',
    items: [
      { id: 'data-processing', title: 'Data Processing' },
      { id: 'performance-metrics', title: 'Performance Metrics' }
    ]
  },
  {
    id: 'security',
    title: 'Security',
    items: [
      { id: 'multi-layer', title: 'Multi-Layer Security' },
      { id: 'compliance', title: 'Compliance & Privacy' }
    ]
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    items: [
      { id: 'auth-api', title: 'Authentication' },
      { id: 'alerts-api', title: 'Alerts' },
      { id: 'analytics-api', title: 'Analytics' }
    ]
  },
  {
    id: 'deployment',
    title: 'Deployment',
    items: [
      { id: 'local-dev', title: 'Local Development' },
      { id: 'production', title: 'Production Setup' }
    ]
  },
  {
    id: 'support',
    title: 'Support',
    items: [
      { id: 'troubleshooting', title: 'Troubleshooting' },
      { id: 'faq', title: 'FAQ' },
      { id: 'contact', title: 'Contact' }
    ]
  }
];

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language = 'bash' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0f172a] border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">{language}</span>
        <button 
          onClick={handleCopy}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Copy code"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="bg-[#1e293b] p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-blue-100 leading-relaxed whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row relative">
      
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-800">Documentation</span>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out overflow-y-auto
        md:translate-x-0 md:sticky md:top-[72px] md:h-[calc(100vh-72px)]
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        pt-6 pb-10 px-6
      `}>
        
        <div className="mb-8">
           <div className="relative">
             <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
             <input 
               type="text" 
               placeholder="Search docs..." 
               className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-govt-blue/50"
             />
           </div>
        </div>

        <nav className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.id}>
              <h5 className="mb-3 text-sm font-bold text-gray-900 uppercase tracking-wider">
                {section.title}
              </h5>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className={`block w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors ${
                        activeSection === item.id 
                          ? 'text-govt-blue font-medium bg-blue-50 border-l-2 border-govt-blue' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-10 md:py-12">
        
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Book size={16} className="mr-2" />
          <span>Documentation</span>
          <ChevronRight size={14} className="mx-2" />
          <span className="font-medium text-gray-900 capitalize">{activeSection.replace(/-/g, ' ')}</span>
        </div>

        <div className="prose prose-blue max-w-none">
          
          {/* Header */}
          <div className="border-b border-gray-200 pb-8 mb-10">
            <h1 className="text-4xl font-bold text-govt-blue mb-4">UIDAI Intelligence System</h1>
            <p className="text-xl text-gray-600">
              Complete documentation for the AI-driven decision support platform.
            </p>
            <div className="flex gap-4 mt-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                v1.0.0
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Official Release
              </span>
            </div>
          </div>

          {/* GETTING STARTED */}
          <section id="introduction" className="scroll-mt-24 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="text-govt-saffron" /> Introduction
            </h2>
            <p className="text-gray-600 leading-7 mb-4">
              The Aadhaar Intelligence System is an AI-driven decision support platform that transforms raw Aadhaar operational data into actionable intelligence for government officers at district, state, and national levels. It processes 2,135+ district-month-metric records to surface anomalies, compute risk indexes, and generate PDF intelligence reports.
            </p>
            <div className="bg-blue-50 border-l-4 border-govt-blue p-4 my-6">
              <h4 className="font-bold text-govt-blue mb-2">Key Capabilities</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                <li>Four risk indexes on a 0–10 scale: Demand Pressure, Operational Stress, Update Accessibility Gap, Composite Risk</li>
                <li>Five-tier alert classification: Low, Normal, Moderate, High, Critical</li>
                <li>Interactive Mapbox-powered heatmap with geocoded district markers</li>
                <li>Five chart types: Trend Lines, Distribution, State Comparison, Radar, and Breakdown</li>
                <li>PDF report generation with Supabase cloud storage</li>
                <li>Anomaly detection with confidence scoring and historical context</li>
                <li>Role-based access (District / State / National officers) with Google OAuth</li>
              </ul>
            </div>
          </section>

          <section id="quick-start" className="scroll-mt-24 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
            <p className="mb-4">Access the live demo environment to explore features.</p>
            <div className="grid md:grid-cols-2 gap-6 my-6">
              <div className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-2">Live Demo</h3>
                <a href="https://uidai-intelligence.vercel.app" className="text-govt-blue hover:underline font-medium">uidai-intelligence.vercel.app</a>
              </div>
              <div className="border rounded-lg p-6 bg-gray-50">
                 <h3 className="font-bold text-lg mb-2">Test Credentials</h3>
                 <div className="space-y-3 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-500">District Officer:</span>
                      <span className="text-gray-900">district@uidai.gov / Demo2026</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">State Officer:</span>
                      <span className="text-gray-900">state@uidai.gov / Demo2026</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">National Officer:</span>
                      <span className="text-gray-900">national@uidai.gov / Demo2026</span>
                    </div>
                 </div>
              </div>
            </div>
          </section>

          <section id="first-login" className="scroll-mt-24 mb-16">
            <h3 className="text-xl font-bold text-gray-900 mb-3">First Login Steps</h3>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                <li>Navigate to the demo URL provided above.</li>
                <li>Click <strong>"Official Login"</strong> in the top right corner.</li>
                <li>Select your role (District, State, or National).</li>
                <li>Enter the test credentials or use "Sign in with Google" for authorized emails.</li>
                <li>On first access, you will see the operational dashboard customized for your jurisdiction.</li>
            </ol>
          </section>

          {/* ARCHITECTURE */}
          <section id="system-overview" className="scroll-mt-24 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Server className="text-govt-blue" /> System Overview
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold mb-4">4-Tier Architecture</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <div className="min-w-[80px] font-bold text-gray-500">Tier 1</div>
                  <div>
                    <strong className="text-gray-900">Frontend (React + TypeScript + Vite)</strong>
                    <p className="text-gray-600">Dashboard, Charts (Chart.js), Heatmap (Mapbox GL), Reports UI, and Alerts pages with Tailwind CSS styling.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="min-w-[80px] font-bold text-gray-500">Tier 2</div>
                  <div>
                    <strong className="text-gray-900">API Server (Express.js + TypeScript)</strong>
                    <p className="text-gray-600">REST API with JWT + Google OAuth authentication, India-only geo-IP restriction, rate limiting, and role-based access control.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="min-w-[80px] font-bold text-gray-500">Tier 3</div>
                  <div>
                    <strong className="text-gray-900">ML Pipeline (Python / FastAPI)</strong>
                    <p className="text-gray-600">Anomaly detection, trend forecasting, risk scoring models, and predictive indicators computation.</p>
                  </div>
                </li>
                 <li className="flex gap-3">
                  <div className="min-w-[80px] font-bold text-gray-500">Tier 4</div>
                  <div>
                    <strong className="text-gray-900">Data & Storage Layer</strong>
                    <p className="text-gray-600">PostgreSQL via Neon (Prisma ORM), Supabase Storage for PDF reports, Mapbox SDK for geocoding.</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section id="data-flow" className="scroll-mt-24 mb-16">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-gray-500" /> Data Flow
            </h3>
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <p className="text-sm font-mono text-gray-700 bg-gray-50 p-2 rounded mb-2">
                    UIDAI Datasets → Python ML Pipeline → PostgreSQL (DerivedMetrics, AnomalyResults, PredictiveIndicators) → Express API → React Frontend
                </p>
                <p className="text-gray-600 text-sm mb-2">
                    The ML pipeline processes raw Aadhaar enrollment and update data, computing four standardized indexes (0–10 scale) per district-month-metric combination. Results are stored in PostgreSQL via Prisma ORM and served through the Express.js REST API.
                </p>
                <p className="text-gray-600 text-sm">
                    PDF reports are generated server-side using pdfkit and uploaded to Supabase Storage for cloud-based download access.
                </p>
            </div>
          </section>

          {/* CORE FEATURES */}
          <section id="alert-system" className="scroll-mt-24 mb-16">
             <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="text-red-500" /> Alert System
            </h2>
            <p className="mb-4 text-gray-600">The system categorizes operational risks into five severity tiers based on index values on a 0–10 scale.</p>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm text-left text-gray-600 border rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700 uppercase">
                  <tr>
                    <th className="px-6 py-3">Tier</th>
                    <th className="px-6 py-3">Color</th>
                    <th className="px-6 py-3">Index Range (0–10)</th>
                    <th className="px-6 py-3">Required Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-bold text-red-600">Critical</td>
                    <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span></td>
                    <td className="px-6 py-4">≥ 8.0</td>
                    <td className="px-6 py-4">Immediate intervention</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-bold text-orange-600">High</td>
                    <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span></td>
                    <td className="px-6 py-4">6.0 – 8.0</td>
                    <td className="px-6 py-4">Within 48 hours</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-bold text-yellow-600">Moderate</td>
                    <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span></td>
                    <td className="px-6 py-4">4.0 – 6.0</td>
                    <td className="px-6 py-4">Scheduled review</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-bold text-blue-600">Normal</td>
                    <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span></td>
                    <td className="px-6 py-4">2.0 – 4.0</td>
                    <td className="px-6 py-4">Routine monitoring</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-bold text-green-600">Low</td>
                    <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span></td>
                    <td className="px-6 py-4">&lt; 2.0</td>
                    <td className="px-6 py-4">No action needed</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Indexes Monitored</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="block text-gray-500">Demand Pressure Index (DPI)</span>
                        <span className="font-semibold">Measures enrollment/update demand stress</span>
                    </div>
                     <div>
                        <span className="block text-gray-500">Operational Stress Index (OSI)</span>
                        <span className="font-semibold">Center capacity and processing load</span>
                    </div>
                     <div>
                        <span className="block text-gray-500">Update Accessibility Gap (UAG)</span>
                        <span className="font-semibold">Demographic vs biometric update disparity</span>
                    </div>
                     <div>
                        <span className="block text-gray-500">Composite Risk Score (CRS)</span>
                        <span className="font-semibold text-govt-blue">Weighted aggregate of all indexes</span>
                    </div>
                </div>
            </div>
          </section>

          <section id="predictive-analytics" className="scroll-mt-24 mb-16">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Predictive Analytics</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-800 mb-2">Trend Analysis</h4>
                    <ul className="list-disc pl-4 text-sm text-gray-600 space-y-1">
                        <li>Month-over-month trend tracking per metric category</li>
                        <li>Seasonal pattern recognition across districts</li>
                        <li>Contextual pivot by metric when single-month data</li>
                    </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-800 mb-2">Risk Scoring</h4>
                    <ul className="list-disc pl-4 text-sm text-gray-600 space-y-1">
                        <li>Composite Risk Score (0–10 scale)</li>
                        <li>Weighted multi-factor analysis across 4 indexes</li>
                        <li>District-level granularity for 700+ districts</li>
                    </ul>
                </div>
            </div>
          </section>

          <section id="dashboard-views" className="scroll-mt-24 mb-16">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Dashboard & Visualization Pages</h3>
            <div className="space-y-4">
                <div className="border-l-4 border-govt-blue pl-4">
                    <h4 className="font-bold text-gray-800">Dashboard Overview</h4>
                    <p className="text-sm text-gray-600">National summary cards, state-level risk overview, quick-access metrics for all four indexes with drill-down to district level.</p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-bold text-gray-800">Alerts Page</h4>
                    <p className="text-sm text-gray-600">High-risk district cards, anomaly detection results with confidence scores, severity-based filtering, and alert detail panels.</p>
                </div>
                <div className="border-l-4 border-govt-saffron pl-4">
                    <h4 className="font-bold text-gray-800">Charts & Analytics</h4>
                    <p className="text-sm text-gray-600">Five chart types powered by Chart.js: Trend Lines, Risk Distribution, State Comparison (bar + drill-down), Radar (multi-index), and Metric Breakdown (polar area).</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-bold text-gray-800">Heatmap</h4>
                    <p className="text-sm text-gray-600">Interactive Mapbox GL map with geocoded district markers, color-coded by risk severity. Supports state filtering with fly-to animation and zoom reset on clear.</p>
                </div>
                <div className="border-l-4 border-govt-green pl-4">
                    <h4 className="font-bold text-gray-800">Reports</h4>
                    <p className="text-sm text-gray-600">Generate intelligence PDF reports by state, district, period, and metric category. Download from Supabase Storage. Filter and list previously generated reports.</p>
                </div>
            </div>
          </section>

          {/* TECHNICAL SPECS */}
          <section id="data-processing" className="scroll-mt-24 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Cpu className="text-purple-600" /> Technical Specifications
            </h2>
            
            <h3 className="text-lg font-bold text-gray-800 mb-3">Index Computation (0–10 Scale)</h3>
            <p className="text-gray-600 mb-4">All four indexes are normalized to a 0–10 scale for consistent interpretation across the platform.</p>
            
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-4 text-gray-300 font-mono text-xs overflow-x-auto">
                <p className="text-gray-500 mb-2">// Demand Pressure Index (DPI) — 0 to 10</p>
                <p>DPI = normalize(</p>
                <p className="pl-8">0.4 * demand_deviation +</p>
                <p className="pl-8">0.3 * growth_rate_30day +</p>
                <p className="pl-8">0.3 * volatility_90day</p>
                <p>)</p>
                <br/>
                <p className="text-gray-500 mb-2">// Operational Stress Index (OSI) — 0 to 10</p>
                <p>OSI = normalize(</p>
                <p className="pl-8">0.5 * demand_pressure +</p>
                <p className="pl-8">0.3 * update_backlog_ratio +</p>
                <p className="pl-8">0.2 * center_utilization</p>
                <p>)</p>
                <br/>
                <p className="text-gray-500 mb-2">// Update Accessibility Gap (UAG) — 0 to 10</p>
                <p>UAG = |demographic_rate - biometric_rate| normalized</p>
                <br/>
                <p className="text-gray-500 mb-2">// Composite Risk Score (CRS) — 0 to 10</p>
                <p>CRS = weighted_avg(DPI, OSI, UAG)</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mt-8 mb-3">Database Schema (Prisma)</h3>
            <div className="bg-gray-900 rounded-lg p-4 text-gray-300 font-mono text-xs overflow-x-auto">
              <p className="text-gray-500 mb-2">// Key models in schema.prisma</p>
              <p>DerivedMetrics    — 2,135 rows (district × month × metric)</p>
              <p>AnomalyResult     — 226 detected anomalies with confidence</p>
              <p>PredictiveIndicator — 2,135 predictive scoring rows</p>
              <p>TrendResult       — Historical trend data</p>
              <p>Report / ReportFinding — Generated intelligence reports</p>
            </div>
          </section>

          <section id="performance-metrics" className="scroll-mt-24 mb-16">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Performance & Data Coverage</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-govt-blue">2,135</div>
                    <div className="text-xs text-gray-500">Derived Metrics</div>
                </div>
                 <div className="bg-gray-50 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-govt-blue">700+</div>
                    <div className="text-xs text-gray-500">Districts Covered</div>
                </div>
                 <div className="bg-gray-50 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-govt-blue">36</div>
                    <div className="text-xs text-gray-500">States & UTs</div>
                </div>
                 <div className="bg-gray-50 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-govt-blue">226</div>
                    <div className="text-xs text-gray-500">Anomalies Detected</div>
                </div>
            </div>
          </section>

          {/* SECURITY */}
          <section id="multi-layer" className="scroll-mt-24 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="text-gray-700" /> Security
            </h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b bg-gray-50 font-bold text-gray-700">Multi-Layer Security Architecture</div>
                <div className="p-4 space-y-4">
                    <div>
                        <h5 className="font-bold text-sm text-govt-blue">Layer 1: Authentication</h5>
                        <p className="text-xs text-gray-600">Google OAuth 2.0 federated identity via Passport.js, JWT tokens (1h expiry), stateless auth with <code>authenticateJWT</code> middleware on every protected route.</p>
                    </div>
                    <div>
                        <h5 className="font-bold text-sm text-govt-blue">Layer 2: Authorization (RBAC)</h5>
                        <p className="text-xs text-gray-600">Role-based access control with <code>requireMinimumRole("viewer")</code> middleware. Roles: viewer, district_officer, state_officer, national_officer, admin.</p>
                    </div>
                     <div>
                        <h5 className="font-bold text-sm text-govt-blue">Layer 3: Geo-IP Restriction</h5>
                        <p className="text-xs text-gray-600"><code>indiaOnlyAccess</code> middleware restricts API access to India-based IP addresses only. Applied to all authenticated routes.</p>
                    </div>
                    <div>
                        <h5 className="font-bold text-sm text-govt-blue">Layer 4: Rate Limiting</h5>
                        <p className="text-xs text-gray-600">Separate rate limiters for auth routes (<code>authRateLimiter</code>) and API routes (<code>apiRateLimiter</code>) to prevent abuse.</p>
                    </div>
                    <div>
                        <h5 className="font-bold text-sm text-govt-blue">Layer 5: ThreatPilot (Agentic AI)</h5>
                        <p className="text-xs text-gray-600">Autonomous AI-driven threat detection and infrastructure remediation via the ThreatPilot agentic workflow system.</p>
                    </div>
                </div>
            </div>
          </section>

          <section id="compliance" className="scroll-mt-24 mb-16">
             <h3 className="text-xl font-bold text-gray-900 mb-3">Compliance & Privacy</h3>
             <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li><strong>DPDP Act 2023:</strong> Full alignment with data principal rights.</li>
                <li><strong>Aadhaar Data Vault (ADV):</strong> Reference keys used; no actual UIDs stored.</li>
                <li><strong>Encryption:</strong> TLS 1.3 in-transit, AES-256 at-rest.</li>
                <li><strong>Geo-Fencing:</strong> Access restricted to India IP ranges only.</li>
             </ul>
          </section>

          {/* API REFERENCE */}
          <section id="auth-api" className="scroll-mt-24 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Terminal className="text-gray-700" /> API Reference
            </h2>
            
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">GET</span>
                    <code className="text-sm font-bold">/api/auth/google</code>
                </div>
                <p className="text-sm text-gray-600 mb-2">Initiates Google OAuth 2.0 login flow. Redirects to Google consent screen.</p>
                <CodeBlock
code={`// Callback redirects to frontend with token
GET /api/auth/google/callback

// Response: Redirect to
// {FRONTEND_URL}?token={jwt}&user={encodedUserInfo}

// Get current user
GET /api/auth/me
// Response
{
  "id": "user_uuid",
  "email": "officer@uidai.gov.in",
  "name": "Officer Name",
  "role": "state_officer"
}`}
language="json"
                />
            </div>
          </section>

          <section id="alerts-api" className="scroll-mt-24 mb-16">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">GET</span>
                    <code className="text-sm font-bold">/api/dashboard/overview</code>
                </div>
                <p className="text-sm text-gray-600 mb-2">Dashboard summary with high-risk districts, top anomalies, and state-level aggregations.</p>
                <CodeBlock
code={`// Additional dashboard endpoints
GET /api/dashboard/states-summary
GET /api/dashboard/states/:stateName/districts-summary

// Heatmap data
GET /api/heatmap?state=Rajasthan&indexType=compositeRiskScore

// Response includes district-level risk values 
// with coordinates for map rendering`}
language="json"
                />
            </div>
          </section>

          <section id="analytics-api" className="scroll-mt-24 mb-16">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">POST</span>
                    <code className="text-sm font-bold">/api/analytics/visuals</code>
                </div>
                <p className="text-sm text-gray-600 mb-2">Generate chart-ready data for all five visualization types.</p>
                 <CodeBlock
code={`// Request body
{
  "chartType": "trend|distribution|comparison|radar|breakdown",
  "state": "Rajasthan",
  "district": "Jaipur",
  "indexType": "compositeRiskScore",
  "metricCategory": "biometric_update",
  "year": 2024,
  "month": 12
}

// Report generation
POST /api/reports/generate
{
  "year": 2024, "month": 12,
  "state": "Rajasthan",
  "metricCategory": "biometric_update",
  "createdBy": "officer@uidai.gov.in"
}

// Report management
GET  /api/reports          — List with filters
GET  /api/reports/:id      — Get by ID
GET  /api/reports/:id/download — Download PDF
DELETE /api/reports/:id    — Delete report`}
language="json"
                />
            </div>
          </section>

          {/* DEPLOYMENT */}
          <section id="local-dev" className="scroll-mt-24 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Deployment</h2>
            <h3 className="text-lg font-bold text-gray-800 mb-3">Local Development</h3>
            <p className="text-gray-600 mb-4">Steps to set up the full-stack environment locally.</p>
            
            <CodeBlock 
code={`# Clone repository
git clone https://github.com/team-rajat/uidai-intelligence.git
cd uidai-intelligence

# Backend setup
cd aadhaar-backend
npm install
# Configure .env with:
#   DATABASE_URL (Neon PostgreSQL)
#   JWT_SECRET
#   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
#   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
#   MAPBOX_TOKEN
npx prisma generate
npx prisma db push
npm run dev          # Starts Express on port 3000

# Frontend setup (new terminal)
cd aadhaar-frontend
npm install
npm run dev          # Starts Vite on port 3001

# Landing page (optional)
cd aadhaar-landing-page
npm install
npm run dev          # Starts on port 3002

# ML Pipeline (optional)
cd aadhaar-backend/FastAPIML
pip install -r requirements.txt
uvicorn main:app --reload`}
            />
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800 mt-4">
                <strong>Note:</strong> You must configure the <code>.env</code> file with valid Neon PostgreSQL, Supabase, Google OAuth, and Mapbox credentials before starting the application.
            </div>
          </section>

          <section id="production" className="scroll-mt-24 mb-16">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Production Setup</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li><strong>Database:</strong> Neon PostgreSQL (serverless) with Prisma ORM migrations.</li>
                <li><strong>Storage:</strong> Supabase Storage for PDF report files (service role key bypasses RLS).</li>
                <li><strong>Frontend:</strong> Deploy via Vercel or any static host (Vite build output).</li>
                <li><strong>Backend:</strong> Deploy Express.js server on Railway, Render, or any Node.js host.</li>
                <li><strong>Reverse Proxy:</strong> Nginx configuration included for production routing.</li>
                <li><strong>ML Pipeline:</strong> FastAPI server deployed separately for model inference.</li>
            </ul>
          </section>

          {/* SUPPORT */}
          <section id="troubleshooting" className="scroll-mt-24 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-orange-500" /> Support
            </h2>
            <h3 className="text-lg font-bold text-gray-800 mb-3">Troubleshooting</h3>
            <div className="space-y-4 text-sm">
                <div className="p-3 bg-red-50 border border-red-100 rounded">
                    <strong>Dashboard not loading?</strong> Check backend API reachability (port 3000), clear browser cache, or verify JWT token expiry (1h).
                </div>
                 <div className="p-3 bg-orange-50 border border-orange-100 rounded">
                    <strong>Heatmap markers misplaced?</strong> Clear localStorage geocode cache (district_geocode_cache_v2). The system validates coordinates against state centers and auto-corrects with jitter fallback.
                </div>
                 <div className="p-3 bg-blue-50 border border-blue-100 rounded">
                    <strong>Auth Failures?</strong> Verify Google OAuth credentials in .env, check that FRONTEND_URL is correct, and ensure your IP is within India (indiaOnlyAccess middleware).
                </div>
                 <div className="p-3 bg-purple-50 border border-purple-100 rounded">
                    <strong>Reports not generating?</strong> Ensure Supabase credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are set. The system auto-falls back to the latest available data period if no data exists for the requested month.
                </div>
            </div>
          </section>

          <section id="faq" className="scroll-mt-24 mb-16">
            <h3 className="text-lg font-bold text-gray-800 mb-3">FAQ</h3>
            <div className="space-y-4">
                <details className="group border border-gray-200 rounded-lg open:bg-gray-50">
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-gray-900">
                        What data does the system process?
                        <ChevronRight className="transition group-open:rotate-90" size={16} />
                    </summary>
                    <div className="border-t border-gray-200 p-4 text-sm text-gray-600">
                        The ML pipeline processes Aadhaar enrollment and update datasets, computing 2,135+ DerivedMetrics rows at district × month × metric granularity. It also generates 226 anomaly results and 2,135 predictive indicators.
                    </div>
                </details>
                <details className="group border border-gray-200 rounded-lg open:bg-gray-50">
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-gray-900">
                        What chart types are available?
                        <ChevronRight className="transition group-open:rotate-90" size={16} />
                    </summary>
                    <div className="border-t border-gray-200 p-4 text-sm text-gray-600">
                        Five chart types: Trend Lines (time-series), Risk Distribution (5-tier histogram), State Comparison (bar chart with drill-down), Radar (multi-index overlay), and Metric Breakdown (polar area). All powered by Chart.js with real backend data.
                    </div>
                </details>
                 <details className="group border border-gray-200 rounded-lg open:bg-gray-50">
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-gray-900">
                        How is privacy ensured?
                        <ChevronRight className="transition group-open:rotate-90" size={16} />
                    </summary>
                    <div className="border-t border-gray-200 p-4 text-sm text-gray-600">
                        No Aadhaar UIDs are stored. All analytics use aggregated district-level data. Access is restricted via JWT + Google OAuth, role-based authorization, and India-only geo-IP fencing.
                    </div>
                </details>
                 <details className="group border border-gray-200 rounded-lg open:bg-gray-50">
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-gray-900">
                        Where are generated reports stored?
                        <ChevronRight className="transition group-open:rotate-90" size={16} />
                    </summary>
                    <div className="border-t border-gray-200 p-4 text-sm text-gray-600">
                        PDF reports are generated server-side using pdfkit and uploaded to Supabase Storage. Reports can be downloaded, listed, and deleted through the Reports page.
                    </div>
                </details>
            </div>
          </section>

          <section id="contact" className="scroll-mt-24 mb-20">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Contact</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-white border rounded-lg">
                    <h4 className="font-bold text-base mb-2">Technical Support</h4>
                    <p className="text-sm text-gray-600 mb-4">For system bugs, API issues, and downtime reports.</p>
                    <a href="mailto:support@uidai-intelligence.gov.in" className="text-govt-blue hover:underline">support@uidai-intelligence.gov.in</a>
                </div>
                 <div className="p-6 bg-white border rounded-lg">
                    <h4 className="font-bold text-base mb-2">UIDAI Official Inquiries</h4>
                    <p className="text-sm text-gray-600 mb-4">For demo access, partnership, and security concerns.</p>
                    <a href="mailto:partnerships@uidai-intelligence.gov.in" className="text-govt-blue hover:underline">partnerships@uidai-intelligence.gov.in</a>
                </div>
            </div>
          </section>

          <footer className="border-t border-gray-200 pt-8 text-sm text-gray-500 flex justify-between">
            <p>Last updated: March 5, 2026</p>
            <p>License: MIT (Open Source)</p>
          </footer>

        </div>
      </div>
    </div>
  );
};