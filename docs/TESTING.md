# Testing Guide

This guide covers all testing procedures for the NLP Image Processor application, including unit tests, property-based tests, and integration tests.

## Overview

The application uses a comprehensive testing strategy:
- **Unit Tests**: Test individual functions and components
- **Property-Based Tests**: Verify universal properties across many inputs using fast-check
- **Integration Tests**: Test complete workflows and API endpoints

## Testing Framework

- **Test Runner**: [Vitest](https://vitest.dev/)
- **Property-Based Testing**: [fast-check](https://github.com/dubzzz/fast-check)
- **React Testing**: React Testing Library (for component tests)

---

## Running Tests

### Run All Tests

```bash
npm test
```

This runs all tests once and exits (suitable for CI/CD).

### Watch Mode

```bash
npm run test:watch
```

Runs tests in watch mode, re-running when files change (ideal for development).

### UI Mode

```bash
npm run test:ui
```

Opens Vitest's interactive UI for exploring and debugging tests.

### Run Specific Test File

```bash
npm test -- tests/parsing.utils.test.ts
```

### Run Tests Matching Pattern

```bash
npm test -- --grep "dimension"
```

### Coverage Report

```bash
npm test -- --coverage
```

---

## Test Structure

### Test Files Location

```
tests/
├── cache.service.test.ts
├── database.service.test.ts
├── errors.test.ts
├── gemini.service.test.ts
├── imagekit.service.test.ts
├── parsing.utils.test.ts
├── security.test.ts
├── setup.test.ts
├── types.test.ts
└── validation.utils.test.ts
```

### Test File Naming

- Unit tests: `*.test.ts`
- Property-based tests: Included in `*.test.ts` files with special comments
- Integration tests: `*.integration.test.ts` (if separate)

---

## Unit Testing

Unit tests verify specific functionality with concrete examples.

### Example: Testing Dimension Parsing

```typescript
import { describe, it, expect } from 'vitest';
import { parsePixelDimensions } from '@/lib/parsing.utils';

describe('parsePixelDimensions', () => {
  it('should parse pixel dimensions in WxH format', () => {
    const result = parsePixelDimensions('1280x720');
    expect(result).toEqual({ width: 1280, height: 720 });
  });

  it('should parse pixel dimensions with spaces', () => {
    const result = parsePixelDimensions('1920 x 1080');
    expect(result).toEqual({ width: 1920, height: 1080 });
  });

  it('should return null for invalid format', () => {
    const result = parsePixelDimensions('invalid');
    expect(result).toBeNull();
  });
});
```

### Best Practices for Unit Tests

1. **Test One Thing**: Each test should verify a single behavior
2. **Use Descriptive Names**: Test names should clearly describe what they test
3. **Arrange-Act-Assert**: Structure tests with setup, execution, and verification
4. **Test Edge Cases**: Include boundary values and error conditions
5. **Avoid Mocks When Possible**: Test real functionality when feasible

---

## Property-Based Testing

Property-based tests verify that properties hold true across many randomly generated inputs.

### Configuration

Each property-based test runs a minimum of 100 iterations:

```typescript
fc.assert(
  fc.property(/* ... */),
  { numRuns: 100 }
);
```

### Property Test Format

All property tests must include a comment linking to the design document:

```typescript
// Feature: nlp-image-processor, Property 7: Pixel dimension parsing
test('pixel dimensions are correctly parsed for all valid inputs', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 10000 }),
      fc.integer({ min: 1, max: 10000 }),
      (width, height) => {
        const query = `${width}x${height}`;
        const result = parsePixelDimensions(query);
        expect(result).toEqual({ width, height });
      }
    ),
    { numRuns: 100 }
  );
});
```

### Example: Testing Query Parsing

```typescript
import fc from 'fast-check';

// Feature: nlp-image-processor, Property 1: Query acceptance
test('all non-empty queries are accepted and return valid specs', async () => {
  fc.assert(
    fc.asyncProperty(
      fc.string({ minLength: 1, maxLength: 200 }),
      async (query) => {
        const geminiService = new GeminiService();
        const result = await geminiService.parseQuery(query);
        
        // Verify result is valid ImageProcessingSpec
        expect(result).toHaveProperty('task_type');
        expect(result).toHaveProperty('dimensions');
        expect(result).toHaveProperty('dpi');
        expect(result).toHaveProperty('background');
        expect(result).toHaveProperty('face_requirements');
        expect(result).toHaveProperty('max_file_size_mb');
        expect(result).toHaveProperty('format');
        expect(result).toHaveProperty('additional_notes');
      }
    ),
    { numRuns: 100 }
  );
});
```

### Custom Generators

Create custom generators for domain-specific data:

```typescript
// Generator for valid dimension strings
const dimensionStringArbitrary = fc.oneof(
  // Pixel dimensions
  fc.tuple(
    fc.integer({ min: 1, max: 10000 }),
    fc.integer({ min: 1, max: 10000 })
  ).map(([w, h]) => `${w}x${h}`),
  
  // Millimeter dimensions
  fc.tuple(
    fc.integer({ min: 1, max: 1000 }),
    fc.integer({ min: 1, max: 1000 })
  ).map(([w, h]) => `${w}mm x ${h}mm`),
  
  // Inch dimensions
  fc.tuple(
    fc.integer({ min: 1, max: 100 }),
    fc.integer({ min: 1, max: 100 })
  ).map(([w, h]) => `${w}x${h} inches`)
);

// Use in tests
fc.assert(
  fc.property(
    dimensionStringArbitrary,
    (dimensionStr) => {
      const result = parseDimensions(dimensionStr);
      expect(result).not.toBeNull();
    }
  ),
  { numRuns: 100 }
);
```

### Property Test Best Practices

1. **Smart Generators**: Constrain generators to valid input space
2. **Meaningful Properties**: Test properties that matter for correctness
3. **Sufficient Iterations**: Use at least 100 runs (configured by default)
4. **Document Properties**: Always include the property comment
5. **Handle Async**: Use `fc.asyncProperty` for async operations

---

## Integration Testing

Integration tests verify complete workflows across multiple components.

### Example: Testing API Endpoints

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('POST /api/parse-query', () => {
  it('should parse a passport photo query', async () => {
    const response = await fetch('http://localhost:3000/api/parse-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'passport photo 300 dpi'
      })
    });

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.task_type).toBe('passport_photo');
    expect(data.data.dpi).toBe(300);
  });

  it('should reject empty queries', async () => {
    const response = await fetch('http://localhost:3000/api/parse-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: ''
      })
    });

    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});
