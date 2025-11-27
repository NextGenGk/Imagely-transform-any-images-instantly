# API Documentation

This document provides a complete reference for all API endpoints in the NLP Image Processor application.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: Your deployed URL (e.g., `https://your-app.vercel.app`)

## Authentication

All API endpoints (except `/api/health`) require authentication via Clerk. Include the Clerk session token in your requests.

### Authentication Headers

When making requests from the client-side, Clerk automatically handles authentication. For server-side or external API calls, include the session token:

```
Authorization: Bearer <clerk_session_token>
```

## Endpoints

### 1. Parse Query

Parse a natural language query into structured JSON specifications.

**Endpoint**: `POST /api/parse-query`

**Requirements**: 1.1, 1.2, 1.3, 7.1, 7.2, 8.1, 9.1, 13.1, 13.2, 13.3, 13.4

#### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "query": "convert this to a passport photo 300 ppi"
}
```

**Parameters**:
- `query` (string, required): Natural language description of image processing requirements

#### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "task_type": "passport_photo",
    "dimensions": {
      "width_mm": 35,
      "height_mm": 45,
      "width_px": null,
      "height_px": null
    },
    "dpi": 300,
    "background": "white",
    "face_requirements": {
      "shoulders_visible": true,
      "ears_visible": true,
      "centered_face": true,
      "no_tilt": true
    },
    "max_file_size_mb": null,
    "format": "jpg",
    "additional_notes": null
  }
}
```

**Error Responses**:

- **400 Bad Request**: Invalid input
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Query is required and must be a non-empty string",
    "details": {
      "field": "query"
    }
  }
}
```

- **401 Unauthorized**: Not authenticated
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Authentication required"
  }
}
```

- **429 Too Many Requests**: Rate limit exceeded
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_ERROR",
    "message": "Too many requests. Please try again later."
  }
}
```

- **503 Service Unavailable**: External service failure
```json
{
  "success": false,
  "error": {
    "code": "EXTERNAL_SERVICE_ERROR",
    "message": "Failed to parse query using natural language processing",
    "details": {
      "service": "Gemini API"
    }
  }
}
```

#### Features

- **Caching**: Identical queries are cached for faster responses
- **Rate Limiting**: 60 requests per minute per user
- **Database Persistence**: All queries are saved to user history
- **Input Sanitization**: Queries are sanitized to prevent malicious content

#### Example Queries

```bash
# Simple resize
curl -X POST http://localhost:3000/api/parse-query \
  -H "Content-Type: application/json" \
  -d '{"query": "resize to 1280x720"}'

# Passport photo
curl -X POST http://localhost:3000/api/parse-query \
  -H "Content-Type: application/json" \
  -d '{"query": "US passport photo 300 dpi"}'

# Compression
curl -X POST http://localhost:3000/api/parse-query \
  -H "Content-Type: application/json" \
  -d '{"query": "compress to under 500KB"}'

# Background change
curl -X POST http://localhost:3000/api/parse-query \
  -H "Content-Type: application/json" \
  -d '{"query": "remove background and convert to PNG"}'
```

---

### 2. Process Image

Upload and process an image using the generated specifications.

**Endpoint**: `POST /api/process-image`

**Requirements**: 10.1, 10.2, 10.3, 10.4, 10.5, 13.1, 13.2, 13.3, 13.4

#### Request

**Headers**:
```
Content-Type: multipart/form-data
```

**Body** (form-data):
- `image` (file, required): Image file to process
- `specifications` (string, required): JSON string of ImageProcessingSpec
- `requestId` (string, optional): ID of existing request to update

#### Specifications Format

```json
{
  "task_type": "resize",
  "dimensions": {
    "width_mm": null,
    "height_mm": null,
    "width_px": 1280,
    "height_px": 720
  },
  "dpi": null,
  "background": "original",
  "face_requirements": null,
  "max_file_size_mb": null,
  "format": "jpg",
  "additional_notes": null
}
```

#### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "imageUrl": "https://ik.imagekit.io/your_id/processed_image.jpg"
}
```

