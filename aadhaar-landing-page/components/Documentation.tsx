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
              The Aadhaar Intelligence System is an AI-driven decision support platform that transforms raw Aadhaar operational data into actionable intelligence for government officers at district, state, and national levels.
            </p>
            <div className="bg-blue-50 border-l-4 border-govt-blue p-4 my-6">
              <h4 className="font-bold text-govt-blue mb-2">Key Capabilities</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                <li>Early detection of service disruptions (27-day advance warning)</li>
                <li>Anomaly detection with 94% accuracy</li>
                <li>Predictive analytics for resource planning</li>
                <li>Policy-safe recommendations with explainability</li>
                <li>Real-time alerts for 700+ districts</li>
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
              <h3 className="font-bold mb-4">5-Tier Architecture</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <div className="min-w-[80px] font-bold text-gray-500">Tier 1</div>
                  <div>
                    <strong className="text-gray-900">Frontend (React + Tailwind)</strong>
                    <p className="text-gray-600">District, State, and National Dashboards with PWA support.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="min-w-[80px] font-bold text-gray-500">Tier 2</div>
                  <div>
                    <strong className="text-gray-900">API Gateway (Node.js)</strong>
                    <p className="text-gray-600">Handles ThreatPilot Security, Rate Limiting, and Authentication.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="min-w-[80px] font-bold text-gray-500">Tier 3</div>
                  <div>
                    <strong className="text-gray-900">Job Orchestration (BullMQ)</strong>
                    <p className="text-gray-600">Batch scheduler and queue management for heavy lifting.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="min-w-[80px] font-bold text-gray-500">Tier 4</div>
                  <div>
                    <strong className="text-gray-900">ML Pipeline (Python)</strong>
                    <p className="text-gray-600">Anomaly detection, forecasting, and risk scoring models.</p>
                  </div>
                </li>
                 <li className="flex gap-3">
                  <div className="min-w-[80px] font-bold text-gray-500">Tier 5</div>
                  <div>
                    <strong className="text-gray-900">Data Layer</strong>
                    <p className="text-gray-600">PostgreSQL (Structured), Redis (Cache), TimescaleDB (Time-series).</p>
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
                    UIDAI Datasets → Ingestion → Cleaning → Aggregation → ML Analysis → Index Computation → Dashboard Display
                </p>
                <p className="text-gray-600 text-sm">
                    Processing Frequency: Batch processing runs every 24 hours. Manual overrides available for critical updates.
                </p>
            </div>
          </section>

          {/* CORE FEATURES */}
          <section id="alert-system" className="scroll-mt-24 mb-16">
             <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="text-red-500" /> Alert System
            </h2>
            <p className="mb-4 text-gray-600">The system categorizes operational risks into three severity levels based on the Demand Pressure Index (DPI).</p>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm text-left text-gray-600 border rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700 uppercase">
                  <tr>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Color</th>
                    <th className="px-6 py-3">Condition</th>
                    <th className="px-6 py-3">Required Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-bold text-red-600">Critical</td>
                    <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span></td>
                    <td className="px-6 py-4">DPI &gt 2.5</td>
                    <td className="px-6 py-4">Immediate</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-bold text-orange-600">High</td>
                    <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span></td>
                    <td className="px-6 py-4">1.5 &lt; DPI &le; 2.5</td>
                    <td className="px-6 py-4">Within 48 hours</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-bold text-green-600">Normal</td>
                    <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span></td>
                    <td className="px-6 py-4">DPI &le; 1.5</td>
                    <td className="px-6 py-4">Monitoring</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Example Alert Payload</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="block text-gray-500">District</span>
                        <span className="font-semibold">Jaipur, Rajasthan</span>
                    </div>
                     <div>
                        <span className="block text-gray-500">Alert Type</span>
                        <span className="font-semibold text-red-600">Biometric Update Stress</span>
                    </div>
                     <div>
                        <span className="block text-gray-500">Deviation</span>
                        <span className="font-semibold">340% above baseline</span>
                    </div>
                     <div>
                        <span className="block text-gray-500">Probable Cause</span>
                        <span className="font-semibold">Center infrastructure failure</span>
                    </div>
                </div>
            </div>
          </section>

          <section id="predictive-analytics" className="scroll-mt-24 mb-16">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Predictive Analytics</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-800 mb-2">Demand Forecasting</h4>
                    <ul className="list-disc pl-4 text-sm text-gray-600 space-y-1">
                        <li>6-month ahead predictions</li>
                        <li>91% accuracy on historical validation</li>
                        <li>Seasonal pattern recognition</li>
                    </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-800 mb-2">Risk Scoring</h4>
                    <ul className="list-disc pl-4 text-sm text-gray-600 space-y-1">
                        <li>Composite Risk Score (0-10 scale)</li>
                        <li>Weighted multi-factor analysis</li>
                        <li>District-level granularity</li>
                    </ul>
                </div>
            </div>
          </section>

          <section id="dashboard-views" className="scroll-mt-24 mb-16">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Dashboard Views</h3>
            <div className="space-y-4">
                <div className="border-l-4 border-govt-blue pl-4">
                    <h4 className="font-bold text-gray-800">District Officer View</h4>
                    <p className="text-sm text-gray-600">Active alerts for assigned district, Local trend charts (6-month history), Action buttons (Resolve, Escalate).</p>
                </div>
                 <div className="border-l-4 border-govt-saffron pl-4">
                    <h4 className="font-bold text-gray-800">State Officer View</h4>
                    <p className="text-sm text-gray-600">Cross-district comparisons, Resource allocation heatmap, State-level trend analysis.</p>
                </div>
                 <div className="border-l-4 border-govt-green pl-4">
                    <h4 className="font-bold text-gray-800">National Officer View</h4>
                    <p className="text-sm text-gray-600">Strategic overview (all states), Inter-state performance comparison, National policy recommendations.</p>
                </div>
            </div>
          </section>

          {/* TECHNICAL SPECS */}
          <section id="data-processing" className="scroll-mt-24 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Cpu className="text-purple-600" /> Technical Specifications
            </h2>
            
            <h3 className="text-lg font-bold text-gray-800 mb-3">Index Computation Algorithms</h3>
            <p className="text-gray-600 mb-4">The core logic for determining operational stress.</p>
            
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-4 text-gray-300 font-mono text-xs overflow-x-auto">
                <p className="text-gray-500 mb-2">// Demand Pressure Index (DPI)</p>
                <p>DPI = 0.4 * (Current - Baseline)/Baseline +</p>
                <p className="pl-12">0.3 * Growth_Rate_30day +</p>
                <p className="pl-12">0.3 * Volatility_90day</p>
                <br/>
                <p className="text-gray-500 mb-2">// Operational Stress Index (OSI)</p>
                <p>OSI = 0.5 * DPI +</p>
                <p className="pl-12">0.3 * Update_Backlog_Ratio +</p>
                <p className="pl-12">0.2 * Center_Utilization_Rate</p>
              </div>
            </div>
          </section>

          <section id="performance-metrics" className="scroll-mt-24 mb-16">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-govt-blue">87%</div>
                    <div className="text-xs text-gray-500">Anomaly Precision</div>
                </div>
                 <div className="bg-gray-50 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-govt-blue">99.2%</div>
                    <div className="text-xs text-gray-500">SQLi Blocking</div>
                </div>
                 <div className="bg-gray-50 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-govt-blue">&lt;500ms</div>
                    <div className="text-xs text-gray-500">API Latency</div>
                </div>
                 <div className="bg-gray-50 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-govt-blue">99.7%</div>
                    <div className="text-xs text-gray-500">System Uptime</div>
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
                        <h5 className="font-bold text-sm text-govt-blue">Layer 1: ThreatPilot (Runtime Protection)</h5>
                        <p className="text-xs text-gray-600">SQL Injection prevention (99.2% detection), XSS blocking, CSRF validation.</p>
                    </div>
                    <div>
                        <h5 className="font-bold text-sm text-govt-blue">Layer 2: Authentication</h5>
                        <p className="text-xs text-gray-600">Google OAuth federated identity, JWT tokens (24h expiry), Stateless auth.</p>
                    </div>
                     <div>
                        <h5 className="font-bold text-sm text-govt-blue">Layer 3: Authorization</h5>
                        <p className="text-xs text-gray-600">Role-Based Access Control (RBAC) with District/State/National tiers.</p>
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
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">POST</span>
                    <code className="text-sm font-bold">/api/auth/login</code>
                </div>
                <CodeBlock 
