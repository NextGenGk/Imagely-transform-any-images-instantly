#!/bin/bash

# =============================================================================
# Database Deployment Script
# =============================================================================
# This script handles database migrations for deployment
# Run this before deploying the application to ensure database is up to date
# =============================================================================

set -e  # Exit on error

echo "🚀 Starting database deployment..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "✅ DATABASE_URL is configured"

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Verify database connection
echo "🔍 Verifying database connection..."
npx prisma db pull --force || echo "⚠️  Warning: Could not pull schema (this is normal for new databases)"

echo "✅ Database deployment completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Verify migrations in your database"
echo "  2. Deploy your application"
echo "  3. Run health checks"