**Error Responses**:

- **400 Bad Request**: Invalid file or specifications
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "File type not supported. Allowed types: image/jpeg, image/png, image/webp",
    "details": {
      "field": "image",
      "value": "image/gif"
    }
  }
}
```

- **413 Payload Too Large**: File size exceeds limit
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "File size exceeds maximum allowed size of 10MB"
  }
}
```

#### Constraints

- **Supported Formats**: JPEG, PNG, WebP
- **Maximum File Size**: 10MB
- **Rate Limiting**: 30 requests per minute per user

#### Example Request

```bash
curl -X POST http://localhost:3000/api/process-image \
  -F "image=@photo.jpg" \
  -F 'specifications={"task_type":"resize","dimensions":{"width_px":1280,"height_px":720,"width_mm":null,"height_mm":null},"dpi":null,"background":"original","face_requirements":null,"max_file_size_mb":null,"format":"jpg","additional_notes":null}'
```

---

### 3. Get History

Retrieve the authenticated user's processing history with pagination.

**Endpoint**: `GET /api/history`

**Requirements**: 9.3, 13.1, 13.2, 13.3, 13.4

#### Request

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)

#### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "userId": "user_abc123",
      "query": "convert this to a passport photo 300 ppi",
      "jsonOutput": {
        "task_type": "passport_photo",
        "dimensions": {
          "width_mm": 35,
          "height_mm": 45,
          "width_px": null,
          "height_px": null
        },
        "dpi": 300,
        "background": "white",
        "face_requirements": {
          "shoulders_visible": true,
          "ears_visible": true,
          "centered_face": true,
          "no_tilt": true
        },
        "max_file_size_mb": null,
        "format": "jpg",
        "additional_notes": null
      },
      "processedImageUrl": "https://ik.imagekit.io/your_id/image.jpg",
      "createdAt": "2024-11-24T10:30:00.000Z"
    }
  ],
  "total": 42
}
```

**Error Responses**:

- **400 Bad Request**: Invalid pagination parameters
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Page must be a positive integer"
  }
}
```

#### Features

- **Chronological Ordering**: Results ordered by creation time (newest first)
- **Pagination**: Efficient pagination for large histories
- **Rate Limiting**: 120 requests per minute per user

#### Example Requests

```bash
# Get first page (default)
curl http://localhost:3000/api/history

# Get specific page with custom limit
curl "http://localhost:3000/api/history?page=2&limit=20"

# Get all recent requests
curl "http://localhost:3000/api/history?page=1&limit=100"
```

---

### 4. Health Check

Check the health status of the application and its dependencies.

**Endpoint**: `GET /api/health`

**Requirements**: 13.4

**Authentication**: Not required (public endpoint)

#### Response

**Healthy (200 OK)**:
```json
{
  "status": "healthy",
  "timestamp": "2024-11-24T10:30:00.000Z",
  "uptime": 3600000,
  "checks": {
    "database": {
      "status": "up",
      "responseTime": 45
    },
    "gemini": {
      "status": "up",
      "configured": true
    },
    "imagekit": {
      "status": "up",
      "configured": true
    },
    "clerk": {
      "status": "up",
      "configured": true
    }
  },
  "metrics": {
    "totalErrors": 5,
    "criticalErrors": 0,
    "recentErrors": 2
  },
  "version": "1.0.0",
  "environment": "production"
}
```

**Degraded (200 OK)**:
```json
{
  "status": "degraded",
  "timestamp": "2024-11-24T10:30:00.000Z",
  "uptime": 3600000,
  "checks": {
    "database": {
      "status": "up",
      "responseTime": 45
    },
    "gemini": {
      "status": "down",
      "configured": true
    },
    "imagekit": {
      "status": "up",
      "configured": true
    },
    "clerk": {
      "status": "up",
      "configured": true
    }
  },
  "version": "1.0.0",
  "environment": "production"
}
```

