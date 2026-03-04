# Aadhaar Backend API Testing Guide

## Table of Contents
1. [Setup](#setup)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Testing Tools](#testing-tools)
5. [Common Test Scenarios](#common-test-scenarios)

---

## Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (via Neon DB)
- Redis (for queue management)
- Valid Google OAuth credentials

### Environment Variables
```dotenv
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
NODE_ENV=development
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
JWT_SECRET=your_secret_key
ML_SERVICE_URL=http://localhost:8000
```

### Start the Server
```bash
cd aadhaar-backend
npm install
npm run dev
```

Server runs on: `http://localhost:5000`

---

## Authentication

### Token Format
All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

### Token Structure
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "admin|viewer",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Role-Based Access
- **viewer**: Read-only access to all endpoints
- **admin**: Full access including delete operations

---

## API Endpoints

### 1. Root & Health Check

#### GET /
Check if API is running
```bash
curl http://localhost:5000/
```

**Response:**
```json
{
  "message": "🚀 API is running!",
  "port": 5000,
  "processId": 12345
}
```

#### GET /api/secure
Test JWT authentication
```bash
curl http://localhost:5000/api/secure \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Authentication Endpoints

Base URL: `/auth`

#### GET /auth/google
Initiate Google OAuth flow (use browser)
```
http://localhost:5000/auth/google
```

#### GET /auth/google/callback
OAuth callback (handled by Google)

#### GET /auth/me
Get current user profile
```bash
curl http://localhost:5000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "admin"
}
```

#### GET /auth/status
Check authentication status
```bash
curl http://localhost:5000/auth/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "authenticated": true,
  "role": "admin"
}
```

#### POST /auth/logout
Logout (stateless)
```bash
curl -X POST http://localhost:5000/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Dashboard Endpoints

Base URL: `/api/dashboard`

#### GET /api/dashboard/overview
Get dashboard overview statistics
```bash
curl http://localhost:5000/api/dashboard/overview \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "totalRecords": 50000,
  "totalStates": 28,
  "totalDistricts": 640,
  "averageMetrics": { ... },
  "trends": [ ... ]
}
```

#### GET /api/dashboard/states-summary
Get summary of all states
```bash
curl http://localhost:5000/api/dashboard/states-summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
[
  {
    "state": "Maharashtra",
    "totalRecords": 5000,
    "avgAuthSuccessRate": 98.5,
    "avgEnrollmentQualityScore": 95.2
  }
]
```

#### GET /api/dashboard/states/:stateName/districts-summary
Get districts summary for a specific state
```bash
curl http://localhost:5000/api/dashboard/states/Maharashtra/districts-summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Heatmap Endpoints

Base URL: `/api/heatmap`

#### GET /api/heatmap
Get heatmap data
```bash
curl "http://localhost:5000/api/heatmap?metric=authSuccessRate&year=2026&month=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters:**
- `metric`: Metric to visualize (authSuccessRate, enrollmentQualityScore, etc.)
- `year`: Year (optional)
- `month`: Month (optional, 1-12)
- `state`: Filter by state (optional)

---

### 5. Analytics Endpoints

Base URL: `/api/analytics`

#### POST /api/analytics/visuals
Get chart-ready analytics data
```bash
curl -X POST http://localhost:5000/api/analytics/visuals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chartType": "bar",
    "metric": "authSuccessRate",
    "groupBy": "state",
    "filters": {
      "year": 2026,
      "month": 1
    }
  }'
```

**Request Body:**
```json
{
  "chartType": "bar|line|pie|area",
  "metric": "authSuccessRate|enrollmentQualityScore|...",
  "groupBy": "state|district|month",
  "filters": {
    "year": 2026,
    "month": 1,
    "state": "Maharashtra",
    "district": "Mumbai"
  }
}
```

---

### 6. Alerts Endpoints

Base URL: `/api/alerts`

