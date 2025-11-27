# Deployment Quick Reference

Quick commands and tips for common deployment tasks.

## Quick Commands

### Local Development

```bash
# Start development server
npm run dev

# Run all validations
npm run validate

# Check database
npm run db:studio
```

### Database Operations

```bash
# Run migrations (Unix/Mac/Linux)
npm run deploy:db

# Run migrations (Windows)
npm run deploy:db:windows

# Push schema changes (development only)
npm run db:push

# Open Prisma Studio
npm run db:studio
```

### Build & Deploy

```bash
# Build for production
npm run build:production

# Test production build locally
npm run build && npm run start

# Deploy to Vercel
vercel --prod
```

### Health Checks

```bash
# Check local deployment
npm run health-check

# Check production deployment
npm run health-check:prod

# Check specific URL
bash scripts/health-check.sh https://your-app.com
```

## Environment Variables Quick Setup

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Gemini
GEMINI_API_KEY="..."

# ImageKit
IMAGEKIT_PUBLIC_KEY="..."
IMAGEKIT_PRIVATE_KEY="..."
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/..."
```

### Set in Vercel

```bash
vercel env add DATABASE_URL
vercel env add CLERK_SECRET_KEY
vercel env add GEMINI_API_KEY
vercel env add IMAGEKIT_PRIVATE_KEY
vercel env add IMAGEKIT_PUBLIC_KEY
vercel env add IMAGEKIT_URL_ENDPOINT
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```

## Common Issues & Fixes

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Regenerate client
npx prisma generate

# Check migrations
npx prisma migrate status
```

### Prisma Client Not Found

```bash
# Generate Prisma Client
npx prisma generate

# Or use npm script
npm run postinstall
```

### Environment Variables Not Loading

```bash
# Check .env.local exists
ls -la .env.local

# Restart dev server
npm run dev
```

## Vercel Deployment Workflow

### First Time Setup

1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`
4. Add environment variables (see above)
5. Deploy: `vercel --prod`

### Subsequent Deployments

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

## Docker Deployment

### Build & Run

```bash
# Build image
docker build -t nlp-image-processor .

# Run container
docker run -p 3000:3000 --env-file .env.local nlp-image-processor

# Or use Docker Compose
docker-compose up -d
```

### Docker Commands

```bash
# View logs
docker logs nlp-image-processor-app

# Stop containers
docker-compose down

# Rebuild
docker-compose up --build
```

## Database Migration Workflow

### Development

```bash
# Create migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy
```

### Production

```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://..."

# Run migrations
npm run db:migrate

# Verify
npx prisma migrate status
```

## Rollback Procedures

### Vercel Rollback

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

### Database Rollback

```bash
# Mark migration as rolled back
npx prisma migrate resolve --rolled-back <migration-name>

# Apply previous state
npx prisma migrate deploy
```

## Monitoring Commands

### Check Application Health

```bash
# Local
curl http://localhost:3000/api/health

# Production
curl https://your-app.com/api/health
```

### View Logs

```bash
# Vercel logs
vercel logs

# Docker logs
docker logs nlp-image-processor-app

# Follow logs
docker logs -f nlp-image-processor-app
```

## Performance Testing

### Load Testing with curl

```bash
# Test health endpoint
for i in {1..100}; do
  curl -s http://localhost:3000/api/health > /dev/null
  echo "Request $i completed"
done
```

### Check Response Times

```bash
# Measure response time
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/health

# Create curl-format.txt:
# time_total: %{time_total}s
```

## Security Checks

### Verify Environment Variables

```bash
# Check that secrets are not in code
grep -r "sk_live" . --exclude-dir=node_modules
grep -r "pk_live" . --exclude-dir=node_modules
```

### Check Dependencies

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix
```

## Useful Vercel CLI Commands

```bash
# List projects
vercel projects ls

# List deployments
vercel ls

# View deployment details
vercel inspect <deployment-url>

# Remove deployment
vercel remove <deployment-url>

# Pull environment variables
vercel env pull .env.local

# List environment variables
vercel env ls
```

## Troubleshooting Checklist

- [ ] All environment variables set?
- [ ] Database migrations run?
- [ ] Prisma Client generated?
- [ ] Build successful locally?
- [ ] Health endpoint returns 200?
- [ ] Authentication working?
- [ ] External APIs accessible?
- [ ] CORS configured correctly?
- [ ] Logs show no errors?

## Support Resources

- [Full Deployment Guide](../DEPLOYMENT.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Emergency Contacts

- Vercel Status: https://www.vercel-status.com/
- Neon Status: https://neonstatus.com/
- Clerk Status: https://status.clerk.com/

---

**Tip**: Bookmark this page for quick access during deployments!
