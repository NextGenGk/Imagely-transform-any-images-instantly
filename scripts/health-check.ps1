# =============================================================================
# Health Check Script (PowerShell)
# =============================================================================
# This script verifies that the deployed application is working correctly
# Usage: .\scripts\health-check.ps1 -AppUrl "https://your-app.vercel.app"
# =============================================================================

param(
    [string]$AppUrl = "http://localhost:3000"
)

Write-Host "🏥 Running health checks for: $AppUrl" -ForegroundColor Cyan
Write-Host "================================================"

$failures = 0

function Test-Endpoint {
    param(
        [string]$Endpoint,
        [int]$ExpectedStatus,
        [string]$Description
    )
    
    Write-Host "Checking $Description... " -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri "$AppUrl$Endpoint" -Method Get -UseBasicParsing -ErrorAction SilentlyContinue
        $statusCode = $response.StatusCode
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
    }
    
    if ($statusCode -eq $ExpectedStatus) {
        Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
        Write-Host " (HTTP $statusCode)"
        return $true
    } else {
        Write-Host "✗ FAIL" -ForegroundColor Red -NoNewline
        Write-Host " (HTTP $statusCode, expected $ExpectedStatus)"
        return $false
    }
}

# Check health endpoint
if (-not (Test-Endpoint -Endpoint "/api/health" -ExpectedStatus 200 -Description "Health endpoint")) {
    $failures++
}

# Check home page
if (-not (Test-Endpoint -Endpoint "/" -ExpectedStatus 200 -Description "Home page")) {
    $failures++
}

# Check sign-in page
if (-not (Test-Endpoint -Endpoint "/sign-in" -ExpectedStatus 200 -Description "Sign-in page")) {
    $failures++
}

# Check history page (should redirect if not authenticated)
Write-Host "Checking History page... " -NoNewline
try {
    $response = Invoke-WebRequest -Uri "$AppUrl/history" -Method Get -UseBasicParsing -ErrorAction SilentlyContinue
    $statusCode = $response.StatusCode
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
}

if ($statusCode -eq 200 -or $statusCode -eq 307 -or $statusCode -eq 302) {
    Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
    Write-Host " (HTTP $statusCode)"
} else {
    Write-Host "✗ FAIL" -ForegroundColor Red -NoNewline
    Write-Host " (HTTP $statusCode)"
    $failures++
}

# Check API endpoints (should return 401 without auth)
if (-not (Test-Endpoint -Endpoint "/api/parse-query" -ExpectedStatus 401 -Description "Parse query API (auth check)")) {
    $failures++
}

if (-not (Test-Endpoint -Endpoint "/api/process-image" -ExpectedStatus 401 -Description "Process image API (auth check)")) {
    $failures++
}

if (-not (Test-Endpoint -Endpoint "/api/history" -ExpectedStatus 401 -Description "History API (auth check)")) {
    $failures++
}

Write-Host "================================================"

# Summary
if ($failures -eq 0) {
    Write-Host "✓ All health checks passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ $failures health check(s) failed" -ForegroundColor Red
    exit 1
}