```

---

## Testing Services

### Testing with External APIs

When testing services that call external APIs (Gemini, ImageKit), consider:

1. **Use Real APIs in Integration Tests**: Test actual integration
2. **Mock for Unit Tests**: Mock external calls to test error handling
3. **Environment Variables**: Use test API keys or mock services

### Example: Testing Gemini Service

```typescript
import { describe, it, expect, vi } from 'vitest';
import { GeminiService } from '@/lib/gemini.service';

describe('GeminiService', () => {
  it('should parse a simple resize query', async () => {
    const service = new GeminiService();
    const result = await service.parseQuery('resize to 1280x720');
    
    expect(result.task_type).toBe('resize');
    expect(result.dimensions.width_px).toBe(1280);
    expect(result.dimensions.height_px).toBe(720);
  });

  it('should handle API errors gracefully', async () => {
    // Mock the API to throw an error
    const service = new GeminiService();
    vi.spyOn(service as any, 'callGeminiAPI').mockRejectedValue(
      new Error('API Error')
    );

    await expect(service.parseQuery('test')).rejects.toThrow();
  });
});
```

---

## Testing Database Operations

### Setup Test Database

Use a separate test database or in-memory database:

```typescript
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Setup test database
  await prisma.$connect();
});

afterAll(async () => {
  // Cleanup
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clear data between tests
  await prisma.processingRequest.deleteMany();
  await prisma.user.deleteMany();
});
```

### Example: Testing Database Service

```typescript
describe('DatabaseService', () => {
  it('should save a processing request', async () => {
    const service = new DatabaseService();
    const spec: ImageProcessingSpec = {
      task_type: 'resize',
      dimensions: { width_px: 1280, height_px: 720, width_mm: null, height_mm: null },
      dpi: null,
      background: null,
      face_requirements: null,
      max_file_size_mb: null,
      format: 'jpg',
      additional_notes: null
    };

    const result = await service.saveRequest('user123', 'resize to 1280x720', spec);

    expect(result.id).toBeDefined();
    expect(result.userId).toBe('user123');
    expect(result.query).toBe('resize to 1280x720');
  });

  it('should retrieve user history in chronological order', async () => {
    const service = new DatabaseService();
    
    // Create multiple requests
    await service.saveRequest('user123', 'query1', mockSpec);
    await service.saveRequest('user123', 'query2', mockSpec);
    await service.saveRequest('user123', 'query3', mockSpec);

    const history = await service.getUserHistory('user123', 1, 10);

    expect(history).toHaveLength(3);
    expect(history[0].query).toBe('query3'); // Newest first
    expect(history[2].query).toBe('query1'); // Oldest last
  });
});
```

---

## Testing React Components

### Example: Testing QueryInput Component

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QueryInput from '@/components/QueryInput';

describe('QueryInput', () => {
  it('should render input field and submit button', () => {
    render(<QueryInput onSubmit={vi.fn()} isLoading={false} />);
    
    expect(screen.getByPlaceholderText(/enter your query/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should call onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn();
    render(<QueryInput onSubmit={onSubmit} isLoading={false} />);
    
    const input = screen.getByPlaceholderText(/enter your query/i);
    const button = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(input, { target: { value: 'resize to 1280x720' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('resize to 1280x720');
    });
  });

  it('should disable submit button when loading', () => {
    render(<QueryInput onSubmit={vi.fn()} isLoading={true} />);
    
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toBeDisabled();
  });
});
```

