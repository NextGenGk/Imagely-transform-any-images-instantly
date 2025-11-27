# Environment Variables Reference

Complete reference for all environment variables used in the NLP Image Processor application.

## Overview

Environment variables are used to configure the application for different environments (development, production, testing). Never commit sensitive values to version control.

## Configuration Files

- **Development**: `.env.local` (create from `.env.example`)
- **Production**: Set in your hosting platform (Vercel, AWS, etc.)
- **Testing**: `.env.test` (optional, for test-specific configuration)

---

## Required Variables

These variables MUST be set for the application to function.

### Database

#### `DATABASE_URL`

PostgreSQL database connection string.

**Format**: `postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require`

**Example**:
```
DATABASE_URL="postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**Where to Get**:
- [Neon Console](https://console.neon.tech/) (recommended)
- Any PostgreSQL hosting provider
- Local PostgreSQL instance for development

**Notes**:
- Must include `?sslmode=require` for Neon and most cloud providers
- Use connection pooling URL for production (ends with `-pooler`)
- Keep this secret - contains database credentials

---

### Authentication (Clerk)

#### `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

Clerk publishable key for client-side authentication.

**Format**: `pk_test_xxxxx` (test) or `pk_live_xxxxx` (production)

**Example**:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_Y2xlcmsuZXhhbXBsZS5jb20k"
```

**Where to Get**:
- [Clerk Dashboard](https://dashboard.clerk.com/) → API Keys

**Notes**:
- Safe to expose in client-side code (prefix: `NEXT_PUBLIC_`)
- Use test keys for development
- Use live keys for production

#### `CLERK_SECRET_KEY`

Clerk secret key for server-side authentication.

**Format**: `sk_test_xxxxx` (test) or `sk_live_xxxxx` (production)

**Example**:
```
CLERK_SECRET_KEY="sk_test_abcdefghijklmnopqrstuvwxyz123456"
```

**Where to Get**:
- [Clerk Dashboard](https://dashboard.clerk.com/) → API Keys

**Notes**:
- MUST be kept secret - never expose in client-side code
- Server-side only
- Rotate regularly for security

---

### AI/NLP (Google Gemini)

#### `GEMINI_API_KEY`

Google Gemini API key for natural language processing.

**Format**: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

**Example**:
```
GEMINI_API_KEY="AIzaSyDemoKey1234567890abcdefghijklmnop"
```

**Where to Get**:
- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Google Cloud Console](https://console.cloud.google.com/)

**Notes**:
- Required for query parsing functionality
- Monitor usage to avoid quota limits
- Keep secret - can incur costs if exposed

---

### Image Processing (ImageKit.io)

#### `IMAGEKIT_PUBLIC_KEY`

ImageKit.io public key for client-side uploads.

**Format**: `public_xxxxxxxxxxxxxxxxxxxxx`

**Example**:
```
IMAGEKIT_PUBLIC_KEY="public_abcdefghijklmnopqrstuvwxyz"
```

**Where to Get**:
- [ImageKit Dashboard](https://imagekit.io/dashboard/developer/api-keys)

**Notes**:
- Safe to expose in client-side code
- Used for direct uploads from browser

#### `IMAGEKIT_PRIVATE_KEY`

ImageKit.io private key for server-side operations.

**Format**: `private_xxxxxxxxxxxxxxxxxxxxx`

**Example**:
```
IMAGEKIT_PRIVATE_KEY="private_abcdefghijklmnopqrstuvwxyz123456"
```

**Where to Get**:
- [ImageKit Dashboard](https://imagekit.io/dashboard/developer/api-keys)

**Notes**:
- MUST be kept secret
- Server-side only
- Used for image transformations and management

#### `IMAGEKIT_URL_ENDPOINT`

ImageKit.io URL endpoint for your account.

**Format**: `https://ik.imagekit.io/[your_imagekit_id]`

**Example**:
```
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/demo123"
```

