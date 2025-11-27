# Requirements Document

## Introduction

The NLP Image Processor is a web application that converts natural language image processing requests into structured JSON commands. The system accepts user queries like "convert this to a passport photo 300 ppi" or "resize to 1280x720" and translates them into machine-readable JSON specifications for image manipulation. The application uses Next.js for the frontend, Clerk for authentication, Neon + Prisma for database management, ImageKit.io for image processing, and Gemini LLM for natural language understanding.

## Glossary

- **System**: The NLP Image Processor application
- **User**: An authenticated person using the application to process images
- **Query**: Natural language text input describing desired image transformations
- **JSON Output**: Structured data format containing parsed image processing parameters
- **Task Type**: Category of image operation (passport_photo, resize, compress, background_change, enhance, format_change, custom)
- **DPI**: Dots per inch, a measure of image resolution
- **ImageKit**: Third-party service for performing actual image transformations
- **Gemini**: Google's large language model used for natural language processing
- **Clerk**: Authentication service for user management
- **Prisma**: Database ORM for data persistence
- **Neon**: PostgreSQL database hosting service

## Requirements

### Requirement 1

**User Story:** As a user, I want to input natural language image processing requests, so that I can describe what I need without learning technical parameters.

#### Acceptance Criteria

1. WHEN a user submits a text query THEN the System SHALL accept the input and process it without requiring structured syntax
2. WHEN a user types "convert this to a passport photo 300 ppi" THEN the System SHALL parse the request and identify passport photo specifications with 300 DPI
3. WHEN a user provides ambiguous or incomplete requests THEN the System SHALL set task_type to "custom" and populate only the fields that can be determined
4. WHEN a user submits an empty query THEN the System SHALL reject the input and maintain the current state
5. THE System SHALL support queries containing dimensions in pixels, millimeters, or inches

### Requirement 2

**User Story:** As a user, I want the system to recognize passport photo requirements, so that I can quickly generate compliant passport photos.

#### Acceptance Criteria

1. WHEN a query contains "passport", "passport-size", or "passport photo" THEN the System SHALL set width_mm to 35, height_mm to 45, dpi to 300, background to "white", and format to "jpg"
2. WHEN a query contains "US passport" or "2x2 inch" THEN the System SHALL set width_mm to 51, height_mm to 51, dpi to 300, background to "white", and format to "jpg"
3. WHEN passport photo requirements are detected THEN the System SHALL set all face_requirements fields (shoulders_visible, ears_visible, centered_face, no_tilt) to true
4. WHEN a query specifies both passport type and custom parameters THEN the System SHALL apply passport defaults and override with user-specified values

### Requirement 3

**User Story:** As a user, I want to specify image dimensions in various units, so that I can work with measurements I'm familiar with.

#### Acceptance Criteria

1. WHEN a user specifies pixel dimensions (e.g., "1280x720") THEN the System SHALL populate width_px and height_px fields
2. WHEN a user specifies millimeter dimensions (e.g., "35mm x 45mm") THEN the System SHALL populate width_mm and height_mm fields
3. WHEN a user specifies inch dimensions (e.g., "2x2 inch") THEN the System SHALL convert to millimeters and populate width_mm and height_mm fields
4. WHEN dimension units are not specified THEN the System SHALL infer the unit based on magnitude and context

### Requirement 4

**User Story:** As a user, I want to control image resolution and file size, so that I can meet specific technical requirements.

#### Acceptance Criteria

1. WHEN a user mentions "PPI" or "DPI" with a numeric value THEN the System SHALL set the dpi field to that number
2. WHEN a user requests file size constraints (e.g., "under 1MB", "compress to 500KB") THEN the System SHALL set max_file_size_mb to the specified value
3. WHEN a user requests compression without specifying size THEN the System SHALL set max_file_size_mb to 1
4. WHEN both DPI and file size are specified THEN the System SHALL include both constraints in the JSON output

### Requirement 5

**User Story:** As a user, I want to change image backgrounds, so that I can prepare photos for different purposes.

#### Acceptance Criteria

1. WHEN a user requests "white background" THEN the System SHALL set background to "white"
2. WHEN a user requests "blue background" THEN the System SHALL set background to "blue"
3. WHEN a user requests "remove background" or "transparent background" THEN the System SHALL set background to "transparent"
4. WHEN no background change is requested THEN the System SHALL set background to "original" or null
5. WHEN a user requests background removal THEN the System SHALL set task_type to "background_change"

