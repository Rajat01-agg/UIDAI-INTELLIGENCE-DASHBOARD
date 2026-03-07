# Aadhaar Intelligence Platform — Backend

> Node.js/TypeScript REST API backend powering the UIDAI Intelligence System with ML integration, real-time analytics, and automated report generation.

---

## Overview

The Aadhaar Intelligence Platform backend is the core API server that processes large-scale Aadhaar data, serves analytics endpoints, manages authentication, and orchestrates the ML pipeline. It provides insights into enrolment patterns, update accessibility, operational stress, and potential risks at state and district levels.

The system combines **Express 5**, **Prisma ORM**, **PostgreSQL**, **Redis/BullMQ**, and a **FastAPI ML microservice** to deliver intelligence-grade analytics.

---

## Key Objectives

* Monitor Aadhaar enrolment and update trends via REST APIs
* Detect anomalies and unusual activity using ML pipeline integration
* Identify operational and accessibility gaps at district/state level
* Generate risk scores and predictive signals
* Support policy planning with AI-generated frameworks
* Produce automated PDF reports with Supabase storage

---

## Architecture

```
┌────────────────────────────────────────────────┐
│            Frontend / Mobile Clients            │
└────────────────────┬───────────────────────────┘
                     │ HTTPS
                     ▼
┌────────────────────────────────────────────────┐
│         Nginx Reverse Proxy (Port 80)          │
└────────────────────┬───────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────┐
│       Express 5 API Server (Port 5000)         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │  Auth    │  │ Dashboard│  │  Analytics   │ │
│  │  Routes  │  │  Routes  │  │   Routes     │ │
│  ├──────────┤  ├──────────┤  ├──────────────┤ │
│  │ Heatmap  │  │  Alerts  │  │   Search     │ │
│  │  Routes  │  │  Routes  │  │   Routes     │ │
│  ├──────────┤  ├──────────┤  ├──────────────┤ │
│  │  Policy  │  │ Reports  │  │    Sync      │ │
│  │  Routes  │  │  Routes  │  │   Routes     │ │
│  └──────────┘  └──────────┘  └──────────────┘ │
│                                                │
│  Middleware: Helmet · CORS · JWT · Passport     │
└────────────────────┬───────────────────────────┘
                     │
          ┌──────────┼──────────────┐
          ▼          ▼              ▼
   ┌───────────┐ ┌────────┐ ┌───────────────┐
   │ PostgreSQL│ │ Redis  │ │ FastAPI ML    │
   │ (Prisma)  │ │(BullMQ)│ │ Service       │
   └───────────┘ └────────┘ └───────────────┘
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Node.js | 18+ |
| **Framework** | Express.js | 5.x |
| **Language** | TypeScript | 5.9 |
| **ORM** | Prisma Client | 6.x |
| **Database** | PostgreSQL | 14+ |
| **Cache / Queue** | Redis + BullMQ | Latest |
| **Auth** | Passport.js + JWT | JWT + Google OAuth |
| **Security** | Helmet, CORS, express-rate-limit | Latest |
| **ML Service** | FastAPI (Python) | — |
| **PDF Generation** | PDFKit | 0.17 |
| **Storage** | Supabase Storage | Latest |
| **Proxy** | Nginx | Included |

---

## API Routes

All routes are served from the Express server on port `5000`:

| Route | Auth | Purpose |
|-------|------|---------|
| `/auth/*` | Public | Login, register, Google OAuth callbacks |
| `/metadata/*` | Public | Filter options (states, districts, metrics) |
| `/api/dashboard/*` | JWT | Dashboard KPIs, state summaries, district drill-down |
| `/api/heatmap/*` | JWT | District-level geographic heatmap data |
| `/api/analytics/*` | JWT | Charts, trends, and visual analytics |
| `/api/alerts/*` | JWT | Alert management and anomaly notifications |
| `/api/search/*` | JWT | Full-text search across entities |
| `/api/policy/*` | JWT | AI-generated policy frameworks |
| `/api/reports/*` | JWT | PDF report generation, listing, and deletion |
| `/api/sync/*` | JWT | Trigger ML pipeline data synchronization |

---

## Project Structure

```
aadhaar-backend/
├── app.ts                    # Application entry point
├── package.json
├── tsconfig.json
├── prisma.config.ts          # Prisma configuration
├── prisma/
│   ├── schema.prisma         # Database schema (586 lines, 20+ models)
│   ├── seed.ts               # Database seeding script
│   └── migrations/           # Migration history
├── FastAPIML/
│   ├── main.py               # FastAPI ML service endpoint
│   └── pipeline.py           # ML pipeline execution logic
├── nginx/
│   └── conf/                 # Nginx reverse proxy configuration
├── reports/                  # Generated PDF reports
├── src/
│   ├── config/
│   │   ├── database.ts       # Prisma client setup
│   │   ├── passport.ts       # Google OAuth strategy
│   │   ├── queue.ts          # BullMQ queue configuration
│   │   └── redis.ts          # Redis client setup
│   ├── controllers/
│   │   ├── alertsController.ts
│   │   ├── analyticsController.ts
│   │   ├── dashboardController.ts
│   │   ├── heatmapController.ts
│   │   ├── metadataController.ts
│   │   ├── policyController.ts
│   │   ├── reportController.ts
│   │   ├── searchController.ts
│   │   └── syncController.ts
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication middleware
│   ├── routes/
│   │   ├── alertsRoutes.ts
│   │   ├── analyticsRoutes.ts
│   │   ├── authRoutes.ts
│   │   ├── dashboardRoutes.ts
│   │   ├── heatmapRoutes.ts
│   │   ├── metadataRoutes.ts
│   │   ├── policyRoutes.ts
│   │   ├── reportRoutes.ts
│   │   ├── searchRoutes.ts
│   │   └── syncRoutes.ts
│   ├── types/                # TypeScript type definitions
│   └── utils/
│       ├── alertsQueryBuilder.ts
│       ├── chartPresetResolver.ts
│       ├── filterQueryBuilder.ts
│       ├── generator.ts
│       ├── supabaseStorage.ts
│       ├── syncWorker.ts
│       └── wrapAsync.ts
└── test/
    ├── test-api.ps1          # PowerShell API test script
    ├── TESTING_GUIDE.md
    └── TESTING_QUICK_REFERENCE.md
```

---

## Database Schema

The Prisma schema defines a comprehensive data model including:

- **Users** — Role-based access (admin, officer, analyst, viewer) with 2FA support
- **Metric Categories** — Enrolment, biometric update, demographic update
- **Anomaly Detection** — Severity levels (low → critical), ensemble method results
- **Trends & Patterns** — Trend direction tracking, seasonal/cyclical pattern types
- **Risk Signals** — Stable, risk building, likely spike classifications
- **Policy Frameworks** — Monitor only, capacity augmentation, operational stabilisation, inclusion outreach
- **Alerts** — Anomaly, trend, pattern, accessibility gap, and operational stress types

---

## Data Flow

1. Raw Aadhaar data is processed by the ML pipeline (`Ml model/` or `FastAPIML/`)
2. Outputs are generated as structured CSV files
3. Sync endpoint (`/api/sync`) triggers database ingestion
4. BullMQ workers process data asynchronously via Redis
5. APIs expose analytics, heatmaps, alerts, and policy frameworks
6. PDF reports are generated with PDFKit and stored in Supabase
7. Frontend dashboards consume API data in real-time

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd aadhaar-backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file:

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
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_key
```

### 3. Run Database Migrations

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed    # Optional: seed with sample data
```

### 4. Start the Server

```bash
# Development (with hot-reload)
npm run dev

# Production
npm run build
npm run start
```

### 5. Start FastAPI ML Service (Optional)

```bash
cd FastAPIML
pip install fastapi uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with nodemon |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run start` | Run compiled production build |
| `npx prisma studio` | Open Prisma Studio (database GUI) |
| `npx prisma migrate dev` | Apply pending migrations |
| `npx prisma db seed` | Seed the database |

---

## Testing

API tests are available in the `test/` directory:

```bash
# Run PowerShell API tests
./test/test-api.ps1
```

See [test/TESTING_GUIDE.md](./test/TESTING_GUIDE.md) and [test/TESTING_QUICK_REFERENCE.md](./test/TESTING_QUICK_REFERENCE.md) for details.

---

## License

This project is intended for educational, research, and demonstration purposes.
