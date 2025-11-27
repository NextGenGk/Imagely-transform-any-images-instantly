#!/bin/bash

# =============================================================================
# Database Reset Script
# =============================================================================
# WARNING: This script will DELETE ALL DATA in your database
# Only use this in development environments
# =============================================================================

set -e

echo "⚠️  WARNING: This will DELETE ALL DATA in your database!"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Database reset cancelled"
    exit 0
fi

echo "🗑️  Resetting database..."

# Reset database (drops all tables and re-runs migrations)
npx prisma migrate reset --force

echo "✅ Database reset completed!"
echo "📦 Generating Prisma Client..."
npx prisma generate

echo "✅ All done! Your database is now clean and ready."
