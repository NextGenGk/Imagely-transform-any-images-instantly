# Implementation Plan

- [x] 1. Set up project structure and dependencies





  - Initialize Next.js 14+ project with TypeScript and App Router
  - Install dependencies: Prisma, Clerk, ImageKit SDK, Gemini API client, fast-check, Vitest
  - Configure Tailwind CSS
  - Set up environment variables structure
  - _Requirements: All_

- [x] 2. Configure authentication with Clerk





  - Set up Clerk application and get API keys
  - Configure Clerk middleware for Next.js App Router
  - Create authentication wrapper components
  - Implement sign-in and sign-up pages
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 3. Set up database with Prisma and Neon





  - Create Neon PostgreSQL database
  - Define Prisma schema for User and ProcessingRequest models
  - Configure Prisma client
  - Run initial migration
  - Set up database connection pooling
  - _Requirements: 9.1, 9.2_

- [x] 4. Implement core TypeScript interfaces and types





  - Create ImageProcessingSpec interface with all fields
  - Define TaskType, Background, ImageFormat type unions
  - Create Dimensions and FaceRequirements interfaces
  - Define API request/response interfaces
  - _Requirements: 1.1, 7.2_

- [x] 5. Build Gemini service for NLP parsing




- [x] 5.1 Implement GeminiService class


  - Create service class with parseQuery method
  - Build prompt template with parsing rules and JSON schema
  - Implement API call to Gemini with error handling
  - Add response validation and sanitization
  - Implement retry logic with exponential backoff
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ]* 5.2 Write property test for query acceptance
  - **Property 1: Query acceptance**
  - **Validates: Requirements 1.1**

- [ ]* 5.3 Write property test for ambiguous query handling
  - **Property 2: Ambiguous query handling**
  - **Validates: Requirements 1.3**

- [ ]* 5.4 Write property test for valid JSON output
  - **Property 18: Valid JSON output**
  - **Validates: Requirements 7.1**

- [ ]* 5.5 Write property test for complete schema
  - **Property 19: Complete schema**
  - **Validates: Requirements 7.2**

- [ ]* 5.6 Write property test for pure JSON response
  - **Property 21: Pure JSON response**
  - **Validates: Requirements 7.5**

- [ ]* 5.7 Write unit tests for GeminiService
  - Test prompt building logic
  - Test error handling for API failures
  - Test retry mechanism
  - _Requirements: 11.1, 11.3, 11.4_

- [x] 6. Implement parsing rules and validation





- [x] 6.1 Create dimension parsing utilities


  - Implement pixel dimension parser (e.g., "1280x720")
  - Implement millimeter dimension parser
  - Implement inch to millimeter converter
  - Create dimension format detector
  - _Requirements: 3.1, 3.2, 3.3, 1.5_

- [ ]* 6.2 Write property test for multi-unit dimension support
  - **Property 3: Multi-unit dimension support**
  - **Validates: Requirements 1.5**

- [ ]* 6.3 Write property test for pixel dimension parsing
  - **Property 7: Pixel dimension parsing**
  - **Validates: Requirements 3.1**

- [ ]* 6.4 Write property test for millimeter dimension parsing
  - **Property 8: Millimeter dimension parsing**
  - **Validates: Requirements 3.2**

- [ ]* 6.5 Write property test for inch to millimeter conversion
  - **Property 9: Inch to millimeter conversion**
  - **Validates: Requirements 3.3**

- [x] 6.6 Create passport preset handlers

  - Implement standard passport defaults (35x45mm)
  - Implement US passport defaults (51x51mm)
  - Create face requirements setter
  - Implement custom parameter override logic
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 6.7 Write property test for standard passport defaults
  - **Property 4: Standard passport defaults**
  - **Validates: Requirements 2.1, 2.3**

- [ ]* 6.8 Write property test for US passport defaults
  - **Property 5: US passport defaults**
  - **Validates: Requirements 2.2, 2.3**

- [ ]* 6.9 Write property test for custom parameter override
  - **Property 6: Custom parameter override**
  - **Validates: Requirements 2.4**