code={`// Request
{
  "email": "officer@uidai.gov",
  "password": "SecurePass123",
  "role": "district_officer"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "district": "Jaipur"
  },
  "expiresIn": 86400
}`} 
language="json" 
                />
            </div>
          </section>

          <section id="alerts-api" className="scroll-mt-24 mb-16">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">GET</span>
                    <code className="text-sm font-bold">/api/alerts</code>
                </div>
                <p className="text-sm text-gray-600 mb-2">Fetch active alerts with optional filtering.</p>
                <CodeBlock 
code={`// Query: GET /api/alerts?district=Jaipur&severity=critical

{
  "alerts": [
    {
      "id": "alert_12345",
      "type": "Biometric Update Stress",
      "severity": "critical",
      "deviation": 340,
      "actions": ["Deploy mobile units", "Audit center"]
    }
  ],
  "total": 23
}`} 
language="json" 
                />
            </div>
          </section>

          <section id="analytics-api" className="scroll-mt-24 mb-16">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">GET</span>
                    <code className="text-sm font-bold">/api/analytics/trends</code>
                </div>
                <p className="text-sm text-gray-600 mb-2">Retrieve trend data and forecasts.</p>
                 <CodeBlock 
code={`// Query: GET /api/analytics/trends?district=Jaipur&metric=enrollment

{
  "district": "Jaipur",
  "data": [{ "month": "2025-07", "value": 12500 }],
  "forecast": [{ "month": "2026-02", "value": 13200 }]
}`} 
language="json" 
                />
            </div>
          </section>

          {/* DEPLOYMENT */}
          <section id="local-dev" className="scroll-mt-24 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Deployment</h2>
            <h3 className="text-lg font-bold text-gray-800 mb-3">Local Development</h3>
            <p className="text-gray-600 mb-4">Steps to set up the environment locally for development.</p>
            
            <CodeBlock 