#### POST /api/alerts
Get all alerts with filters
```bash
curl -X POST http://localhost:5000/api/alerts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "severity": "high",
      "isRead": false
    },
    "page": 1,
    "limit": 20
  }'
```

**Request Body:**
```json
{
  "filters": {
    "severity": "low|medium|high|critical",
    "isRead": true|false,
    "isResolved": true|false,
    "state": "State Name",
    "district": "District Name"
  },
  "page": 1,
  "limit": 20
}
```

#### POST /api/alerts/summary
Get alerts summary
```bash
curl -X POST http://localhost:5000/api/alerts/summary \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "total": 150,
  "unread": 45,
  "bySeverity": {
    "critical": 5,
    "high": 20,
    "medium": 70,
    "low": 55
  }
}
```

#### PATCH /api/alerts/:id/read
Mark alert as read
```bash
curl -X PATCH http://localhost:5000/api/alerts/ALERT_UUID/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### PATCH /api/alerts/:id/resolved
Mark alert as resolved
```bash
curl -X PATCH http://localhost:5000/api/alerts/ALERT_UUID/resolved \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 7. Search Endpoints

Base URL: `/api/search`

#### GET /api/search
Search across the system
```bash
curl "http://localhost:5000/api/search?q=Mumbai&type=district" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters:**
- `q`: Search query (required)
- `type`: Search type (state|district|metric) (optional)
- `limit`: Number of results (default: 10)

---

### 8. Policy Endpoints

Base URL: `/api/policy`

#### POST /api/policy/suggestions
Get policy suggestions
```bash
curl -X POST http://localhost:5000/api/policy/suggestions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "state": "Maharashtra",
    "district": "Mumbai",
    "metrics": {
      "authSuccessRate": 85.5,
      "enrollmentQualityScore": 92.0
    }
  }'
```

#### POST /api/policy/frameworks
Get solution frameworks
```bash
curl -X POST http://localhost:5000/api/policy/frameworks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "problemType": "low_auth_success",
    "context": {
      "state": "Maharashtra",
      "affectedDistricts": ["Mumbai", "Pune"]
    }
  }'
```

---

### 9. Reports Endpoints

Base URL: `/api/reports`

#### POST /api/reports/generate
Generate a new report
```bash
curl -X POST http://localhost:5000/api/reports/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2026,
    "month": 1,
    "state": "Maharashtra",
    "district": "Mumbai",
    "metricCategory": "authentication",
    "createdBy": "user@example.com"
  }'
```

**Request Body:**
```json
{
  "year": 2026,
  "month": 1-12,
  "state": "State Name",
  "district": "District Name" (optional),
  "metricCategory": "authentication|enrollment|quality" (optional),
  "createdBy": "email@example.com"
}
```

#### GET /api/reports
List all reports with filters
```bash
curl "http://localhost:5000/api/reports?year=2026&month=1&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters:**
- `year`: Filter by year
- `month`: Filter by month
- `state`: Filter by state
- `district`: Filter by district
- `status`: Filter by status (pending|processing|completed|failed)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

#### GET /api/reports/stats
Get report statistics
```bash
curl "http://localhost:5000/api/reports/stats?year=2026" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### GET /api/reports/:id
Get report by ID
```bash
curl http://localhost:5000/api/reports/REPORT_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### GET /api/reports/:id/download
Download report PDF
```bash
curl http://localhost:5000/api/reports/REPORT_UUID/download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output report.pdf
```

#### DELETE /api/reports/:id
Delete a report (Admin only)
```bash
curl -X DELETE http://localhost:5000/api/reports/REPORT_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 10. Sync Endpoints

Base URL: `/api/sync`

#### POST /api/sync/trigger
Trigger data synchronization
```bash
curl -X POST http://localhost:5000/api/sync/trigger \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "external_api",
    "scope": "full|incremental"
  }'
