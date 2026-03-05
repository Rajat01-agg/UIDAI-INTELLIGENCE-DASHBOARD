# UIDAI Intelligence System

> A comprehensive, AI-powered platform for Aadhaar data analysis, threat detection, and policy intelligence generation

<div align="center">

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-Hackathon%20Project-orange)
![Last Updated](https://img.shields.io/badge/Updated-March%202026-orange)

[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](aadhaar-backend/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)](aadhaar-frontend/)
[![ML](https://img.shields.io/badge/ML-Python%20%7C%20Scikit--learn-3776AB?style=for-the-badge&logo=python&logoColor=white)](Ml%20model/)
[![Mobile](https://img.shields.io/badge/Mobile-Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](adhaar_Mobile_app-main/)
[![AI Workflow](https://img.shields.io/badge/AI-Agentic%20Workflow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](ThreatPIlot_Agentic_AI_Workflow-main/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Project Components](#-project-components)
- [Quick Start](#-quick-start)
- [Technology Stack](#-technology-stack)
- [Directory Structure](#-directory-structure)
- [Installation Guide](#-installation-guide)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Key Features](#-key-features)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [Support](#-support)

---

## 🎯 Overview

The **UIDAI Intelligence System** is an enterprise-grade platform designed to analyze Aadhaar authentication data at scale. Built for the **UIDAI Aadhaar Hackathon 2026**, it combines machine learning, threat detection, and policy intelligence to provide actionable insights for decision-makers.

### Core Capabilities

| Capability | Description |
|-----------|-------------|
| 🔍 **Anomaly Detection** | Identify unusual patterns using ensemble ML methods (Z-Score, IQR, Isolation Forest) |
| 🤖 **AI-Driven Analysis** | Machine learning-based insights with FastAPI model serving |
| 🌐 **Multi-Channel Interface** | Web dashboard, mobile app, landing page, and REST APIs |
| 📊 **Real-Time Dashboards** | Interactive heatmaps, charts, and KPI monitoring |
| 🚨 **Threat Intelligence** | Agentic AI workflow for automated threat detection & remediation |
| 📈 **Predictive Analytics** | Forecast future anomalies with rolling baselines |
| 🎯 **Policy Recommendations** | Generate actionable policy frameworks from data |
| 🔐 **Enterprise Security** | JWT authentication, Google OAuth, and role-based access |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    UIDAI INTELLIGENCE SYSTEM                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            PRESENTATION LAYER                            │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  • Web Dashboard (React/TypeScript)       :3001          │   │
│  │  • Landing Page (React/Vite)              :3000          │   │
│  │  • Mobile Application (Next.js)                          │   │
│  │  • Real-time Heatmaps (Mapbox GL), Charts & Visualizations│   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           API LAYER (Backend Services)                   │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  • Node.js/Express REST APIs              :5000          │   │
│  │  • JWT + Google OAuth Authentication                     │   │
│  │  • Data Validation & Transformation                      │   │
│  │  • Nginx Reverse Proxy & Load Balancing                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │        INTELLIGENCE LAYER (ML & AI)                      │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  • ML Pipeline (Anomaly Detection & Risk Scoring)        │   │
│  │  • FastAPI ML Service (Real-time Model Serving)          │   │
│  │  • ThreatPilot Agentic AI Workflow                       │   │
│  │  • Pattern Recognition & Trend Analysis                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           DATA LAYER (Persistence & Storage)             │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  • PostgreSQL (via Prisma ORM)                           │   │
│  │  • Redis (BullMQ Job Queues)                             │   │
│  │  • CSV/JSON Data Storage                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📦 Project Components

### 1. aadhaar-backend — Core Backend Services
> Node.js/TypeScript REST API backend with database integration

| Feature | Details |
|---------|---------|
| Express.js REST APIs | Dashboard, Heatmap, Analytics, Alerts, Search, Policy, Reports, Sync |
| Prisma ORM | PostgreSQL schema, migrations, and seeding |
| FastAPI ML Service | Python ML pipeline served via FastAPI (`FastAPIML/`) |
| Authentication | JWT + Google OAuth via Passport.js |
| Nginx | Reverse proxy and load balancing configuration |
| Report Generation | Automated PDF report creation |

**Key Files:** `app.ts` · `prisma/schema.prisma` · `src/routes/` · `src/controllers/` · `FastAPIML/main.py`

📖 [aadhaar-backend/README.md](./aadhaar-backend/README.md)

---

### 2. aadhaar-frontend — Web Dashboard
> React/TypeScript analytics dashboard with interactive visualizations

| Feature | Details |
|---------|---------|
| Dashboard | Real-time KPIs — transactions, demand pressure, operational stress, risk |
| Heatmap | Interactive India map with district-level Mapbox GL visualization |
| Charts | Time-series trend analysis with Recharts |
| Alerts & Notifications | Alert management and real-time notification panel |
| Filtering | Advanced filtering by state, district, time period, and index type |
| Auth | Login with JWT-based session management |

**Key Components:** `Dashboard.tsx` · `HeatmapPage.tsx` · `ChartsPage.tsx` · `AlertsPage.tsx` · `PolicyPage.tsx` · `ReportsPage.tsx`

📖 [aadhaar-frontend/README.md](./aadhaar-frontend/README.md)

---

### 3. aadhaar-landing-page — Public Landing Page
> React/TypeScript landing page showcasing platform capabilities

| Feature | Details |
|---------|---------|
| Hero Section | Main value proposition and CTA |
| Feature Showcase | Platform capabilities overview |
| Tech Stack Display | Technology overview |
| Documentation | Interactive feature guides |
| Chat Widget | Integrated chat support interface |
| Responsive | Mobile-first design with Tailwind CSS |

**Key Components:** `Hero.tsx` · `Features.tsx` · `TechStack.tsx` · `Workflow.tsx` · `Documentation.tsx` · `ChatWidget.tsx`

📖 [aadhaar-landing-page/README.md](./aadhaar-landing-page/README.md)

---

### 4. adhaar_Mobile_app-main — Mobile Application
> Next.js-based mobile-responsive application for on-the-go access

| Feature | Details |
|---------|---------|
| Mobile-optimized UI | Responsive interface with Tailwind CSS |
| Core Functionality | Access to key platform features |
| Fast Performance | Next.js SSR/SSG for optimized loading |

📖 [adhaar_Mobile_app-main/adhaar_Mobile_app-main/README.md](./adhaar_Mobile_app-main/adhaar_Mobile_app-main/README.md)

---

### 5. Ml model — Machine Learning Pipeline
> Python-based ML pipeline for anomaly detection and predictive intelligence

| Capability | Method |
|-----------|--------|
| Anomaly Detection | Z-Score, IQR, Isolation Forest (ensemble) |
| Baseline Calculation | 6-month rolling average |
| Pattern Recognition | Trend analysis and seasonal decomposition |
| Geographic Aggregation | State and district-level scoring |
| Predictive Indicators | Future anomaly forecasting |
| Report Generation | Executive summary with 8+ CSV outputs |

**Pipeline:** Data Loading → Preparation → Baseline Calculation → Anomaly Detection → Pattern Analysis → Geographic Aggregation → Predictive Indicators → Report Generation

**Input:** CSV with columns — `Year_Month`, `State`, `District`, `Metric_Type`, `Age_Group`, `Count`

📖 [Ml model/README.md](./Ml%20model/README.md)

---

### 6. ThreatPIlot_Agentic_AI_Workflow — Threat Detection & Remediation
> Agentic AI system for automated threat detection and remediation

| Component | Purpose |
|-----------|---------|
| `dispatcher/` | Intelligent alert routing and escalation |
| `scheduler/` | Automated job scheduling and monitoring |
| `network_remediation/` | Network-level threat response |
| `infras_remediation/` | Infrastructure-level automated fixes |
| `loki-mcp/` | Log aggregation and monitoring integration |
| `Beutify Email/` | Alert email formatting and delivery |

📖 [ThreatPIlot_Agentic_AI_Workflow-main/README.md](./ThreatPIlot_Agentic_AI_Workflow-main/ThreatPIlot_Agentic_AI_Workflow-main/README.md)

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
|------------|---------|
| Node.js | ≥ 18.x |
| Python | ≥ 3.9 |
| PostgreSQL | ≥ 14 |
| Redis | Latest |
| npm or yarn | Latest |

### Clone & Setup

```bash
# Clone the repository
git clone https://github.com/Rajat01-agg/Aadhaar-Intelligence-System-Final.git
cd Aadhaar-Intelligence-System-Final
```

### Start All Services

```bash
# Terminal 1: Backend (port 5000)
cd aadhaar-backend
npm install
cp .env.example .env          # Configure your environment variables
npx prisma migrate dev
npm run dev

# Terminal 2: Frontend Dashboard (port 3001)
cd aadhaar-frontend
npm install
npm run dev

# Terminal 3: Landing Page (port 3000)
cd aadhaar-landing-page
npm install
npm run dev

# Terminal 4: ML Pipeline
cd "Ml model"
pip install pandas numpy scikit-learn scipy matplotlib seaborn
jupyter notebook aadhaarIntelligence.ipynb

# Terminal 5: Mobile App
cd adhaar_Mobile_app-main/adhaar_Mobile_app-main
npm install
npm run dev
```

### Access Points

| Component | URL | Port |
|-----------|-----|------|
| Landing Page | http://localhost:3000 | 3000 |
| Frontend Dashboard | http://localhost:3001 | 3001 |
| Backend API | http://localhost:5000 | 5000 |
| ML Jupyter | http://localhost:8888 | 8888 |

---

## 🛠️ Technology Stack

<div align="center">

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19 · TypeScript · Vite · Tailwind CSS · Mapbox GL · Chart.js · Recharts |
| **Backend** | Node.js · Express.js · TypeScript · Prisma ORM |
| **Database** | PostgreSQL |
| **Cache & Queue** | Redis · BullMQ |
| **ML / AI** | Python · Pandas · NumPy · Scikit-learn · SciPy · FastAPI |
| **Mobile** | Next.js · Tailwind CSS |
| **AI Agents** | ThreatPilot Agentic AI multi-agent workflow |
| **Auth** | JWT · Google OAuth (Passport.js) |
| **Infrastructure** | Nginx · Docker |
| **Visualization** | Matplotlib · Seaborn (ML) · Recharts · Chart.js · Mapbox GL (Frontend) |

</div>

---

## 📁 Directory Structure

```
Aadhaar-Intelligence-System-Final/
│
├── aadhaar-backend/                             # Express.js API server
│   ├── src/
│   │   ├── config/                              # Database & Passport config
│   │   ├── controllers/                         # Route controllers
│   │   ├── middleware/                           # Auth middleware
│   │   ├── routes/                              # API route definitions
│   │   ├── types/                               # TypeScript type definitions
│   │   └── utils/                               # Utility functions
│   ├── prisma/                                  # Database schema & migrations
│   ├── FastAPIML/                               # Python ML service (FastAPI)
│   ├── nginx/                                   # Nginx reverse proxy config
│   ├── reports/                                 # Generated PDF reports
│   ├── test/                                    # API tests
│   └── app.ts                                   # Application entry point
│
├── aadhaar-frontend/                            # React analytics dashboard
│   ├── components/                              # UI components
│   │   ├── Dashboard.tsx                        # Main dashboard with KPIs
│   │   ├── HeatmapPage.tsx                      # India map visualization
│   │   ├── ChartsPage.tsx                       # Trend charts
│   │   ├── AlertsPage.tsx                       # Alert management
│   │   ├── PolicyPage.tsx                       # Policy recommendations
│   │   └── ReportsPage.tsx                      # Report generation
│   ├── services/                                # API service layer
│   ├── contexts/                                # React context (Auth)
│   ├── hooks/                                   # Custom React hooks
│   ├── data/                                    # Static data (states, districts)
│   ├── security/                                # Security utilities
│   └── utils/                                   # Helper utilities
│
├── aadhaar-landing-page/                        # Public landing page
│   └── components/                              # Page sections (Hero, Features, etc.)
│
├── adhaar_Mobile_app-main/                      # Mobile application
│   └── adhaar_Mobile_app-main/
│       ├── app/                                 # Next.js app directory
│       ├── next.config.js
│       └── package.json
│
├── Ml model/                                    # Machine learning pipeline
│   ├── aadhaarIntelligence.ipynb                # Main Jupyter notebook
│   └── README.md
│
├── ThreatPIlot_Agentic_AI_Workflow-main/        # Agentic AI threat system
│   └── ThreatPIlot_Agentic_AI_Workflow-main/
│       ├── dispatcher/                          # Alert dispatching
│       ├── scheduler/                           # Job scheduling
│       ├── network_remediation/                 # Network threat response
│       ├── infras_remediation/                  # Infrastructure fixes
│       ├── loki-mcp/                            # Log aggregation
│       └── Beutify Email/                       # Email alert formatting
│
├── .gitignore
└── README.md                                    # This file
```

---

## 📝 Installation Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/Rajat01-agg/Aadhaar-Intelligence-System-Final.git
cd Aadhaar-Intelligence-System-Final
```

### Step 2: Backend Setup

```bash
cd aadhaar-backend
npm install
```

Create a `.env` file with the following variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/uidai_db
REDIS_URL=redis://localhost:6379
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3001
ML_SERVICE_URL=http://localhost:8000
```

Run database migrations:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed    # Optional: seed with sample data
```

### Step 3: Frontend Setup

```bash
cd aadhaar-frontend
npm install
```

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000
GEMINI_API_KEY=your_gemini_api_key          # Optional: for AI features
```

### Step 4: Landing Page Setup

```bash
cd aadhaar-landing-page
npm install
```

### Step 5: ML Pipeline Setup

```bash
cd "Ml model"
pip install pandas numpy scikit-learn scipy matplotlib seaborn openpyxl
```

### Step 6: Mobile App Setup

```bash
cd adhaar_Mobile_app-main/adhaar_Mobile_app-main
npm install
```

---

## ⚙️ Configuration

### Database
- Schema: `aadhaar-backend/prisma/schema.prisma`
- Migrations: `npx prisma migrate dev`
- Studio: `npx prisma studio` (GUI for database inspection)

### API Routes
All routes are prefixed with `/api/`:

| Route | Purpose |
|-------|---------|
| `/api/auth` | Authentication (login, register, Google OAuth) |
| `/api/dashboard` | Dashboard KPIs and state summaries |
| `/api/heatmap` | District-level heatmap data |
| `/api/analytics` | Charts and trend analytics |
| `/api/alerts` | Alert management |
| `/api/search` | Search functionality |
| `/api/policy` | Policy recommendations |
| `/api/reports` | PDF report generation |
| `/api/sync` | ML pipeline data synchronization |

### ML Pipeline
- Sensitivity thresholds configurable in `aadhaarIntelligence.ipynb`
- Output CSVs generated for database ingestion
- FastAPI service in `aadhaar-backend/FastAPIML/`

---

## 🎮 Usage

### Development Mode

```bash
# Backend
cd aadhaar-backend && npm run dev

# Frontend
cd aadhaar-frontend && npm run dev

# Landing Page
cd aadhaar-landing-page && npm run dev
```

### Production Build

```bash
# Backend
cd aadhaar-backend
npm run build
npm run start

# Frontend
cd aadhaar-frontend
npm run build
npm run preview

# Landing Page
cd aadhaar-landing-page
npm run build
npm run preview
```

---

## ✨ Key Features

### Intelligence Indices

| Index | What It Measures |
|-------|-----------------|
| **Demand Pressure Index** | Transaction load and capacity utilization |
| **Operational Stress Index** | System performance and stability |
| **Accessibility Gap Index** | Coverage and inclusion gaps |
| **Composite Risk Index** | Overall health combining all factors |

### Data Analysis
- ✅ Anomaly detection using ensemble methods (Z-Score, IQR, Isolation Forest)
- ✅ 6-month rolling baseline calculation
- ✅ Geographic aggregation at state and district level
- ✅ Time-series forecasting and predictive indicators
- ✅ Automated executive report generation

### User Interface
- ✅ Interactive India heatmap with district-level drill-down
- ✅ Real-time KPI dashboards
- ✅ Advanced multi-criteria filtering
- ✅ Alert and notification management
- ✅ PDF report generation and download
- ✅ Mobile-responsive design

### Security
- ✅ JWT-based authentication
- ✅ Google OAuth integration
- ✅ Role-based access control (RBAC)
- ✅ Secure API endpoints with Helmet.js
- ✅ CORS configuration
- ✅ Environment variable management

### Infrastructure
- ✅ Nginx reverse proxy and load balancing
- ✅ Redis-backed job queues (BullMQ)
- ✅ Database migrations with Prisma
- ✅ Docker support

---

## 📚 Documentation

| Component | Documentation |
|-----------|--------------|
| Backend | [aadhaar-backend/README.md](./aadhaar-backend/README.md) |
| Frontend | [aadhaar-frontend/README.md](./aadhaar-frontend/README.md) |
| Landing Page | [aadhaar-landing-page/README.md](./aadhaar-landing-page/README.md) |
| Mobile App | [adhaar_Mobile_app-main/README.md](./adhaar_Mobile_app-main/adhaar_Mobile_app-main/README.md) |
| ML Model | [Ml model/README.md](./Ml%20model/README.md) |
| ThreatPilot | [ThreatPIlot/README.md](./ThreatPIlot_Agentic_AI_Workflow-main/ThreatPIlot_Agentic_AI_Workflow-main/README.md) |

---

## 🤝 Contributing

```bash
# 1. Create a feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and commit
git add .
git commit -m "feat: add meaningful description"

# 3. Push and open a PR
git push origin feature/your-feature-name
```

### Code Standards

| Language | Standard |
|----------|----------|
| TypeScript/JavaScript | ESLint configuration |
| Python | PEP 8 |
| Database | Prisma migrations (never raw SQL) |
| Commits | Conventional Commits (`feat:`, `fix:`, `docs:`, etc.) |

---

## 📞 Support

- **Issues:** Open an issue on the [GitHub repository](https://github.com/Rajat01-agg/Aadhaar-Intelligence-System-Final/issues)
- **Docs:** Check component-specific README files linked above
- **Security:** Do not open public issues for vulnerabilities — contact the team directly

---

## 📊 System Requirements

| | Minimum | Recommended |
|--|---------|-------------|
| **CPU** | Dual-core | Quad-core+ |
| **RAM** | 4 GB | 8 GB+ |
| **Storage** | 5 GB | 20 GB SSD |
| **OS** | Windows / macOS / Linux | Ubuntu 20.04+ or macOS |

---

## 📈 Project Status

| | |
|--|--|
| **Version** | 1.0.0 |
| **Status** | Active Development |
| **Last Updated** | March 2026 |
| **Built For** | UIDAI Aadhaar Hackathon 2026 |
| **Repository** | [github.com/Rajat01-agg/Aadhaar-Intelligence-System-Final](https://github.com/Rajat01-agg/Aadhaar-Intelligence-System-Final) |

---

## 📄 License

This project is built for the **UIDAI Aadhaar Hackathon 2026** and is intended for educational, research, and demonstration purposes.

---

<div align="center">

**Built with ❤️ for India's Digital Identity System**

**UIDAI Intelligence System © 2026**

**⭐ Star this repo if you found it useful!**

</div>
