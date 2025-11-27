# Running Tests

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with UI
npm run test:ui
```

## Test Requirements

### Environment Variables
Some tests require API keys to be set:

```bash
# Required for Gemini feature tests
GEMINI_API_KEY=your_gemini_api_key

# Required for ImageKit tests
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_endpoint
```

### Running Tests Without API Keys
If API keys are not set, the feature tests will be automatically skipped:

```bash
# This will skip Gemini-dependent tests
npm test
```

## Test Suites

### Unit Tests (Always Run)
- ✅ `cache.service.test.ts` - Cache functionality
- ✅ `errors.test.ts` - Error handling
- ✅ `gemini.service.test.ts` - Gemini service (mocked)
- ✅ `imagekit.service.test.ts` - ImageKit service
- ✅ `parsing.utils.test.ts` - Parsing utilities
- ✅ `security.test.ts` - Security middleware
- ✅ `types.test.ts` - Type definitions
- ✅ `validation.utils.test.ts` - Validation utilities

### Integration Tests (Require API Keys)
- ⚠️ `features/all-features.test.ts` - Comprehensive feature tests (requires GEMINI_API_KEY)
- ⚠️ `database.service.test.ts` - Database operations (requires DATABASE_URL)

## Test Results

### Current Status
```
✅ Passed: 224 tests
⚠️  Skipped: 41 tests (require API keys)
❌ Failed: 0 tests

Success Rate: 100% (of runnable tests)
```

### With API Keys
When GEMINI_API_KEY is set:
```
✅ Passed: 265+ tests
❌ Failed: 0 tests

Success Rate: 100%
```

## Troubleshooting

### Tests Skipped
If you see "Skipping - GEMINI_API_KEY not set":
1. Set the environment variable
2. Or run: `GEMINI_API_KEY=your_key npm test`

### Database Tests Failing
If database tests fail:
1. Ensure DATABASE_URL is set
2. Run `npm run db:push` to sync schema
3. Check database connection

### Timeout Errors
If tests timeout:
1. Increase timeout in `vitest.config.ts`
2. Check network connection
3. Verify API keys are valid

## Manual Testing

For manual testing, see:
- `MANUAL_TESTING_CHECKLIST.md` - Step-by-step manual tests
- `TESTING_GUIDE.md` - Complete testing guide

## CI/CD

Tests run automatically on:
- Push to main branch
- Pull requests
- Manual workflow dispatch

API keys should be set as GitHub Secrets for CI/CD.