### Requirement 6

**User Story:** As a user, I want to convert images between formats, so that I can use them in different contexts.

#### Acceptance Criteria

1. WHEN a user specifies "convert to JPG" or "save as JPEG" THEN the System SHALL set format to "jpg"
2. WHEN a user specifies "convert to PNG" THEN the System SHALL set format to "png"
3. WHEN a user specifies "convert to WebP" THEN the System SHALL set format to "webp"
4. WHEN no format is specified but task requires a default THEN the System SHALL apply appropriate format based on task_type
5. THE System SHALL normalize "jpeg" and "jpg" to the same format value

### Requirement 7

**User Story:** As a user, I want the system to output valid JSON only, so that I can reliably parse and use the results programmatically.

#### Acceptance Criteria

1. THE System SHALL return only valid JSON without explanations, comments, or markdown formatting
2. WHEN generating output THEN the System SHALL include all required fields in the JSON structure
3. WHEN a field value cannot be determined THEN the System SHALL set that field to null
4. WHEN output is generated THEN the System SHALL validate JSON structure before returning
5. THE System SHALL never include text outside the JSON object in the response

### Requirement 8

**User Story:** As a user, I want to authenticate securely, so that my image processing history and data are protected.

#### Acceptance Criteria

1. WHEN a user accesses the application THEN the System SHALL require authentication via Clerk
2. WHEN a user successfully authenticates THEN the System SHALL create or retrieve their user profile
3. WHEN an unauthenticated user attempts to process images THEN the System SHALL redirect to the login page
4. WHEN a user logs out THEN the System SHALL clear their session and prevent access to protected resources

### Requirement 9

**User Story:** As a user, I want my processing requests to be saved, so that I can review my history and reuse previous configurations.

#### Acceptance Criteria

1. WHEN a user submits a query THEN the System SHALL persist the query and generated JSON to the database via Prisma
2. WHEN storing request data THEN the System SHALL associate it with the authenticated user's account
3. WHEN a user views their history THEN the System SHALL retrieve and display their previous requests in chronological order
4. WHEN database operations fail THEN the System SHALL handle errors gracefully and inform the user

### Requirement 10

**User Story:** As a user, I want to upload and process images using the generated specifications, so that I can see the actual transformed results.

#### Acceptance Criteria

1. WHEN a user uploads an image file THEN the System SHALL validate the file type and size before processing
2. WHEN valid JSON specifications are generated THEN the System SHALL send the image and parameters to ImageKit.io for processing
3. WHEN ImageKit.io completes processing THEN the System SHALL return the transformed image URL to the user
4. WHEN image processing fails THEN the System SHALL display an error message with details
5. THE System SHALL support common image formats (JPEG, PNG, WebP) for upload

### Requirement 11

**User Story:** As a developer, I want the NLP parsing to use Gemini LLM, so that the system can understand complex and varied natural language inputs.

#### Acceptance Criteria

1. WHEN a query is received THEN the System SHALL send it to Gemini API with appropriate prompting
2. WHEN Gemini returns a response THEN the System SHALL parse and validate the JSON structure
3. WHEN Gemini API is unavailable THEN the System SHALL implement fallback parsing logic or return an error
4. WHEN API rate limits are reached THEN the System SHALL queue requests or inform the user of delays
5. THE System SHALL include the parsing rules and JSON schema in the Gemini prompt

### Requirement 12

**User Story:** As a user, I want the application to be responsive and fast, so that I can process images efficiently.

#### Acceptance Criteria

1. WHEN a user submits a query THEN the System SHALL return parsed JSON within 3 seconds under normal conditions
2. WHEN processing large images THEN the System SHALL display progress indicators to the user
3. WHEN multiple requests are made THEN the System SHALL handle them concurrently without blocking
4. THE System SHALL implement caching for repeated identical queries to improve response time

### Requirement 13

**User Story:** As a user, I want clear error messages, so that I can understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN invalid input is provided THEN the System SHALL return a descriptive error message
2. WHEN external services fail THEN the System SHALL distinguish between different failure types in error messages
3. WHEN validation fails THEN the System SHALL specify which fields or constraints were violated
4. THE System SHALL log errors for debugging while showing user-friendly messages to users
