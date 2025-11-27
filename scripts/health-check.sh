#!/bin/bash

# =============================================================================
# Health Check Script
# =============================================================================
# This script verifies that the deployed application is working correctly
# Usage: ./scripts/health-check.sh <app-url>
# Example: ./scripts/health-check.sh https://your-app.vercel.app
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get app URL from argument or use default
APP_URL="${1:-http://localhost:3000}"

echo "🏥 Running health checks for: $APP_URL"
echo "================================================"

# Function to check endpoint
check_endpoint() {
    local endpoint=$1
    local expected_status=$2
    local description=$3
    
    echo -n "Checking $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL$endpoint" || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response, expected $expected_status)"
        return 1
    fi
}

# Track failures
failures=0

# Check health endpoint
check_endpoint "/api/health" "200" "Health endpoint" || ((failures++))

# Check home page
check_endpoint "/" "200" "Home page" || ((failures++))

# Check sign-in page
check_endpoint "/sign-in" "200" "Sign-in page" || ((failures++))

# Check history page (should redirect to sign-in if not authenticated)
response=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/history" || echo "000")
if [ "$response" = "200" ] || [ "$response" = "307" ] || [ "$response" = "302" ]; then
    echo -e "Checking History page... ${GREEN}✓ PASS${NC} (HTTP $response)"
else
    echo -e "Checking History page... ${RED}✗ FAIL${NC} (HTTP $response)"
    ((failures++))
fi

# Check API endpoints (should return 401 without auth)
check_endpoint "/api/parse-query" "401" "Parse query API (auth check)" || ((failures++))
check_endpoint "/api/process-image" "401" "Process image API (auth check)" || ((failures++))
check_endpoint "/api/history" "401" "History API (auth check)" || ((failures++))

echo "================================================"

# Summary
if [ $failures -eq 0 ]; then
    echo -e "${GREEN}✓ All health checks passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ $failures health check(s) failed${NC}"
    exit 1
fi
