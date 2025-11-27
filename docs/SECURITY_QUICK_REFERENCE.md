# Security Quick Reference Guide

Quick reference for developers working with the NLP Image Processor security features.

## Rate Limiting

### Usage in API Routes

```typescript
import { parseQueryLimiter } from '@/lib/rate-limiter';
import { applyRateLimit } from '@/lib/security.middleware';

// In your API route handler
const rateLimitResult = applyRateLimit(request, userId, parseQueryLimiter);
if (!rateLimitResult.allowed && rateLimitResult.response) {
  return rateLimitResult.response;
}
```

### Available Rate Limiters

- `parseQueryLimiter`: 30 requests/minute
- `processImageLimiter`: 10 requests/minute
- `historyLimiter`: 60 requests/minute

## Input Sanitization

### Sanitize User Input

```typescript
import { sanitizeString, detectSuspiciousPatterns } from '@/lib/sanitization.utils';

// Sanitize and validate
let input = sanitizeString(userInput);

if (detectSuspiciousPatterns(input)) {
  throw new ValidationError('Suspicious content detected', 'input');
}
```

### Sanitize Filenames

```typescript
import { sanitizeFilename } from '@/lib/sanitization.utils';

const safeName = sanitizeFilename(file.name);
```

### Sanitize Objects

```typescript
import { sanitizeObject } from '@/lib/sanitization.utils';

const safeData = sanitizeObject(userData);
```

## File Upload Security

### Validate Files

```typescript
import { validateFileType, validateFileSize } from '@/lib/validation.utils';
import { sanitizeFilename, validateContentType } from '@/lib/sanitization.utils';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Validate
validateFileType(file, ALLOWED_TYPES);
validateFileSize(file, MAX_SIZE);
validateContentType(file.type, ALLOWED_TYPES);

// Sanitize filename
const safeName = sanitizeFilename(file.name);
```

## CORS Headers

### Apply CORS to Response

```typescript
import { applyCorsHeaders } from '@/lib/cors.config';

let response = NextResponse.json(data);
response = applyCorsHeaders(response, request);
```

### Handle Preflight Requests

```typescript
import { handleCorsPreflightRequest } from '@/lib/cors.config';

export async function OPTIONS(request: Request) {
  return handleCorsPreflightRequest(request);
}
```

## Security Headers

### Add Security Headers

```typescript
import { addSecurityHeaders } from '@/lib/security.middleware';

let response = NextResponse.json(data);
response = addSecurityHeaders(response);
```

## Complete API Route Pattern

```typescript
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { parseQueryLimiter } from '@/lib/rate-limiter';
import { applyRateLimit, addSecurityHeaders } from '@/lib/security.middleware';
import { sanitizeString, detectSuspiciousPatterns } from '@/lib/sanitization.utils';
import { applyCorsHeaders } from '@/lib/cors.config';
import { validateNonEmptyString } from '@/lib/validation.utils';
import { AuthenticationError, ValidationError, errorToResponse, logError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const { userId } = await auth();
    if (!userId) {
      throw new AuthenticationError();
    }

    // 2. Rate limit
    const rateLimitResult = applyRateLimit(request, userId, parseQueryLimiter);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return addSecurityHeaders(applyCorsHeaders(rateLimitResult.response, request));
    }

    // 3. Parse and validate input
    const body = await request.json();
    let input = validateNonEmptyString(body.input, 'input');
    
    // 4. Sanitize input
    input = sanitizeString(input);
    
    // 5. Check for suspicious patterns
    if (detectSuspiciousPatterns(input)) {
      throw new ValidationError('Suspicious content detected', 'input');
    }

    // 6. Process request
    const result = await processRequest(input);

    // 7. Return response with security headers
    let response = NextResponse.json({ success: true, data: result });
    response = applyCorsHeaders(response, request);
    response = addSecurityHeaders(response);
    
    return response;

  } catch (error) {
    logError(error, { endpoint: '/api/your-endpoint' });
    const { response, statusCode } = errorToResponse(error);
    let errorResponse = NextResponse.json(response, { status: statusCode });
    errorResponse = applyCorsHeaders(errorResponse, request);
    errorResponse = addSecurityHeaders(errorResponse);
    return errorResponse;
  }
}
```

## Environment Variables

### Required Variables

```bash
DATABASE_URL="postgresql://..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
GEMINI_API_KEY="..."
IMAGEKIT_PUBLIC_KEY="..."
IMAGEKIT_PRIVATE_KEY="..."
IMAGEKIT_URL_ENDPOINT="https://..."
```

### Optional Variables

```bash
# Production CORS configuration
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

## Testing Security

### Test Rate Limiting

```typescript
import { RateLimiter } from '@/lib/rate-limiter';

const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

// Should allow
const result1 = limiter.check('user1');
expect(result1.allowed).toBe(true);

// After 5 requests, should block
const result2 = limiter.check('user1');
expect(result2.allowed).toBe(false);
```

### Test Sanitization

```typescript
import { sanitizeString, detectSuspiciousPatterns } from '@/lib/sanitization.utils';

// Test sanitization
const clean = sanitizeString('  hello\0world  ');
expect(clean).toBe('helloworld');

// Test XSS detection
const hasXSS = detectSuspiciousPatterns('<script>alert(1)</script>');
expect(hasXSS).toBe(true);
```

## Common Patterns

### Pattern 1: Sanitize then Validate

```typescript
// Always sanitize first, then validate
let input = sanitizeString(userInput);
input = validateNonEmptyString(input, 'input');
```

### Pattern 2: Multiple Security Layers

```typescript
// Apply multiple security measures
// 1. Rate limit
// 2. Sanitize
// 3. Validate
// 4. Check patterns
// 5. Process
// 6. Add headers
```

### Pattern 3: Fail Fast

```typescript
// Check authentication first
if (!userId) {
  throw new AuthenticationError();
}

// Then rate limit
if (!rateLimitResult.allowed) {
  return rateLimitResult.response;
}

// Then validate
if (!isValid) {
  throw new ValidationError('Invalid input');
}
```

## Security Checklist

When creating a new API route:

- [ ] Add authentication check
- [ ] Apply rate limiting
- [ ] Validate input
- [ ] Sanitize input
- [ ] Check for suspicious patterns
- [ ] Add CORS headers
- [ ] Add security headers
- [ ] Handle errors securely
- [ ] Log errors appropriately
- [ ] Write tests

## Common Mistakes to Avoid

❌ **Don't**: Skip sanitization
```typescript
const result = await process(userInput); // Dangerous!
```

✅ **Do**: Always sanitize
```typescript
const clean = sanitizeString(userInput);
const result = await process(clean);
```

❌ **Don't**: Forget security headers
```typescript
return NextResponse.json(data);
```

✅ **Do**: Add security headers
```typescript
let response = NextResponse.json(data);
response = applyCorsHeaders(response, request);
response = addSecurityHeaders(response);
return response;
```

❌ **Don't**: Expose sensitive errors
```typescript
return NextResponse.json({ error: error.stack });
```

✅ **Do**: Use error handler
```typescript
const { response, statusCode } = errorToResponse(error);
return NextResponse.json(response, { status: statusCode });
```

## Resources

- Full documentation: `SECURITY.md`
- Implementation details: `.kiro/specs/nlp-image-processor/SECURITY_IMPLEMENTATION.md`
- Test examples: `tests/security.test.ts`

## Support

For security questions or concerns:
1. Check `SECURITY.md` for detailed documentation
2. Review test examples in `tests/security.test.ts`
3. Contact the security team for sensitive issues
