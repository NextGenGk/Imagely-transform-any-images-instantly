# Library Services

## GeminiService

The `GeminiService` class provides natural language processing capabilities for parsing image processing queries into structured JSON specifications.

### Usage

```typescript
import { GeminiService } from './lib';

// Initialize the service (uses GEMINI_API_KEY from environment)
const geminiService = new GeminiService();

// Or provide API key explicitly
const geminiService = new GeminiService('your-api-key');

// Parse a natural language query
const spec = await geminiService.parseQuery('convert this to a passport photo 300 ppi');

console.log(spec);
// Output:
// {
//   task_type: 'passport_photo',
//   dimensions: { width_mm: 35, height_mm: 45, width_px: null, height_px: null },
//   dpi: 300,
//   background: 'white',
//   face_requirements: {
//     shoulders_visible: true,
//     ears_visible: true,
//     centered_face: true,
//     no_tilt: true
//   },
//   max_file_size_mb: null,
//   format: 'jpg',
//   additional_notes: null
// }
```

### Features

- **Automatic Retry Logic**: Implements exponential backoff with 3 retry attempts
- **Response Validation**: Validates all responses against the ImageProcessingSpec schema
- **Error Handling**: Provides clear error messages for API failures and validation errors
- **Markdown Sanitization**: Automatically removes markdown code blocks from responses

### Error Handling

The service throws errors in the following cases:
- Missing API key
- Empty or whitespace-only queries
- API failures after all retry attempts
- Invalid JSON responses
- Missing required fields in responses
- Invalid task_type values

### Requirements Satisfied

- **11.1**: Sends queries to Gemini API with appropriate prompting
- **11.2**: Parses and validates JSON structure from responses
- **11.3**: Implements fallback logic through retry mechanism
- **11.4**: Implements retry logic with exponential backoff
- **11.5**: Includes parsing rules and JSON schema in prompts
