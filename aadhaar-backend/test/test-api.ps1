# Aadhaar Backend API Testing Script
# Quick Reference PowerShell Commands
# Date: February 24, 2026

# ==================================================
# SETUP
# ==================================================

# Set your token (replace with your actual token)
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZlZTE0NjJlLWY5YzItNDA5OC1iZTlhLTVhY2M2MmZkZWQ5NiIsImVtYWlsIjoicmFqYXRhZ2dhcndhbDIwODIwQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MTkyMzI4MSwiZXhwIjoxNzcxOTI2ODgxfQ.FyxlGWPFAZrSS5i6SANp4JZGtJPkv3Vhmp8Nx88nWNA"

# Setup headers
$headers = @{ 
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Base URL
$baseUrl = "http://localhost:5000"

Write-Host "🚀 Aadhaar Backend API Testing Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# ==================================================
# 1. HEALTH CHECK
# ==================================================

Write-Host "1️⃣  Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/"
    Write-Host "✅ API is running!" -ForegroundColor Green
    Write-Host "   Port: $($health.port)" -ForegroundColor Gray
    Write-Host "   Process ID: $($health.processId)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ==================================================
# 2. AUTHENTICATION
# ==================================================

Write-Host "2️⃣  Testing Authentication..." -ForegroundColor Yellow

# Test /auth/me
try {
    $user = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Headers $headers
    Write-Host "✅ GET /auth/me - Success" -ForegroundColor Green
    Write-Host "   User: $($user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($user.role)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET /auth/me - Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test /auth/status
try {
    $status = Invoke-RestMethod -Uri "$baseUrl/auth/status" -Headers $headers
    Write-Host "✅ GET /auth/status - Success" -ForegroundColor Green
    Write-Host "   Authenticated: $($status.authenticated)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET /auth/status - Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ==================================================
# 3. DASHBOARD ENDPOINTS
# ==================================================

Write-Host "3️⃣  Testing Dashboard Endpoints..." -ForegroundColor Yellow

# Dashboard Overview
try {
    $overview = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/overview" -Headers $headers
    Write-Host "✅ GET /api/dashboard/overview - Success" -ForegroundColor Green
    Write-Host "   Total Transactions: $($overview.data.totalTransactions)" -ForegroundColor Gray
    Write-Host "   High Risk Districts: $($overview.data.highRiskDistrictCount)" -ForegroundColor Gray
    Write-Host "   Composite Risk: $([math]::Round($overview.data.averageIndexes.compositeRisk, 2))" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET /api/dashboard/overview - Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# States Summary
try {
    $states = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/states-summary" -Headers $headers
    Write-Host "✅ GET /api/dashboard/states-summary - Success" -ForegroundColor Green
    Write-Host "   Total States: $($states.data.Count)" -ForegroundColor Gray
    Write-Host "   Sample: $($states.data[0].state) - Risk: $($states.data[0].compositeRisk)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET /api/dashboard/states-summary - Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Districts Summary (Maharashtra)
try {
    $districts = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/states/Maharashtra/districts-summary" -Headers $headers
    Write-Host "✅ GET /api/dashboard/states/Maharashtra/districts-summary - Success" -ForegroundColor Green
    Write-Host "   Total Districts: $($districts.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET districts summary - Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ==================================================
# 4. HEATMAP ENDPOINT
# ==================================================

Write-Host "4️⃣  Testing Heatmap..." -ForegroundColor Yellow
try {
    $heatmap = Invoke-RestMethod -Uri "$baseUrl/api/heatmap?metric=compositeRisk" -Headers $headers
    Write-Host "✅ GET /api/heatmap - Success" -ForegroundColor Green
    Write-Host "   Data Points: $($heatmap.data.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET /api/heatmap - Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ==================================================
# 5. ANALYTICS ENDPOINT
# ==================================================

Write-Host "5️⃣  Testing Analytics..." -ForegroundColor Yellow
try {
    $analyticsBody = @{ 
        chartType = "bar"
        context = "comparison"
        filters = @{ state = "Maharashtra" }
    } | ConvertTo-Json -Depth 5
    
    $analytics = Invoke-RestMethod -Uri "$baseUrl/api/analytics/visuals" -Headers $headers -Method Post -Body $analyticsBody
    Write-Host "✅ POST /api/analytics/visuals - Success" -ForegroundColor Green
    Write-Host "   Context: $($analytics.data.meta.context)" -ForegroundColor Gray
    Write-Host "   Metric: $($analytics.data.meta.metric)" -ForegroundColor Gray
} catch {
    Write-Host "❌ POST /api/analytics/visuals - Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ==================================================
# 6. ALERTS ENDPOINTS
# ==================================================

Write-Host "6️⃣  Testing Alerts..." -ForegroundColor Yellow

# Get Alerts
try {
    $alertsBody = @{ 
        filters = @{ isRead = $false }
        page = 1
        limit = 5 
    } | ConvertTo-Json -Depth 5
    
    $alerts = Invoke-RestMethod -Uri "$baseUrl/api/alerts" -Headers $headers -Method Post -Body $alertsBody
    Write-Host "✅ POST /api/alerts - Success" -ForegroundColor Green
    Write-Host "   Total: $($alerts.pagination.total)" -ForegroundColor Gray
} catch {
    Write-Host "❌ POST /api/alerts - Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Alerts Summary
try {
    $alertsSummaryBody = @{} | ConvertTo-Json
    $alertsSummary = Invoke-RestMethod -Uri "$baseUrl/api/alerts/summary" -Headers $headers -Method Post -Body $alertsSummaryBody
    Write-Host "✅ POST /api/alerts/summary - Success" -ForegroundColor Green
    Write-Host "   Total: $($alertsSummary.data.total)" -ForegroundColor Gray
    Write-Host "   Critical: $($alertsSummary.data.critical)" -ForegroundColor Gray
    Write-Host "   High: $($alertsSummary.data.high)" -ForegroundColor Gray
    Write-Host "   Unread: $($alertsSummary.data.unread)" -ForegroundColor Gray
} catch {
    Write-Host "❌ POST /api/alerts/summary - Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ==================================================
# 7. SEARCH ENDPOINT
# ==================================================

Write-Host "7️⃣  Testing Search..." -ForegroundColor Yellow
try {
    $search = Invoke-RestMethod -Uri "$baseUrl/api/search?q=Mumbai&type=district" -Headers $headers
    Write-Host "✅ GET /api/search - Success" -ForegroundColor Green
    Write-Host "   Results found for: Mumbai" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET /api/search - Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ==================================================
# 8. POLICY ENDPOINT
# ==================================================

Write-Host "8️⃣  Testing Policy Suggestions..." -ForegroundColor Yellow
try {
    $policyBody = @{ 
        state = "Maharashtra"
        metrics = @{
            compositeRisk = 5.52
            demandPressure = 5.79
            operationalStress = 8.1
        }
    } | ConvertTo-Json -Depth 5
    
    $policy = Invoke-RestMethod -Uri "$baseUrl/api/policy/suggestions" -Headers $headers -Method Post -Body $policyBody
    Write-Host "✅ POST /api/policy/suggestions - Success" -ForegroundColor Green
    Write-Host "   Policy suggestions generated" -ForegroundColor Gray
} catch {
    Write-Host "❌ POST /api/policy/suggestions - Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ==================================================
# 9. REPORTS ENDPOINTS
# ==================================================

Write-Host "9️⃣  Testing Reports..." -ForegroundColor Yellow

# List Reports
try {
    $reports = Invoke-RestMethod -Uri "$baseUrl/api/reports?page=1&limit=5" -Headers $headers
    Write-Host "✅ GET /api/reports - Success" -ForegroundColor Green
    Write-Host "   Total Reports: $($reports.pagination.total)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET /api/reports - Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Reports Stats
try {
    $reportStats = Invoke-RestMethod -Uri "$baseUrl/api/reports/stats" -Headers $headers
    Write-Host "✅ GET /api/reports/stats - Success" -ForegroundColor Green
} catch {
    Write-Host "❌ GET /api/reports/stats - Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ==================================================
# SUMMARY
# ==================================================

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "✅ Testing Complete!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 For detailed results, check TEST_RESULTS.md" -ForegroundColor Yellow
Write-Host "📖 For API documentation, check TESTING_GUIDE.md" -ForegroundColor Yellow
Write-Host ""

# ==================================================
# ADDITIONAL HELPER FUNCTIONS
# ==================================================

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "Get",
        [string]$Body = $null
    )
    
    Write-Host "Testing $Name..." -ForegroundColor Cyan
    try {
        if ($Method -eq "Get") {
            $result = Invoke-RestMethod -Uri $Url -Headers $headers -Method Get
        } else {
            $result = Invoke-RestMethod -Uri $Url -Headers $headers -Method Post -Body $Body
        }
        Write-Host "✅ Success" -ForegroundColor Green
        return $result
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Export function for reuse
# Example: Test-Endpoint -Name "Dashboard" -Url "$baseUrl/api/dashboard/overview"
