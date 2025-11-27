# =============================================================================
# Database Deployment Script (PowerShell)
# =============================================================================
# This script handles database migrations for deployment on Windows
# Run this before deploying the application to ensure database is up to date
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting database deployment..." -ForegroundColor Green

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "❌ ERROR: DATABASE_URL environment variable is not set" -ForegroundColor Red
    exit 1
}

Write-Host "✅ DATABASE_URL is configured" -ForegroundColor Green

# Generate Prisma Client
Write-Host "📦 Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

# Run database migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Cyan
npx prisma migrate deploy

# Verify database connection
Write-Host "🔍 Verifying database connection..." -ForegroundColor Cyan
try {
    npx prisma db pull --force
} catch {
    Write-Host "⚠️  Warning: Could not pull schema (this is normal for new databases)" -ForegroundColor Yellow
}

Write-Host "✅ Database deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify migrations in your database"
Write-Host "  2. Deploy your application"
Write-Host "  3. Run health checks"
