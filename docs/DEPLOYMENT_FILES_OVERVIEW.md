# Deployment Files Overview

This document provides an overview of all deployment-related files in the project.

## Configuration Files

### Environment Variables

| File | Purpose | Commit to Git? |
|------|---------|----------------|
| `.env.example` | Template with all required variables and documentation | ✅ Yes |
| `.env.local` | Local development environment variables | ❌ No |
| `.env.production.example` | Production environment template | ✅ Yes |
| `.env.production` | Actual production environment variables | ❌ No |

### Build Configuration

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration with Docker support |
| `package.json` | NPM scripts for deployment and database operations |
| `tsconfig.json` | TypeScript configuration |
| `vercel.json` | Vercel-specific deployment configuration |

### Docker Configuration

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage Docker build configuration |
| `.dockerignore` | Files to exclude from Docker build |
| `docker-compose.yml` | Docker Compose configuration for local development |

### Database Configuration

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema definition |
| `prisma/migrations/` | Database migration history |

## Scripts

### Database Scripts

| Script | Platform | Purpose |
|--------|----------|---------|
| `scripts/deploy-db.sh` | Unix/Linux/Mac | Run database migrations for deployment |
| `scripts/deploy-db.ps1` | Windows | Run database migrations for deployment |
| `scripts/reset-db.sh` | Unix/Linux/Mac | Reset database (development only) |
| `scripts/verify-db-setup.ts` | All | Verify database connection and setup |

### Health Check Scripts

| Script | Platform | Purpose |
|--------|----------|---------|
| `scripts/health-check.sh` | Unix/Linux/Mac | Verify deployment health |
| `scripts/health-check.ps1` | Windows | Verify deployment health |

## CI/CD Configuration

### GitHub Actions

| File | Purpose | Trigger |
|------|---------|---------|
| `.github/workflows/ci.yml` | Run tests, linting, and build checks | Push/PR to main/develop |
| `.github/workflows/deploy.yml` | Deploy to production | Push to main or manual trigger |

## Documentation

| File | Purpose |
|------|---------|
| `DEPLOYMENT.md` | Complete deployment guide with step-by-step instructions |
| `docs/DEPLOYMENT_CHECKLIST.md` | Pre/post deployment checklist |
| `docs/DEPLOYMENT_QUICK_REFERENCE.md` | Quick commands and troubleshooting |
| `docs/DEPLOYMENT_FILES_OVERVIEW.md` | This file - overview of all deployment files |
| `README.md` | Main project documentation with deployment section |

## NPM Scripts

### Development

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking
npm run validate         # Run all checks (type-check, lint, test)
```

### Testing

```bash
npm run test             # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with UI
```

### Database

```bash
npm run postinstall      # Generate Prisma Client (runs automatically)
npm run db:migrate       # Run database migrations
npm run db:push          # Push schema changes (development)
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database (if seed file exists)
```

### Deployment

```bash
npm run deploy:db        # Run database migrations (Unix/Linux/Mac)
npm run deploy:db:windows # Run database migrations (Windows)
npm run build:production # Build with migrations
```

### Health Checks

```bash
npm run health-check     # Check local deployment
npm run health-check:windows # Check local deployment (Windows)
npm run health-check:prod # Check production deployment
```

## Deployment Platforms

### Vercel (Recommended)

**Configuration**: `vercel.json`

**Key Features**:
- Automatic deployments from Git
- Environment variable management
- Edge functions support
- Built-in CDN
- Zero-config Next.js support

**Required Secrets**:
- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `GEMINI_API_KEY`
- `IMAGEKIT_PRIVATE_KEY`

### Docker

**Configuration**: `Dockerfile`, `docker-compose.yml`

**Key Features**:
- Portable deployment
- Multi-stage builds for optimization
- Health checks included
- Local PostgreSQL for development

**Build Command**:
```bash
docker build -t nlp-image-processor .
```

### Other Platforms

The application can be deployed to any platform that supports Node.js:
- Railway
- Render
- Fly.io
- AWS (ECS, Elastic Beanstalk)
- Google Cloud Run
- Azure App Service

## Environment Variable Categories

### Required (Application won't start without these)

- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_SECRET_KEY` - Clerk authentication secret
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `GEMINI_API_KEY` - Google Gemini API key
- `IMAGEKIT_PRIVATE_KEY` - ImageKit private key
- `IMAGEKIT_PUBLIC_KEY` - ImageKit public key
- `IMAGEKIT_URL_ENDPOINT` - ImageKit URL endpoint

