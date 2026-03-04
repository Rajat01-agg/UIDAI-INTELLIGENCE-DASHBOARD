#!/bin/bash

# Base URL
BASE_URL="https://serverless.on-demand.io/apps/getdata"

# Get current timestamp in nanoseconds
# Now adjusted to stay within 15 minutes (0-14 minutes ago)
get_timestamp() {
  local minutes_ago=$1
  # Ensure we don't go beyond 14 minutes
  if [ $minutes_ago -gt 14 ]; then
    minutes_ago=14
  fi
  echo $(($(date +%s) - minutes_ago * 60))000000000
}

echo "======================================"
echo "Injecting Logs - 3 Domain Architecture"
echo "======================================"
echo ""

# ========================================
# DOMAIN 1: AUTHENTICATION & IDENTITY
# ========================================

echo "🔐 DOMAIN 1: Authentication & Identity"
echo "========================================"

# Test 1: Brute Force Attack Pattern
echo "1. Injecting Brute Force Attack Pattern..."
curl -X POST "${BASE_URL}/push_logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"streams\": [
      {
        \"stream\": {
          \"service\": \"auth-service\",
          \"app\": \"auth\",
          \"level\": \"warn\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 14)\", \"POST /auth/login 401 12ms ip=203.0.113.50 user=admin reason=invalid_password\"],
          [\"$(get_timestamp 13)\", \"POST /auth/login 401 15ms ip=203.0.113.50 user=administrator reason=invalid_password\"],
          [\"$(get_timestamp 13)\", \"POST /auth/login 401 11ms ip=203.0.113.50 user=root reason=invalid_password\"],
          [\"$(get_timestamp 12)\", \"POST /auth/login 401 14ms ip=203.0.113.50 user=admin reason=invalid_password\"],
          [\"$(get_timestamp 12)\", \"POST /auth/login 401 13ms ip=203.0.113.50 user=user reason=invalid_password\"],
          [\"$(get_timestamp 11)\", \"POST /auth/login 401 16ms ip=203.0.113.50 user=test reason=invalid_password\"],
          [\"$(get_timestamp 11)\", \"POST /auth/login 401 12ms ip=203.0.113.50 user=admin reason=invalid_password\"],
          [\"$(get_timestamp 10)\", \"POST /auth/login 401 14ms ip=203.0.113.50 user=postgres reason=invalid_password\"],
          [\"$(get_timestamp 10)\", \"POST /auth/login 401 11ms ip=203.0.113.50 user=mysql reason=invalid_password\"],
          [\"$(get_timestamp 9)\", \"POST /auth/login 401 13ms ip=203.0.113.50 user=dbadmin reason=invalid_password\"]
        ]
      }
    ]
  }"
echo -e "✓ Brute force pattern injected (IP: 203.0.113.50)\n"

# Test 2: Credential Stuffing Pattern
echo "2. Injecting Credential Stuffing Pattern..."
curl -X POST "${BASE_URL}/push_logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"streams\": [
      {
        \"stream\": {
          \"service\": \"auth-service\",
          \"app\": \"auth\",
          \"level\": \"warn\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 9)\", \"POST /auth/login 401 18ms ip=198.51.100.42 user=alice@company.com reason=invalid_password\"],
          [\"$(get_timestamp 8)\", \"POST /auth/login 401 16ms ip=198.51.100.42 user=bob@company.com reason=invalid_password\"],
          [\"$(get_timestamp 8)\", \"POST /auth/login 401 19ms ip=198.51.100.42 user=charlie@company.com reason=invalid_password\"],
          [\"$(get_timestamp 7)\", \"POST /auth/login 401 17ms ip=198.51.100.42 user=david@company.com reason=invalid_password\"],
          [\"$(get_timestamp 7)\", \"POST /auth/login 401 15ms ip=198.51.100.42 user=emma@company.com reason=invalid_password\"],
          [\"$(get_timestamp 6)\", \"POST /auth/login 200 52ms ip=198.51.100.42 user=frank@company.com session=sess_abc123\"],
          [\"$(get_timestamp 6)\", \"POST /auth/login 401 18ms ip=198.51.100.42 user=grace@company.com reason=invalid_password\"]
        ]
      }
    ]
  }"
echo -e "✓ Credential stuffing pattern injected (IP: 198.51.100.42)\n"

# Test 3: Suspicious Login Behavior
echo "3. Injecting Suspicious Login Behavior..."
curl -X POST "${BASE_URL}/push_logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"streams\": [
      {
        \"stream\": {
          \"service\": \"auth-service\",
          \"app\": \"auth\",
          \"level\": \"info\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 6)\", \"POST /auth/login 200 48ms ip=10.50.1.20 user=admin@company.com location=US session=sess_xyz789\"],
          [\"$(get_timestamp 5)\", \"POST /auth/login 200 145ms ip=185.220.101.45 user=admin@company.com location=RU session=sess_def456 anomaly=geo_impossible\"],
          [\"$(get_timestamp 5)\", \"POST /auth/login 200 52ms ip=10.50.1.20 user=jsmith@company.com location=US session=sess_ghi123\"],
          [\"$(get_timestamp 4)\", \"POST /auth/login 200 167ms ip=91.198.174.192 user=jsmith@company.com location=CN session=sess_jkl789 anomaly=geo_unusual\"]
        ]
      }
    ]
  }"
echo -e "✓ Suspicious login behavior injected\n"

# Test 4: Token Abuse Pattern
echo "4. Injecting Token Abuse Pattern..."
curl -X POST "${BASE_URL}/push_logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"streams\": [
      {
        \"stream\": {
          \"service\": \"auth-service\",
          \"app\": \"token-validator\",
          \"level\": \"warn\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 4)\", \"POST /auth/validate 401 5ms ip=172.16.50.88 token=tok_expired_abc123 reason=token_expired\"],
          [\"$(get_timestamp 4)\", \"POST /auth/validate 401 6ms ip=172.16.50.88 token=tok_expired_abc123 reason=token_expired\"],
          [\"$(get_timestamp 3)\", \"POST /auth/validate 401 5ms ip=172.16.50.88 token=tok_expired_abc123 reason=token_expired\"],
          [\"$(get_timestamp 3)\", \"POST /auth/validate 401 7ms ip=172.16.50.88 token=tok_invalid_xyz789 reason=invalid_signature\"],
          [\"$(get_timestamp 3)\", \"POST /auth/validate 401 6ms ip=172.16.50.88 token=tok_invalid_xyz789 reason=invalid_signature\"],
          [\"$(get_timestamp 2)\", \"POST /auth/validate 401 5ms ip=172.16.50.88 token=tok_revoked_def456 reason=token_revoked\"]
        ]
      }
    ]
  }"
echo -e "✓ Token abuse pattern injected\n"

# Test 5: Normal Auth Activity (Baseline)
echo "5. Injecting Normal Auth Activity..."
curl -X POST "${BASE_URL}/push_logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"streams\": [
      {
        \"stream\": {
          \"service\": \"auth-service\",
          \"app\": \"auth\",
          \"level\": \"info\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 2)\", \"POST /auth/login 200 52ms ip=10.0.1.45 user=jsmith@company.com\"],
          [\"$(get_timestamp 2)\", \"POST /auth/login 200 48ms ip=192.168.2.100 user=agarcia@company.com\"],
          [\"$(get_timestamp 1)\", \"POST /auth/login 200 55ms ip=10.0.1.67 user=mjohnson@company.com\"],
          [\"$(get_timestamp 1)\", \"POST /auth/login 200 49ms ip=172.16.0.22 user=lchen@company.com\"],
          [\"$(get_timestamp 1)\", \"POST /auth/logout 200 8ms ip=10.0.1.45 user=jsmith@company.com\"],
          [\"$(get_timestamp 0)\", \"POST /auth/refresh 200 24ms ip=192.168.2.100 user=agarcia@company.com\"]
        ]
      }
    ]
  }"
echo -e "✓ Normal auth activity injected\n"

# ========================================
# DOMAIN 2: HTTP / APPLICATION TRAFFIC
# ========================================

echo ""
echo "🌐 DOMAIN 2: HTTP / Application Traffic"
echo "========================================"

# Test 6: API Endpoint Abuse
echo "6. Injecting API Endpoint Abuse..."
curl -X POST "${BASE_URL}/push_logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"streams\": [
      {
        \"stream\": {
          \"service\": \"api-gateway\",
          \"app\": \"gateway\",
          \"level\": \"warn\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 14)\", \"POST /api/search 429 12ms ip=45.142.120.10 user_agent=python-requests/2.28\"],
          [\"$(get_timestamp 13)\", \"POST /api/search 429 15ms ip=45.142.120.10 user_agent=python-requests/2.28\"],
          [\"$(get_timestamp 13)\", \"POST /api/search 429 11ms ip=45.142.120.10 user_agent=python-requests/2.28\"],
          [\"$(get_timestamp 12)\", \"POST /api/search 429 14ms ip=45.142.120.10 user_agent=python-requests/2.28\"],
          [\"$(get_timestamp 12)\", \"POST /api/search 429 13ms ip=45.142.120.10 user_agent=python-requests/2.28\"],
          [\"$(get_timestamp 11)\", \"POST /api/search 429 16ms ip=45.142.120.10 user_agent=python-requests/2.28\"],
          [\"$(get_timestamp 11)\", \"POST /api/search 429 12ms ip=45.142.120.10 user_agent=python-requests/2.28\"]
        ]
      }
    ]
  }"
echo -e "✓ API endpoint abuse injected (IP: 45.142.120.10)\n"

# Test 7: Bot Scanning Activity
echo "7. Injecting Bot Scanning Activity..."
curl -X POST "${BASE_URL}/push_logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"streams\": [
      {
        \"stream\": {
          \"service\": \"api-gateway\",
          \"app\": \"gateway\",
          \"level\": \"warn\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 10)\", \"GET /admin 404 5ms ip=203.0.113.45 user_agent=Mozilla/5.0-Bot\"],
          [\"$(get_timestamp 10)\", \"GET /wp-admin 404 4ms ip=203.0.113.45 user_agent=Mozilla/5.0-Bot\"],
          [\"$(get_timestamp 9)\", \"GET /.env 404 6ms ip=203.0.113.45 user_agent=Mozilla/5.0-Bot\"],
          [\"$(get_timestamp 9)\", \"GET /config.php 404 5ms ip=203.0.113.45 user_agent=Mozilla/5.0-Bot\"],
          [\"$(get_timestamp 8)\", \"GET /phpmyadmin 404 7ms ip=203.0.113.45 user_agent=Mozilla/5.0-Bot\"],
          [\"$(get_timestamp 8)\", \"GET /admin.php 404 4ms ip=203.0.113.45 user_agent=Mozilla/5.0-Bot\"],
          [\"$(get_timestamp 7)\", \"GET /backup.sql 404 6ms ip=203.0.113.45 user_agent=Mozilla/5.0-Bot\"],
          [\"$(get_timestamp 7)\", \"GET /database.sql 404 5ms ip=203.0.113.45 user_agent=Mozilla/5.0-Bot\"],
          [\"$(get_timestamp 6)\", \"GET /.git/config 404 8ms ip=203.0.113.45 user_agent=Mozilla/5.0-Bot\"]
        ]
      }
    ]
  }"
echo -e "✓ Bot scanning activity injected (IP: 203.0.113.45)\n"

# Test 8: Unauthorized Access Attempts
echo "8. Injecting Unauthorized Access Attempts..."
curl -X POST "${BASE_URL}/push_logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"streams\": [
      {
        \"stream\": {
          \"service\": \"api-gateway\",
          \"app\": \"gateway\",
          \"level\": \"warn\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 6)\", \"GET /api/admin/users 403 5ms ip=198.51.100.20 user=guest\"],
          [\"$(get_timestamp 6)\", \"GET /api/admin/config 403 4ms ip=198.51.100.20 user=guest\"],
          [\"$(get_timestamp 5)\", \"GET /api/admin/logs 403 6ms ip=198.51.100.20 user=guest\"],
          [\"$(get_timestamp 5)\", \"GET /api/admin/database 403 5ms ip=198.51.100.20 user=guest\"],
          [\"$(get_timestamp 5)\", \"GET /api/admin/backup 403 7ms ip=198.51.100.20 user=guest\"],
          [\"$(get_timestamp 4)\", \"GET /api/admin/keys 403 5ms ip=198.51.100.20 user=guest\"],
          [\"$(get_timestamp 4)\", \"POST /api/admin/users 403 8ms ip=198.51.100.20 user=guest\"]
        ]
      }
    ]
  }"
echo -e "✓ Unauthorized access attempts injected (IP: 198.51.100.20)\n"

# Test 9: SQL Injection Attempts
echo "9. Injecting SQL Injection Attempts..."
curl -X POST "${BASE_URL}/push_logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"streams\": [
      {
        \"stream\": {
          \"service\": \"api-gateway\",
          \"app\": \"gateway\",
          \"level\": \"error\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 4)\", \"GET /api/users?id=1' OR '1'='1 400 8ms ip=89.248.165.72 blocked=true reason=sqli_detected\"],
          [\"$(get_timestamp 3)\", \"GET /api/products?search='; DROP TABLE users-- 400 9ms ip=89.248.165.72 blocked=true reason=sqli_detected\"],
          [\"$(get_timestamp 3)\", \"POST /api/login body_contains=admin'-- 400 7ms ip=89.248.165.72 blocked=true reason=sqli_detected\"]
        ]
      }
    ]
  }"
echo -e "✓ SQL injection attempts injected (IP: 89.248.165.72)\n"

# Test 10: DDoS / Request Flood
echo "10. Injecting DDoS Request Flood..."
curl -X POST "${BASE_URL}/push_logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"streams\": [
      {
        \"stream\": {
          \"service\": \"api-gateway\",
          \"app\": \"gateway\",
          \"level\": \"warn\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 3)\", \"GET /api/status 200 2ms ip=104.21.45.78 requests_per_min=450\"],
          [\"$(get_timestamp 2)\", \"GET /api/status 200 3ms ip=104.21.45.78 requests_per_min=520\"],
          [\"$(get_timestamp 2)\", \"GET /api/status 200 2ms ip=104.21.45.78 requests_per_min=680\"],
          [\"$(get_timestamp 2)\", \"GET /api/status 200 4ms ip=104.21.45.78 requests_per_min=890\"],
          [\"$(get_timestamp 1)\", \"GET /api/status 429 1ms ip=104.21.45.78 requests_per_min=1240 action=rate_limited\"]
        ]
      }
    ]
  }"
echo -e "✓ DDoS request flood injected (IP: 104.21.45.78)\n"

# Test 11: Normal API Traffic (Baseline)
echo "11. Injecting Normal API Traffic..."
curl -X POST "${BASE_URL}/push_logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"streams\": [
      {
        \"stream\": {
          \"service\": \"api-gateway\",
          \"app\": \"gateway\",
          \"level\": \"info\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 1)\", \"GET /api/users 200 45ms ip=10.0.1.45\"],
          [\"$(get_timestamp 1)\", \"POST /api/orders 201 123ms ip=192.168.2.100\"],
          [\"$(get_timestamp 1)\", \"GET /api/products 200 38ms ip=10.0.1.67\"],
          [\"$(get_timestamp 0)\", \"PUT /api/users/123 200 87ms ip=10.0.1.45\"],
          [\"$(get_timestamp 0)\", \"GET /api/products 200 41ms ip=172.16.0.22\"],
          [\"$(get_timestamp 0)\", \"DELETE /api/orders/456 204 34ms ip=192.168.2.100\"],
          [\"$(get_timestamp 0)\", \"GET /api/health 200 12ms ip=10.0.1.45\"]
        ]
      }
    ]
  }"
echo -e "✓ Normal API traffic injected\n"

# ========================================
# DOMAIN 3: INFRASTRUCTURE / SERVICE HEALTH
# ========================================

echo ""
echo "⚙️  DOMAIN 3: Infrastructure / Service Health"
echo "=============================================="

# Test 12: Service Crash Loop
echo "12. Injecting Service Crash Loop..."
curl -X POST "${BASE_URL}/push_logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"streams\": [
      {
        \"stream\": {
          \"service\": \"payment-service\",
          \"app\": \"payment\",
          \"level\": \"error\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 14)\", \"service_start attempt=1 pid=12345\"],
          [\"$(get_timestamp 14)\", \"FATAL: database connection failed error=ECONNREFUSED host=db.internal:5432\"],
          [\"$(get_timestamp 13)\", \"service_exit code=1 reason=startup_failure\"],
          [\"$(get_timestamp 13)\", \"service_start attempt=2 pid=12389\"],
          [\"$(get_timestamp 12)\", \"FATAL: database connection failed error=ECONNREFUSED host=db.internal:5432\"],
          [\"$(get_timestamp 12)\", \"service_exit code=1 reason=startup_failure\"],
          [\"$(get_timestamp 11)\", \"service_start attempt=3 pid=12421\"],
          [\"$(get_timestamp 11)\", \"FATAL: database connection failed error=ECONNREFUSED host=db.internal:5432\"],
          [\"$(get_timestamp 10)\", \"service_exit code=1 reason=startup_failure\"],
          [\"$(get_timestamp 10)\", \"service_start attempt=4 pid=12467\"]
        ]
      }
    ]
  }"
echo -e "✓ Service crash loop injected (payment-service)\n"

# Test 13: Resource Exhaustion (OOM)
echo "13. Injecting Resource Exhaustion..."
curl -X POST "${BASE_URL}/push_logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"streams\": [
      {
        \"stream\": {
          \"service\": \"data-processor\",
          \"app\": \"processor\",
          \"level\": \"error\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 9)\", \"memory_usage=1.2GB limit=2GB utilization=60%\"],
          [\"$(get_timestamp 8)\", \"memory_usage=1.5GB limit=2GB utilization=75%\"],
          [\"$(get_timestamp 7)\", \"memory_usage=1.8GB limit=2GB utilization=90%\"],
          [\"$(get_timestamp 6)\", \"memory_usage=1.95GB limit=2GB utilization=97%\"],
          [\"$(get_timestamp 5)\", \"ERROR: OutOfMemoryError: Java heap space\"],
          [\"$(get_timestamp 4)\", \"service_killed signal=SIGKILL reason=OOM\"],
          [\"$(get_timestamp 3)\", \"service_restart reason=oom_killed container=data-processor-7f8b9c\"]
        ]
      }
    ]
  }"
echo -e "✓ Resource exhaustion injected (data-processor)\n"

# Test 14: Dependency Failure
echo "14. Injecting Dependency Failure..."
curl -X POST "${BASE_URL}/push_logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"streams\": [
      {
        \"stream\": {
          \"service\": \"order-service\",
          \"app\": \"orders\",
          \"level\": \"error\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 7)\", \"HTTP GET https://inventory-service/api/check timeout=5000ms error=ETIMEDOUT\"],
          [\"$(get_timestamp 6)\", \"HTTP GET https://inventory-service/api/check timeout=5000ms error=ETIMEDOUT\"],
          [\"$(get_timestamp 5)\", \"HTTP GET https://inventory-service/api/check timeout=5000ms error=ETIMEDOUT\"],
          [\"$(get_timestamp 4)\", \"dependency_failure service=inventory-service status=unhealthy consecutive_failures=3\"],
          [\"$(get_timestamp 3)\", \"circuit_breaker service=inventory-service state=OPEN reason=too_many_failures\"],
          [\"$(get_timestamp 2)\", \"order_processing_failed order_id=12345 reason=inventory_unavailable\"]
        ]
      }
    ]
  }"
echo -e "✓ Dependency failure injected (order-service → inventory-service)\n"

# Test 15: High CPU / Performance Degradation
echo "15. Injecting Performance Degradation..."
curl -X POST "${BASE_URL}/push_logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"streams\": [
      {
        \"stream\": {
          \"service\": \"search-service\",
          \"app\": \"search\",
          \"level\": \"warn\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 7)\", \"cpu_usage=45% response_time_p95=120ms\"],
          [\"$(get_timestamp 6)\", \"cpu_usage=62% response_time_p95=280ms\"],
          [\"$(get_timestamp 5)\", \"cpu_usage=78% response_time_p95=450ms\"],
          [\"$(get_timestamp 4)\", \"cpu_usage=85% response_time_p95=890ms\"],
          [\"$(get_timestamp 3)\", \"cpu_usage=91% response_time_p95=1340ms\"],
          [\"$(get_timestamp 2)\", \"cpu_usage=94% response_time_p95=2100ms\"],
          [\"$(get_timestamp 1)\", \"WARN: service degraded cpu_threshold_exceeded duration=6m\"]
        ]
      }
    ]
  }"
echo -e "✓ Performance degradation injected (search-service)\n"

# Test 16: Configuration Error
echo "16. Injecting Configuration Error..."
curl -X POST "${BASE_URL}/push_logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"streams\": [
      {
        \"stream\": {
          \"service\": \"notification-service\",
          \"app\": \"notifications\",
          \"level\": \"error\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 7)\", \"service_start loading_config=/etc/app/config.yaml\"],
          [\"$(get_timestamp 6)\", \"ERROR: invalid config key 'smtp.port' expected=number got=string value='25x'\"],
          [\"$(get_timestamp 5)\", \"config_validation_failed errors=1\"],
          [\"$(get_timestamp 4)\", \"service_exit code=1 reason=invalid_configuration\"],
          [\"$(get_timestamp 3)\", \"restart_attempt=1 backoff=10s\"],
          [\"$(get_timestamp 2)\", \"service_start loading_config=/etc/app/config.yaml\"],
          [\"$(get_timestamp 1)\", \"ERROR: invalid config key 'smtp.port' expected=number got=string value='25x'\"]
        ]
      }
    ]
  }"
echo -e "✓ Configuration error injected (notification-service)\n"

# Test 17: Normal Service Health (Baseline)
echo "17. Injecting Normal Service Health..."
curl -X POST "${BASE_URL}/push_logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"streams\": [
      {
        \"stream\": {
          \"service\": \"user-service\",
          \"app\": \"users\",
          \"level\": \"info\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 3)\", \"health_check status=healthy response_time=12ms\"],
          [\"$(get_timestamp 2)\", \"health_check status=healthy response_time=15ms\"],
          [\"$(get_timestamp 1)\", \"health_check status=healthy response_time=11ms\"],
          [\"$(get_timestamp 0)\", \"cpu_usage=35% memory=52% connections=45\"]
        ]
      },
      {
        \"stream\": {
          \"service\": \"inventory-service\",
          \"app\": \"inventory\",
          \"level\": \"info\",
          \"env\": \"production\"
        },
        \"values\": [
          [\"$(get_timestamp 3)\", \"health_check status=healthy response_time=18ms\"],
          [\"$(get_timestamp 2)\", \"health_check status=healthy response_time=14ms\"],
          [\"$(get_timestamp 0)\", \"cpu_usage=28% memory=48% connections=32\"]
        ]
      }
    ]
  }"
echo -e "✓ Normal service health injected\n"

echo ""
echo "======================================"
echo "✅ Log Injection Complete!"
echo "======================================"
echo ""
echo "📊 PATTERNS BY DOMAIN:"
echo ""
echo "🔐 DOMAIN 1: AUTHENTICATION & IDENTITY"
echo "   • Brute Force: IP 203.0.113.50 (10 failed attempts)"
echo "   • Credential Stuffing: IP 198.51.100.42 (7 users targeted)"
echo "   • Suspicious Login: Geo-impossible travel detected"
echo "   • Token Abuse: IP 172.16.50.88 (expired/invalid tokens)"
echo ""
echo "🌐 DOMAIN 2: HTTP / APPLICATION TRAFFIC"
echo "   • Endpoint Abuse: IP 45.142.120.10 (7 rate limit hits)"
echo "   • Bot Scanning: IP 203.0.113.45 (9 probe attempts)"
echo "   • Admin Enumeration: IP 198.51.100.20 (7 forbidden accesses)"
echo "   • SQL Injection: IP 89.248.165.72 (3 blocked attempts)"
echo "   • DDoS Pattern: IP 104.21.45.78 (request spike → rate limited)"
echo ""
echo "⚙️  DOMAIN 3: INFRASTRUCTURE / SERVICE HEALTH"
echo "   • Crash Loop: payment-service (4 restart attempts)"
echo "   • OOM Kill: data-processor (memory exhaustion)"
echo "   • Dependency Down: order-service → inventory-service"
echo "   • CPU Spike: search-service (45% → 94%, degraded)"
echo "   • Config Error: notification-service (invalid SMTP port)"
echo ""
echo "🎯 REMEDIATION ACTIONS AVAILABLE:"
echo ""
echo "Auth Domain:"
echo "   → Block IP (firewall)"