- [x] 6.10 Implement DPI and file size parsers

  - Create DPI extractor from text
  - Implement file size parser with unit conversion (KB to MB)
  - Create compression default handler
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 6.11 Write property test for DPI extraction
  - **Property 10: DPI extraction**
  - **Validates: Requirements 4.1**

- [ ]* 6.12 Write property test for file size constraint parsing
  - **Property 11: File size constraint parsing**
  - **Validates: Requirements 4.2**

- [ ]* 6.13 Write property test for compression default
  - **Property 12: Compression default**
  - **Validates: Requirements 4.3**

- [ ]* 6.14 Write property test for multiple constraints coexistence
  - **Property 13: Multiple constraints coexistence**
  - **Validates: Requirements 4.4**

- [x] 6.15 Create background and format handlers

  - Implement background color keyword mapper
  - Create background removal detector
  - Implement format extractor and normalizer
  - Create format default logic based on task type
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 6.16 Write property test for background color mapping
  - **Property 14: Background color mapping**
  - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ]* 6.17 Write property test for background removal task type
  - **Property 15: Background removal task type**
  - **Validates: Requirements 5.5**

- [ ]* 6.18 Write property test for format extraction
  - **Property 16: Format extraction**
  - **Validates: Requirements 6.1, 6.2, 6.3**

- [ ]* 6.19 Write property test for format normalization
  - **Property 17: Format normalization**
  - **Validates: Requirements 6.5**

- [x] 6.20 Implement null handling for undetermined fields

  - Create field determination checker
  - Set undetermined fields to null
  - _Requirements: 7.3_

- [ ]* 6.21 Write property test for null handling
  - **Property 20: Null for undetermined fields**
  - **Validates: Requirements 7.3**

- [x] 7. Build database service layer




- [x] 7.1 Implement DatabaseService class


  - Create saveRequest method with Prisma
  - Implement getUserHistory with pagination
  - Create getRequestById method
  - Add error handling for database operations
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ]* 7.2 Write property test for database persistence
  - **Property 22: Database persistence**
  - **Validates: Requirements 9.1, 9.2**

- [ ]* 7.3 Write property test for chronological history ordering
  - **Property 23: Chronological history ordering**
  - **Validates: Requirements 9.3**

- [ ]* 7.4 Write unit tests for DatabaseService
  - Test saveRequest with valid data
  - Test getUserHistory pagination
  - Test error handling
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [-] 8. Implement ImageKit.io service


- [x] 8.1 Create ImageKitService class



  - Initialize ImageKit SDK with credentials
  - Implement uploadImage method
  - Create transformImage method
  - Build transformation parameter converter from ImageProcessingSpec
  - Add error handling and retries
  - _Requirements: 10.2, 10.3, 10.4_

- [ ]* 8.2 Write unit tests for ImageKitService
  - Test transformation parameter building
  - Test error handling
  - Mock ImageKit SDK calls
  - _Requirements: 10.2, 10.3, 10.4_

- [x] 9. Create API routes




- [x] 9.1 Implement POST /api/parse-query


  - Add Clerk authentication middleware
  - Validate request body
  - Call GeminiService to parse query
  - Save request to database
  - Return JSON response
  - Implement error handling
  - _Requirements: 1.1, 1.2, 1.3, 7.1, 7.2, 8.1, 9.1_

- [ ]* 9.2 Write property test for error message presence
  - **Property 27: Error message presence**
  - **Validates: Requirements 13.1**

- [ ]* 9.3 Write property test for validation error details
  - **Property 28: Validation error details**
  - **Validates: Requirements 13.3**

- [x] 9.4 Implement POST /api/process-image


  - Add Clerk authentication middleware
  - Validate image file (type, size)
  - Upload image to ImageKit
  - Apply transformations using specifications
  - Update database with processed image URL
  - Return processed image URL
  - Implement error handling
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 9.5 Write property test for file validation
  - **Property 24: File validation**
  - **Validates: Requirements 10.1, 10.5**

- [x] 9.6 Implement GET /api/history


  - Add Clerk authentication middleware
  - Get userId from Clerk session
  - Call DatabaseService to get user history
  - Return paginated results
  - Implement error handling
  - _Requirements: 9.3_

