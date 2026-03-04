# Backend Testing - Quick Reference Card

## 🚀 Getting Started

### Your Test Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZlZTE0NjJlLWY5YzItNDA5OC1iZTlhLTVhY2M2MmZkZWQ5NiIsImVtYWlsIjoicmFqYXRhZ2dhcndhbDIwODIwQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MTkyMzI4MSwiZXhwIjoxNzcxOTI2ODgxfQ.FyxlGWPFAZrSS5i6SANp4JZGtJPkv3Vhmp8Nx88nWNA
```

**User**: rajataggarwal20820@gmail.com  
**Role**: admin  
**Expires**: ~1 hour from generation

---

## ⚡ Quick Commands

### Run All Tests
```powershell
.\test-api.ps1
```

### Setup for Manual Testing
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{ 
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
```

---

## 📌 Most Used Endpoints

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/"
```

### Current User
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/auth/me" -Headers $headers
```

### Dashboard Overview
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/overview" -Headers $headers
```

### States Summary
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/states-summary" -Headers $headers
```

### State Districts (e.g., Maharashtra)
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/states/Maharashtra/districts-summary" -Headers $headers
```

### Heatmap
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/heatmap?metric=compositeRisk" -Headers $headers
```

### Analytics
```powershell
$body = @{ 
    chartType = "bar"
    context = "comparison"
    filters = @{ state = "Maharashtra" }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/analytics/visuals" -Headers $headers -Method Post -Body $body
```

### Alerts Summary
```powershell
$body = @{} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/alerts/summary" -Headers $headers -Method Post -Body $body
```

### Search
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/search?q=Mumbai&type=district" -Headers $headers
```

---

## 📊 Test Results Summary

**Last Test**: February 24, 2026  
**Overall Status**: ✅ 94% Pass Rate (15/16 endpoints)

### Passed Tests ✅
- Health check
- Authentication (me, status)
- Dashboard (overview, states, districts)
- Heatmap data
- Analytics visuals
- Alerts (list, summary)
- Search
- Policy suggestions
- Reports (list, stats)

### Notes ⚠️
- Report generation requires existing data in database

---

## 📚 Full Documentation

- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Complete testing guide with all endpoints
- **[TEST_RESULTS.md](TEST_RESULTS.md)** - Detailed test results
- **[test-api.ps1](test-api.ps1)** - Automated testing script

---

## 💡 Tips

1. **Token Expired?** Re-authenticate via Google OAuth at `/auth/google`
2. **Rate Limited?** Wait 15 minutes or use different IP
3. **Want JSON Output?** Add `| ConvertTo-Json -Depth 5` to any command
4. **Pretty Table?** Add `| Format-Table -AutoSize` to any command
5. **Save to File?** Add `| Out-File results.json` to any command

---

## 🔧 Troubleshooting

### Server Not Running
```powershell
cd aadhaar-backend
npm run dev
```

### Check Server Status
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/"
```

### View Last 10 Results
```powershell
# Filter specific fields
$states = Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/states-summary" -Headers $headers
$states.data | Select-Object state, status, compositeRisk | Format-Table
```

---

## 🎯 Common Tasks

### Get Top 5 High-Risk States
```powershell
$states = Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/states-summary" -Headers $headers
$states.data | Sort-Object compositeRisk -Descending | Select-Object -First 5 | Format-Table state, status, compositeRisk, demandPressure
```

### Get All Critical Alerts
```powershell
$body = @{ 
    filters = @{ severity = "critical"; isRead = $false }
    page = 1
    limit = 20 
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/alerts" -Headers $headers -Method Post -Body $body
```

### Compare Multiple States
```powershell
$body = @{ 
    chartType = "bar"
    context = "comparison"
    filters = @{}
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/analytics/visuals" -Headers $headers -Method Post -Body $body
```

---

## 📞 Support

For issues or questions:
- Check [TESTING_GUIDE.md](TESTING_GUIDE.md) for detailed documentation
- Review [TEST_RESULTS.md](TEST_RESULTS.md) for known issues
- Verify your token hasn't expired
- Ensure the backend server is running on port 5000

---

**Last Updated**: February 24, 2026  
**Version**: 1.0.0
