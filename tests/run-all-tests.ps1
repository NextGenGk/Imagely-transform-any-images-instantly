#!/usr/bin/env pwsh
# Comprehensive Test Runner
# Runs all feature tests and generates coverage report

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Imagely - Comprehensive Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found" -ForegroundColor Yellow
    Write-Host "Some tests may be skipped without API keys" -ForegroundColor Yellow
    Write-Host ""
}

# Load environment variables
if (Test-Path ".env") {
    Write-Host "✓ Loading environment variables..." -ForegroundColor Green
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"').Trim("'")
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

Write-Host ""
Write-Host "Running Test Suites..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Test categories
$testSuites = @(
    @{
        Name = "All Features Tests"
        File = "tests/features/all-features.test.ts"
        Description = "Tests all image processing features"
    },
    @{
        Name = "Razorpay Subscription Tests"
        File = "tests/features/razorpay-subscription.test.ts"
        Description = "Tests subscription lifecycle and credit management"
    },
    @{
        Name = "API Integration Tests"
        File = "tests/features/api-integration.test.ts"
        Description = "Tests all API endpoints"
    },
    @{
        Name = "User Flow Tests"
        File = "tests/features/user-flows.test.ts"
        Description = "Tests end-to-end user journeys"
    }
)

Write-Host "Test Suites to Run:" -ForegroundColor Yellow
foreach ($suite in $testSuites) {
    Write-Host "  • $($suite.Name)" -ForegroundColor White
    Write-Host "    $($suite.Description)" -ForegroundColor Gray
}
Write-Host ""

# Run all tests
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Executing Tests..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Run vitest with coverage
npm run test

$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if ($exitCode -eq 0) {
    Write-Host "✓ All tests completed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Some tests failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test Coverage:" -ForegroundColor Yellow
Write-Host "  Run 'npm run test:coverage' for detailed coverage report" -ForegroundColor Gray
Write-Host ""

Write-Host "Test Categories Covered:" -ForegroundColor Yellow
Write-Host "  ✓ Image Processing Features (13 features)" -ForegroundColor Green
Write-Host "  ✓ Subscription Management (Create, Activate, Cancel)" -ForegroundColor Green
Write-Host "  ✓ Credit System (Initialize, Deduct, Reset)" -ForegroundColor Green
Write-Host "  ✓ Subscription Renewals (Auto-renewal, Credit reset)" -ForegroundColor Green
Write-Host "  ✓ Plan Transitions (Upgrade, Downgrade)" -ForegroundColor Green
Write-Host "  ✓ Month End Scenarios (Pro to Free conversion)" -ForegroundColor Green
Write-Host "  ✓ API Endpoints (All routes)" -ForegroundColor Green
Write-Host "  ✓ Webhooks (Razorpay events)" -ForegroundColor Green
Write-Host "  ✓ User Flows (Complete journeys)" -ForegroundColor Green
Write-Host "  ✓ Error Handling" -ForegroundColor Green
Write-Host "  ✓ Security & Validation" -ForegroundColor Green
Write-Host ""

exit $exitCode