**Where to Get**:
- [ImageKit Dashboard](https://imagekit.io/dashboard/developer/api-keys)

**Notes**:
- Unique to your ImageKit account
- Used to construct image URLs
- Safe to expose

---

## Optional Variables

These variables have defaults but can be customized.

### Clerk Authentication URLs

#### `NEXT_PUBLIC_CLERK_SIGN_IN_URL`

Path to sign-in page.

**Default**: `/sign-in`

**Example**:
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
```

#### `NEXT_PUBLIC_CLERK_SIGN_UP_URL`

Path to sign-up page.

**Default**: `/sign-up`

**Example**:
```
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
```

#### `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`

Redirect path after successful sign-in.

**Default**: `/`

**Example**:
```
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
```

#### `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`

Redirect path after successful sign-up.

**Default**: `/`

**Example**:
```
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

---

### Security Configuration

#### `ALLOWED_ORIGINS`

Comma-separated list of allowed CORS origins.

**Default**: Same origin only

**Example**:
```
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com,https://app.yourdomain.com"
```

**Notes**:
- Required for production if frontend is on different domain
- Separate multiple origins with commas
- Include protocol (https://)
- No trailing slashes

#### `RATE_LIMIT_MAX_REQUESTS`

Maximum requests per minute per user.

**Default**: `60`

**Example**:
```
RATE_LIMIT_MAX_REQUESTS=100
```

**Notes**:
- Applies to authenticated endpoints
- Adjust based on your usage patterns
- Higher values may increase costs

#### `MAX_UPLOAD_SIZE_MB`

Maximum file upload size in megabytes.

**Default**: `10`

**Example**:
```
MAX_UPLOAD_SIZE_MB=20
```

**Notes**:
- Affects image upload endpoint
- Consider hosting platform limits
- Larger files increase processing time

---

### Application Configuration

#### `NODE_ENV`

Node.js environment mode.

**Values**: `development`, `production`, `test`

**Default**: `development`

**Example**:
```
NODE_ENV="production"
```

**Notes**:
- Automatically set by most hosting platforms
- Affects logging, error handling, and optimizations
- Use `production` for deployed environments

#### `NEXT_PUBLIC_APP_URL`

Full URL of the application.

**Default**: `http://localhost:3000` (development)

**Example**:
```
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

**Notes**:
- Used for redirects and webhooks
- Include protocol (https://)
- No trailing slash
- Set automatically by Vercel

#### `DEBUG`

Enable debug logging.

**Values**: `true`, `false`

**Default**: `false`

**Example**:
```
DEBUG="true"
```

**Notes**:
- Increases log verbosity
- Useful for troubleshooting
- Disable in production for performance

---

## Environment-Specific Configuration

### Development (.env.local)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nlp_image_processor_dev"

# Clerk (Test Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxx"
CLERK_SECRET_KEY="sk_test_xxxxx"

# Gemini
GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# ImageKit
IMAGEKIT_PUBLIC_KEY="public_xxxxx"
IMAGEKIT_PRIVATE_KEY="private_xxxxx"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_id"

# Optional
DEBUG="true"
```

### Production (Hosting Platform)

```bash
# Database (with connection pooling)
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require&pgbouncer=true"

# Clerk (Live Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_xxxxx"
CLERK_SECRET_KEY="sk_live_xxxxx"

# Gemini
GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# ImageKit
IMAGEKIT_PUBLIC_KEY="public_xxxxx"
IMAGEKIT_PRIVATE_KEY="private_xxxxx"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_id"

# Security
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
RATE_LIMIT_MAX_REQUESTS="60"
MAX_UPLOAD_SIZE_MB="10"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
DEBUG="false"
```

### Testing (.env.test)

```bash
# Test Database
DATABASE_URL="postgresql://user:password@localhost:5432/nlp_image_processor_test"

# Clerk (Test Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxx"
CLERK_SECRET_KEY="sk_test_xxxxx"

# Gemini (Test Key or Mock)
GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# ImageKit (Test Keys)
IMAGEKIT_PUBLIC_KEY="public_xxxxx"
IMAGEKIT_PRIVATE_KEY="private_xxxxx"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/test_id"

# Testing
NODE_ENV="test"
DEBUG="true"
```

---

## Validation

The application validates all required environment variables on startup using `lib/env-validator.ts`.

### Validation Rules

- **Required variables**: Must be present and non-empty
- **URL formats**: Must be valid URLs where applicable
- **Key formats**: Must match expected patterns

### Validation Errors

If validation fails, the application will:
1. Log specific missing/invalid variables
2. Exit with error code 1
3. Display helpful error messages

**Example Error**:
```
Environment Validation Error:
- DATABASE_URL is required but not set
- GEMINI_API_KEY is required but not set

Please check your .env.local file and ensure all required variables are set.
```

---

## Security Best Practices

### 1. Never Commit Secrets

Add to `.gitignore`:
```
.env.local
.env.production
.env.test
.env*.local
```

### 2. Use Different Keys Per Environment

- Development: Test/development keys
- Production: Live/production keys
- Testing: Separate test keys

### 3. Rotate Keys Regularly

- Rotate API keys every 90 days
- Rotate immediately if compromised
- Update in all environments

### 4. Limit Key Permissions

- Use read-only keys where possible
- Restrict API key permissions to minimum required
- Use separate keys for different services

### 5. Monitor Usage

- Set up alerts for unusual API usage
- Monitor for unauthorized access
- Review logs regularly

---

## Troubleshooting

### "Environment variable not found" Error

**Solution**: Ensure the variable is set in your `.env.local` file or hosting platform.

### "Invalid DATABASE_URL format" Error

**Solution**: Check the connection string format. Must include protocol, credentials, host, and database name.

### Clerk Authentication Not Working

**Solution**: 
- Verify both publishable and secret keys are set
- Ensure using correct keys for environment (test vs. live)
- Check keys haven't expired or been rotated

### Gemini API Errors

**Solution**:
- Verify API key is valid
- Check quota limits in Google Cloud Console
- Ensure billing is enabled for production

### ImageKit Upload Failures

**Solution**:
- Verify all three ImageKit variables are set
- Check URL endpoint format (must include https://)
- Ensure keys match your ImageKit account

---

## Getting API Keys

### Neon (Database)

1. Go to [console.neon.tech](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string from the dashboard
4. Use the pooled connection string for production

### Clerk (Authentication)

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com/)
2. Create a new application
3. Go to API Keys section
4. Copy publishable and secret keys
5. Use test keys for development, live keys for production

### Google Gemini (AI)

1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Enable Gemini API in Google Cloud Console
4. Set up billing (required for production)

### ImageKit.io (Image Processing)

1. Go to [imagekit.io/dashboard](https://imagekit.io/dashboard/)
2. Sign up for an account
3. Go to Developer → API Keys
4. Copy public key, private key, and URL endpoint

---

## Reference

### Quick Copy Template

```bash
# Required
DATABASE_URL=""
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
GEMINI_API_KEY=""
IMAGEKIT_PUBLIC_KEY=""
IMAGEKIT_PRIVATE_KEY=""
IMAGEKIT_URL_ENDPOINT=""

# Optional
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
ALLOWED_ORIGINS=""
RATE_LIMIT_MAX_REQUESTS="60"
MAX_UPLOAD_SIZE_MB="10"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL=""
DEBUG="false"
```

---

## Support

For environment configuration issues:
- Check [Deployment Guide](../DEPLOYMENT.md) for setup instructions
- Review [Security Guide](../SECURITY.md) for security best practices
- See [Troubleshooting](#troubleshooting) section above