code={`# Clone repository
git clone https://github.com/team-rajat/uidai-intelligence.git
cd uidai-intelligence

# Install dependencies
npm install
pip install -r requirements.txt

# Start services using Docker
docker-compose up -d

# Run frontend
npm run dev`}
            />
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800 mt-4">
                <strong>Note:</strong> You must configure the <code>.env</code> file with valid PostgreSQL and Redis credentials before starting the application.
            </div>
          </section>

          <section id="production" className="scroll-mt-24 mb-16">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Production Setup</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li><strong>Infrastructure:</strong> Minimum 4 vCPU, 16GB RAM, Load Balancer.</li>
                <li><strong>Docker:</strong> Build optimized images for frontend, backend, and ML pipeline.</li>
                <li><strong>Kubernetes:</strong> Use provided Helm charts for orchestration.</li>
                <li><strong>Monitoring:</strong> Prometheus + Grafana for metrics, Sentry for error tracking.</li>
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
                    <strong>Dashboard not loading?</strong> Check API reachability, clear browser cache, or verify JWT expiry.
                </div>
                 <div className="p-3 bg-orange-50 border border-orange-100 rounded">
                    <strong>Alerts not updating?</strong> Verify BullMQ worker status and Redis queue health.
                </div>
                 <div className="p-3 bg-blue-50 border border-blue-100 rounded">
                    <strong>Auth Failures?</strong> Check Google OAuth credentials and ensure IP is within India.
                </div>
            </div>
          </section>

          <section id="faq" className="scroll-mt-24 mb-16">
            <h3 className="text-lg font-bold text-gray-800 mb-3">FAQ</h3>
            <div className="space-y-4">
                <details className="group border border-gray-200 rounded-lg open:bg-gray-50">
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-gray-900">
                        How often is data updated?
                        <ChevronRight className="transition group-open:rotate-90" size={16} />
                    </summary>
                    <div className="border-t border-gray-200 p-4 text-sm text-gray-600">
                        Batch processing runs every 24 hours. Manual sync is available for critical needs.
                    </div>
                </details>
                <details className="group border border-gray-200 rounded-lg open:bg-gray-50">
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-gray-900">
                        Is offline access possible?
                        <ChevronRight className="transition group-open:rotate-90" size={16} />
                    </summary>
                    <div className="border-t border-gray-200 p-4 text-sm text-gray-600">
                        Yes, the PWA supports offline viewing of cached dashboard data.
                    </div>
                </details>
                 <details className="group border border-gray-200 rounded-lg open:bg-gray-50">
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-gray-900">
                        How is privacy ensured?
                        <ChevronRight className="transition group-open:rotate-90" size={16} />
                    </summary>
                    <div className="border-t border-gray-200 p-4 text-sm text-gray-600">
                        No Aadhaar UIDs are stored. All analytics use tokenized references and aggregated data.
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
            <p>Last updated: January 20, 2026</p>
            <p>License: MIT (Open Source)</p>
          </footer>

        </div>
      </div>
    </div>
  );
};