---

## Coverage Goals

Target coverage metrics:
- **Line Coverage**: 80%
- **Branch Coverage**: 70%
- **Function Coverage**: 80%

### Viewing Coverage

```bash
npm test -- --coverage
```

Coverage reports are generated in `coverage/` directory.

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Debugging Tests

### Using Vitest UI

```bash
npm run test:ui
```

The UI provides:
- Visual test explorer
- Test execution timeline
- Console output
- Error stack traces

### Debug Specific Test

```typescript
import { describe, it, expect } from 'vitest';

describe('Debug test', () => {
  it.only('should debug this specific test', () => {
    // This test will run in isolation
    console.log('Debugging...');
    expect(true).toBe(true);
  });
});
```

### Skip Tests

```typescript
it.skip('should skip this test', () => {
  // This test will be skipped
});
```

---

## Common Testing Patterns

### Testing Error Handling

```typescript
it('should throw ValidationError for empty query', () => {
  expect(() => validateQuery('')).toThrow(ValidationError);
  expect(() => validateQuery('')).toThrow('Query cannot be empty');
});
```

### Testing Async Functions

```typescript
it('should parse query asynchronously', async () => {
  const result = await parseQuery('resize to 1280x720');
  expect(result.task_type).toBe('resize');
});
```

### Testing with Timeouts

```typescript
it('should complete within timeout', async () => {
  const result = await parseQuery('test');
  expect(result).toBeDefined();
}, 5000); // 5 second timeout
```

---

## Test Data

### Mock Data Location

Create mock data in `tests/fixtures/`:

```typescript
// tests/fixtures/mockSpecs.ts
export const mockPassportSpec: ImageProcessingSpec = {
  task_type: 'passport_photo',
  dimensions: {
    width_mm: 35,
    height_mm: 45,
    width_px: null,
    height_px: null
  },
  dpi: 300,
  background: 'white',
  face_requirements: {
    shoulders_visible: true,
    ears_visible: true,
    centered_face: true,
    no_tilt: true
  },
  max_file_size_mb: null,
  format: 'jpg',
  additional_notes: null
};
```

---

## Troubleshooting

### Tests Failing Intermittently

- Check for race conditions in async tests
- Ensure proper cleanup between tests
- Use `beforeEach` and `afterEach` for setup/teardown

### Property Tests Failing

- Review the failing counterexample
- Check if generator produces invalid inputs
- Verify property is correctly specified

### Slow Tests

- Mock external API calls
- Use smaller datasets
- Run tests in parallel (Vitest does this by default)

### Database Tests Failing

- Ensure test database is properly configured
- Check for data cleanup between tests
- Verify migrations are applied

---

## Best Practices Summary

1. **Write Tests First**: Consider TDD for new features
2. **Test Behavior, Not Implementation**: Focus on what, not how
3. **Keep Tests Simple**: Each test should be easy to understand
4. **Use Descriptive Names**: Test names should explain what they verify
5. **Avoid Test Interdependence**: Tests should run independently
6. **Mock Sparingly**: Prefer real implementations when possible
7. **Test Edge Cases**: Include boundary values and error conditions
8. **Maintain Tests**: Update tests when requirements change
9. **Review Coverage**: Aim for high coverage but focus on critical paths
10. **Run Tests Often**: Use watch mode during development

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [fast-check Documentation](https://github.com/dubzzz/fast-check/tree/main/documentation)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://testingjavascript.com/)

---

## Support

For testing issues:
- Check test output for specific error messages
- Review the [API Documentation](./API.md) for expected behavior
- See [Troubleshooting](#troubleshooting) section above
- Run tests with `--reporter=verbose` for detailed output