```

---

## Testing Tools

### Using PowerShell (Windows)
```powershell
$token = "YOUR_JWT_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/overview" -Headers $headers
```

### Using curl
```bash
curl http://localhost:5000/api/dashboard/overview \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
1. Create a new collection
2. Set collection variable: `baseUrl = http://localhost:5000`
3. Set collection variable: `token = YOUR_JWT_TOKEN`
4. Add header: `Authorization: Bearer {{token}}`
5. Import endpoints from this guide

### Using VS Code REST Client
Create a file `api-tests.http`:
```http
@baseUrl = http://localhost:5000
@token = YOUR_JWT_TOKEN

### Health Check
GET {{baseUrl}}/

### Get Dashboard Overview
GET {{baseUrl}}/api/dashboard/overview
Authorization: Bearer {{token}}

### Get States Summary
GET {{baseUrl}}/api/dashboard/states-summary
Authorization: Bearer {{token}}
```

---

## Common Test Scenarios

### Test 1: Authentication Flow
```bash
# Check API status
curl http://localhost:5000/

# Verify token
curl http://localhost:5000/auth/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get user profile
curl http://localhost:5000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 2: Dashboard Data Retrieval
```bash
# Get overview
curl http://localhost:5000/api/dashboard/overview \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get states summary
curl http://localhost:5000/api/dashboard/states-summary \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get specific state districts
curl http://localhost:5000/api/dashboard/states/Maharashtra/districts-summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: Alerts Management
```bash
# Get all unread alerts
curl -X POST http://localhost:5000/api/alerts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filters": {"isRead": false}, "page": 1, "limit": 10}'

# Get alerts summary
curl -X POST http://localhost:5000/api/alerts/summary \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Test 4: Report Generation
```bash
# Generate a report
curl -X POST http://localhost:5000/api/reports/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2026,
    "month": 1,
    "state": "Maharashtra",
    "createdBy": "test@example.com"
  }'

# List reports
curl "http://localhost:5000/api/reports?year=2026&month=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get report stats
curl http://localhost:5000/api/reports/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 5: Analytics & Visualization
```bash
# Get bar chart data
curl -X POST http://localhost:5000/api/analytics/visuals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chartType": "bar",
    "metric": "authSuccessRate",
    "groupBy": "state",
    "filters": {"year": 2026, "month": 1}
  }'

# Get heatmap data
curl "http://localhost:5000/api/heatmap?metric=authSuccessRate&year=2026" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "error": "Invalid or missing token"
}
```

### 403 Forbidden
```json
{
  "message": "Insufficient permissions",
  "requiredRole": "admin"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "message": "Too many requests, please try again later"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error",
  "error": "Error details"
}
```

---

## Rate Limiting

- **Auth endpoints**: 5 requests per 15 minutes per IP
- **API endpoints**: 100 requests per 15 minutes per IP

---

## Security Features

1. **JWT Authentication**: All protected routes require valid JWT
2. **Role-Based Access Control**: Different permissions for admin/viewer
3. **Geo-IP Restriction**: India-only access enforced
4. **Rate Limiting**: Prevents abuse
5. **Helmet.js**: Security headers
6. **CORS**: Cross-origin resource sharing configured

---

## Troubleshooting

### Token Expired
Generate a new token by logging in again via Google OAuth

### Rate Limit Exceeded
Wait 15 minutes or use a different IP

### India-Only Access Error
Ensure your IP is recognized as being in India or disable geo-restriction for testing

### Database Connection Error
Check DATABASE_URL in .env and ensure Neon DB is accessible

### Redis Connection Error
Ensure Redis is running: `redis-server`

---

## Additional Resources

- **Prisma Schema**: `prisma/schema.prisma`
- **API Controllers**: `src/controllers/`
- **Middleware**: `src/middleware/auth.ts`
- **Environment Setup**: `.env.example`

---

## Support

For issues or questions, contact the development team or check the main README.md file.

---

**Last Updated**: February 24, 2026