### Optional (Have defaults or are feature flags)

- `ALLOWED_ORIGINS` - CORS configuration
- `RATE_LIMIT_MAX_REQUESTS` - Rate limiting
- `MAX_UPLOAD_SIZE_MB` - File upload limits
- `NODE_ENV` - Environment mode
- `NEXT_PUBLIC_APP_URL` - Application URL
- `DEBUG` - Debug mode
- `LOG_LEVEL` - Logging level
- `ENABLE_CACHE` - Caching feature flag
- `CACHE_TTL` - Cache time-to-live

## Security Considerations

### Files to NEVER Commit

- `.env.local`
- `.env.production`
- `.env` (if it contains real values)
- Any file with actual API keys or secrets

### Files to Always Commit

- `.env.example`
- `.env.production.example`
- All configuration files
- All scripts
- All documentation

### Secrets Management

**Development**: Use `.env.local`

**Production**: Use platform-specific secret management:
- Vercel: Environment Variables in dashboard
- Docker: Docker secrets or environment files
- GitHub Actions: Repository secrets

## Deployment Workflow

### First Time Deployment

1. ✅ Set up all external services (Neon, Clerk, Gemini, ImageKit)
2. ✅ Configure environment variables
3. ✅ Run database migrations
4. ✅ Deploy application
5. ✅ Run health checks
6. ✅ Test core functionality

### Subsequent Deployments

1. ✅ Run tests locally (`npm run validate`)
2. ✅ Commit and push changes
3. ✅ CI/CD runs automatically (if configured)
4. ✅ Deploy to production
5. ✅ Run health checks
6. ✅ Monitor logs

## Monitoring & Maintenance

### Health Checks

- Automated: GitHub Actions workflow
- Manual: `npm run health-check:prod`
- Endpoint: `GET /api/health`

### Logs

- Vercel: `vercel logs` or dashboard
- Docker: `docker logs nlp-image-processor-app`
- Application: Structured logging to console

### Database Maintenance

- Migrations: Automatic on deployment
- Backups: Managed by Neon (automatic)
- Monitoring: Prisma Studio or database dashboard

## Troubleshooting Resources

1. **Deployment Guide**: `DEPLOYMENT.md` - Complete instructions
2. **Quick Reference**: `docs/DEPLOYMENT_QUICK_REFERENCE.md` - Common commands
3. **Checklist**: `docs/DEPLOYMENT_CHECKLIST.md` - Step-by-step verification
4. **This File**: Overview of all deployment files

## Getting Help

If you encounter issues:

1. Check the troubleshooting section in `DEPLOYMENT.md`
2. Review logs for error messages
3. Verify all environment variables are set
4. Check service status pages
5. Run health checks to identify failing components

## Updates & Maintenance

### Adding New Environment Variables

1. Add to `.env.example` with documentation
2. Add to `.env.production.example`
3. Update `DEPLOYMENT.md` documentation
4. Add to Vercel/platform configuration
5. Update CI/CD workflows if needed

### Updating Dependencies

1. Run `npm audit` to check for vulnerabilities
2. Update dependencies: `npm update`
3. Test locally: `npm run validate`
4. Deploy to preview environment
5. Test thoroughly before production

### Database Schema Changes

1. Create migration: `npx prisma migrate dev --name description`
2. Test migration locally
3. Commit migration files
4. Deploy (migrations run automatically)
5. Verify in production database

---

**Last Updated**: 2024-01-01  
**Maintained By**: Development Team