- [ ]* 9.7 Write integration tests for API routes
  - Test /api/parse-query with various queries
  - Test /api/process-image with sample images
  - Test /api/history with pagination
  - Test authentication enforcement
  - _Requirements: 8.1, 8.3, 9.1, 9.3, 10.1_

- [x] 10. Implement caching layer





  - Set up in-memory cache or Redis
  - Implement cache key generation from queries
  - Add cache lookup in parse-query route
  - Implement cache invalidation strategy
  - _Requirements: 12.4_

- [ ]* 10.1 Write property test for query caching
  - **Property 26: Query caching**
  - **Validates: Requirements 12.4**

- [x] 11. Build frontend components




- [x] 11.1 Create QueryInput component


  - Build text input with validation
  - Add submit button with loading state
  - Display example queries
  - Implement client-side validation
  - _Requirements: 1.1, 1.4_

- [ ]* 11.2 Write unit tests for QueryInput
  - Test input validation
  - Test submit behavior
  - Test loading states
  - _Requirements: 1.1, 1.4_

- [x] 11.3 Create ImageUpload component


  - Implement drag-and-drop file upload
  - Add file type and size validation
  - Show image preview
  - Display upload progress
  - _Requirements: 10.1, 10.5_

- [ ]* 11.4 Write unit tests for ImageUpload
  - Test file validation
  - Test drag-and-drop behavior
  - Test preview display
  - _Requirements: 10.1, 10.5_

- [x] 11.5 Create ResultDisplay component


  - Format and display JSON output with syntax highlighting
  - Show processed image preview
  - Add download button for processed image
  - Display original query for reference
  - _Requirements: 7.1, 10.3_

- [ ]* 11.6 Write unit tests for ResultDisplay
  - Test JSON formatting
  - Test image display
  - Test download functionality
  - _Requirements: 7.1, 10.3_

- [x] 11.7 Create HistoryList component


  - Fetch and display user history
  - Implement pagination controls
  - Add click handler to reuse previous queries
  - Show loading and empty states
  - _Requirements: 9.3_

- [ ]* 11.8 Write unit tests for HistoryList
  - Test history display
  - Test pagination
  - Test query selection
  - _Requirements: 9.3_

- [x] 12. Build main application pages





- [x] 12.1 Create home page (/)


  - Integrate QueryInput component
  - Integrate ImageUpload component
  - Integrate ResultDisplay component
  - Implement query submission flow
  - Add error display
  - _Requirements: 1.1, 7.1, 10.1_

- [x] 12.2 Create history page (/history)


  - Integrate HistoryList component
  - Add authentication check
  - Implement query reuse functionality
  - _Requirements: 9.3_

- [x] 12.3 Create authentication pages


  - Set up Clerk sign-in page
  - Set up Clerk sign-up page
  - Configure redirect URLs
  - _Requirements: 8.1, 8.2_

- [x] 13. Implement error handling and validation






  - Create error boundary components
  - Implement global error handler
  - Add input validation utilities
  - Create user-friendly error messages
  - Set up error logging
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 14. Add security measures





  - Implement rate limiting middleware
  - Add CORS configuration
  - Set up input sanitization
  - Configure file upload security
  - Validate all environment variables on startup
  - _Requirements: 8.1, 10.1_

- [x] 15. Set up monitoring and logging




  - Configure structured logging
  - Add performance monitoring
  - Set up error tracking
  - Create health check endpoint
  - _Requirements: 13.4_

- [x] 16. Create deployment configuration





  - Set up environment variable templates
  - Create Prisma migration scripts
  - Configure build settings
  - Set up CI/CD pipeline (optional)
  - Document deployment steps
  - _Requirements: All_

- [x] 17. Write documentation





  - Create README with setup instructions
  - Document API endpoints
  - Add environment variable documentation
  - Create user guide for query syntax
jn   - Document testing procedures
  - _Requirements: All_

- [x] 18. Final checkpoint - Ensure all tests pass





  - Run all unit tests
  - Run all property-based tests
  - Run integration tests
  - Verify test coverage meets targets (80% line, 70% branch)
  - Fix any failing tests
  - Ask the user if questions arise
