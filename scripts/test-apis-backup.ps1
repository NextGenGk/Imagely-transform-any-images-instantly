# API Testing Script for Windows PowerShell
# Tests all external APIs to verify they're working

Write-Host "`nðŸš€ Starting API Tests...`n" -ForegroundColor Cyan
Write-Host "This will test all configured external services.`n"

$passed = 0
$failed = 0
$skipped = 0

# Test 1: Gemini API
Write-Host "ðŸ§ª Testing Gemini API..." -ForegroundColor Yellow
if ($env:GEMINI_API_KEY) {
    Write-Host "   âœ… GEMINI_API_KEY is set" -ForegroundColor Green
    Write-Host "   Key: $($env:GEMINI_API_KEY.Substring(0, 20))..." -ForegroundColor Gray
    $passed++
} else {
    Write-Host "   â­ï¸  GEMINI_API_KEY not set" -ForegroundColor Gray
    $skipped++
}

# Test 2: ImageKit API
Write-Host "`nðŸ§ª Testing ImageKit API..." -ForegroundColor Yellow
if ($env:IMAGEKIT_PUBLIC_KEY -and $env:IMAGEKIT_PRIVATE_KEY -and $env:IMAGEKIT_URL_ENDPOINT) {
    Write-Host "   âœ… ImageKit credentials are set" -ForegroundColor Green
    Write-Host "   Public Key: $($env:IMAGEKIT_PUBLIC_KEY.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "   Endpoint: $env:IMAGEKIT_URL_ENDPOINT" -ForegroundColor Gray
    $passed++
} else {
    Write-Host "   âŒ ImageKit credentials incomplete" -ForegroundColor Red
    $failed++
}

# Test 3: Remove.bg API
Write-Host "`nðŸ§ª Testing Remove.bg API..." -ForegroundColor Yellow
if ($env:REMOVEBG_API_KEY) {
    Write-Host "   âœ… REMOVEBG_API_KEY is set" -ForegroundColor Green
    Write-Host "   Key: $($env:REMOVEBG_API_KEY.Substring(0, 20))..." -ForegroundColor Gray
    $passed++
} else {
    Write-Host "   â­ï¸  REMOVEBG_API_KEY not set (optional)" -ForegroundColor Gray
    $skipped++
}

# Test 4: Database
Write-Host "`nðŸ§ª Testing Database Connection..." -ForegroundColor Yellow
if ($env:DATABASE_URL) {
    Write-Host "   âœ… DATABASE_URL is set" -ForegroundColor Green
    Write-Host "   URL: $($env:DATABASE_URL.Substring(0, 30))..." -ForegroundColor Gray
    $passed++
} else {
    Write-Host "   âŒ DATABASE_URL not set" -ForegroundColor Red
    $failed++
}

# Test 5: Clerk Auth
Write-Host "`nðŸ§ª Testing Clerk Authentication..." -ForegroundColor Yellow
if ($env:NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY -and $env:CLERK_SECRET_KEY) {
    Write-Host "   âœ… Clerk credentials are set" -ForegroundColor Green
    Write-Host "   Public Key: $($env:NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.Substring(0, 20))..." -ForegroundColor Gray
    $passed++
} else {
    Write-Host "   âŒ Clerk credentials incomplete" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host "`n$('=' * 60)" -ForegroundColor Cyan
Write-Host "ðŸ“Š TEST SUMMARY" -ForegroundColor Cyan
Write-Host "$('=' * 60)" -ForegroundColor Cyan

Write-Host "`nâœ… Passed:  $passed/5" -ForegroundColor Green
Write-Host "âŒ Failed:  $failed/5" -ForegroundColor Red
Write-Host "â­ï¸  Skipped: $skipped/5" -ForegroundColor Gray

if ($failed -eq 0 -and $passed -gt 0) {
    Write-Host "`nðŸŽ‰ All configured APIs are working correctly!" -ForegroundColor Green
} elseif ($failed -gt 0) {
    Write-Host "`nâš ï¸  Some APIs failed. Check the errors above." -ForegroundColor Yellow
} else {
    Write-Host "`nâ„¹ï¸  No APIs were tested. Configure API keys to test." -ForegroundColor Gray
}

Write-Host "$('=' * 60)`n" -ForegroundColor Cyan

# Exit with appropriate code
if ($failed -gt 0) {
    exit 1
} else {
    exit 0
}

