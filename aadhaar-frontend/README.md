# Aadhaar Intelligence System

A comprehensive dashboard for monitoring and analyzing the Aadhaar ecosystem across India. This system provides real-time insights into system health, capacity metrics, and risk indicators at state and district levels.

## 🎯 Overview

The Aadhaar Intelligence System is a data-driven analytics platform that tracks key metrics across the Aadhaar ecosystem:

- **Demand Pressure Index**: Measures transaction load and capacity utilization
- **Operational Stress Index**: Tracks system performance and stability
- **Accessibility Gap Index**: Identifies coverage and inclusion gaps
- **Composite Risk Index**: Overall health indicator combining multiple factors

## ✨ Features

### 📊 Dashboard
- Real-time KPI cards showing national-level metrics
- Total transactions, average demand pressure, operational stress
- High-risk district count and composite risk indicators
- State-level summary table with status indicators
- Drill-down capability to view district-level data
- Data sync functionality to refresh ML pipeline

### 🗺️ Heatmap
- Interactive India map with Leaflet
- District-level visualization colored by selected index
- Tooltips showing detailed metrics on hover
- Filter by state, district, time period, and index type
- Color-coded legend (Low → Critical)

### 📈 Charts & Visuals
- Dynamic Chart.js visualizations
- Line charts for trend analysis
- Bar charts for comparative analysis
- Pie charts for distribution analysis
- Filter-driven chart generation

### 📄 Reports
- Generate custom reports with filters
- Download reports in various formats
- View report history with status tracking
- Delete old/unnecessary reports
- Filter by state, district, time period, and metrics

### 🚨 Alerts & Notifications
- System-detected anomalies and trends
- Severity-based categorization (Critical/High/Medium/Low)
- Alert type filtering (Anomaly/Trend/Gap/Capacity)
- Region-specific alert details
- Confidence scores for ML-detected issues

### 🎯 Policy Frameworks
- Policy-safe solution frameworks (not prescriptive)
- Organized by framework type:
  - Capacity Augmentation
  - Operational Stabilization
  - Inclusion Outreach
  - Monitor Only
- Priority indicators and detailed descriptions
- Expandable cards with framework details

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Maps**: Leaflet with react-leaflet
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect, custom hooks)

## 📁 Project Structure

```
├── components/           # React components
│   ├── Dashboard.tsx    # Main dashboard with KPIs
│   ├── HeatmapPage.tsx  # Interactive India map
│   ├── ChartsPage.tsx   # Chart.js visualizations
│   ├── ReportsPage.tsx  # Report generation & management
│   ├── AlertsPage.tsx   # Alerts & notifications
│   ├── PolicyPage.tsx   # Policy frameworks
│   ├── FilterBar.tsx    # Reusable filter component
│   ├── StateDetailsPanel.tsx  # District drill-down modal
│   ├── Sidebar.tsx      # Navigation sidebar
│   └── Header.tsx       # App header
├── services/            # API services
│   └── aadhaarApi.ts   # API client with mock fallbacks
├── hooks/              # Custom React hooks
│   └── useFilters.ts   # Centralized filter management
├── types.ts            # TypeScript type definitions
├── constants.tsx       # Color palette and helpers
├── App.tsx            # Main app component with routing
└── index.tsx          # App entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rajstories/Aadhaar-Intelligence-System.git
cd Aadhaar-Intelligence-System
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3001
```

### Demo Mode (No Backend Required)

The application includes a **demo mode** that allows you to test all features without a backend API:

1. Start the dev server (as shown above)
2. On the login page, enter any email and password
3. Click "Sign In" - you'll be logged in automatically with demo data
4. All pages work with mock data fallbacks

**Demo credentials examples:**
- Email: `admin@uidai.gov.in` / Password: `anything`
- Email: `test@uidai.gov.in` / Password: `demo`

The system will create a demo user based on your email and store it in sessionStorage.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory (use `.env.example` as template):

```env
VITE_API_BASE_URL=/api
```

### API Integration

The application is designed to work with a backend API. API endpoints expected:

- `GET /api/dashboard/overview` - Dashboard KPIs
- `GET /api/dashboard/states-summary` - State-level data
- `GET /api/dashboard/states/{state}/districts-summary` - District data
- `POST /api/dashboard/sync` - Trigger data sync
- `GET /api/metadata/filters` - Filter options
- `GET /api/dashboard/heatmap` - Heatmap data
- `GET /api/dashboard/visuals` - Chart data
- `GET /api/dashboard/alerts` - Alerts list
- `GET /api/dashboard/policy-frameworks` - Policy frameworks
- `POST /api/reports/generate` - Generate report
- `GET /api/reports` - List reports
- `DELETE /api/reports/{id}` - Delete report

**Mock Data**: The application includes mock data fallbacks for all endpoints, allowing it to run without a backend for demo purposes.

## 📊 Data Model

### Key Types

- **DashboardOverview**: Top-level KPIs
- **StateSummary**: State-level metrics and status
- **DistrictSummary**: District-level detailed data
- **FilterOptions**: Available filter values
- **HeatmapDataPoint**: Geographic data with index values
- **AadhaarAlert**: System alerts and notifications
- **PolicyFramework**: Solution frameworks

### Status Indicators

- **CRITICAL**: High risk, immediate attention required
- **WATCH**: Moderate risk, monitoring needed
- **NORMAL**: Within acceptable parameters

## 🎨 Design System

### Color Palette

- **Critical**: Red (#dc2626)
- **Watch**: Amber (#f59e0b)
- **Normal**: Green (#22c55e)
- **Primary**: Dark Blue (#1e3a5f)
- **Background**: Light Gray (#f5f7fa)

### Index Color Scale

- **Very High** (80+): Red
- **High** (60-80): Orange
- **Moderate** (40-60): Yellow
- **Normal** (20-40): Green
- **Low** (0-20): Cyan


For issues, questions, or contributions, please open an issue on GitHub.

---

**Disclaimer**: This system is for analytical purposes only. All policy frameworks and recommendations should be evaluated within appropriate governance and policy contexts before implementation.