**Unhealthy (503 Service Unavailable)**:
```json
{
  "status": "unhealthy",
  "timestamp": "2024-11-24T10:30:00.000Z",
  "uptime": 3600000,
  "checks": {
    "database": {
      "status": "down",
      "error": "Connection timeout"
    },
    "gemini": {
      "status": "unknown",
      "configured": false
    },
    "imagekit": {
      "status": "unknown",
      "configured": false
    },
    "clerk": {
      "status": "unknown",
      "configured": false
    }
  },
  "version": "1.0.0",
  "environment": "production"
}
```

#### Status Levels

- **healthy**: All systems operational
- **degraded**: Core systems operational, but some external services unavailable
- **unhealthy**: Critical systems (database or authentication) unavailable

#### Use Cases

- **Monitoring**: Integrate with monitoring tools (Datadog, New Relic, etc.)
- **Load Balancers**: Health check endpoint for load balancer configuration
- **CI/CD**: Verify deployment success
- **Debugging**: Quick system status overview

---

## Data Types

### ImageProcessingSpec

Complete specification for image processing operations.

```typescript
interface ImageProcessingSpec {
  task_type: TaskType;
  dimensions: Dimensions;
  dpi: number | null;
  background: Background | null;
  face_requirements: FaceRequirements | null;
  max_file_size_mb: number | null;
  format: ImageFormat | null;
  additional_notes: string | null;
}
```

### TaskType

```typescript
type TaskType =
  | "passport_photo"
  | "resize"
  | "compress"
  | "background_change"
  | "enhance"
  | "format_change"
  | "custom";
```

### Dimensions

```typescript
interface Dimensions {
  width_mm: number | null;
  height_mm: number | null;
  width_px: number | null;
  height_px: number | null;
}
```

### Background

```typescript
type Background = "white" | "blue" | "transparent" | "original";
```

### FaceRequirements

```typescript
interface FaceRequirements {
  shoulders_visible: boolean | null;
  ears_visible: boolean | null;
  centered_face: boolean | null;
  no_tilt: boolean | null;
}
```

### ImageFormat

```typescript
type ImageFormat = "jpg" | "jpeg" | "png" | "webp";
```

---

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTHENTICATION_ERROR` | User not authenticated | 401 |
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `RATE_LIMIT_ERROR` | Too many requests | 429 |
| `EXTERNAL_SERVICE_ERROR` | External service failure | 503 |
| `DATABASE_ERROR` | Database operation failed | 500 |
| `INTERNAL_ERROR` | Unexpected server error | 500 |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/parse-query` | 60 requests | per minute |
| `/api/process-image` | 30 requests | per minute |
| `/api/history` | 120 requests | per minute |
| `/api/health` | No limit | - |

Rate limits are applied per authenticated user. When exceeded, the API returns a 429 status code with a `Retry-After` header.

---

## CORS

CORS is configured to allow requests from:
- Same origin (default)
- Configured allowed origins (set via `ALLOWED_ORIGINS` environment variable)

For production deployments, configure `ALLOWED_ORIGINS` with your frontend domain(s).

---

## Security Headers

All API responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

---

## Best Practices

1. **Error Handling**: Always check the `success` field in responses
2. **Rate Limiting**: Implement exponential backoff for retries
3. **File Uploads**: Validate file size and type on client-side before uploading
4. **Caching**: Leverage the built-in query caching for repeated requests
5. **Authentication**: Ensure Clerk session is valid before making requests
6. **Monitoring**: Use the `/api/health` endpoint for uptime monitoring

---

## Support

For API issues or questions:
- Check the [Query Syntax Guide](./QUERY_SYNTAX.md) for query formatting
- Review the [Testing Guide](./TESTING.md) for testing API endpoints
- See [Troubleshooting](../DEPLOYMENT.md#troubleshooting) for common issues
