/**
 * Core TypeScript interfaces and types for NLP Image Processor
 * Requirements: 1.1, 7.2
 */

// ============================================================================
// Task Types
// ============================================================================

/**
 * Category of image operation
 */
export type TaskType =
  | "passport_photo"
  | "resize"
  | "compress"
  | "background_change"
  | "enhance"
  | "format_change"
  | "upscale"
  | "smart_crop"
  | "generative_fill"
  | "generate_image"
  | "generate_variation"
  | "custom";

// ============================================================================
// Background Types
// ============================================================================

/**
 * Background color or effect options
 * Can be a predefined color name, hex code, or special value
 */
export type Background = "white" | "blue" | "green" | "red" | "black" | "yellow" | "gray" | "grey" | "transparent" | "original" | string;

/**
 * Image effects and adjustments
 */
export interface ImageEffects {
  rotation?: number; // 0-360 degrees
  flip?: "horizontal" | "vertical" | "both" | null;
  blur?: number; // 1-100
  grayscale?: boolean;
  sharpen?: number; // 1-100
  contrast?: number; // -100 to 100
  border?: {
    width: number;
    color: string;
  } | null;
  drop_shadow?: {
    enabled: boolean;
    top?: number;
    left?: number;
    blur?: number;
    color?: string;
    opacity?: number;
  } | null;
  retouch?: boolean;
  upscale?: boolean;
}

// ============================================================================
// Image Format Types
// ============================================================================

/**
 * Supported image formats
 */
export type ImageFormat = "jpg" | "jpeg" | "png" | "webp";

// ============================================================================
// Dimension Interfaces
// ============================================================================

/**
 * Image dimensions in various units
 */
export interface Dimensions {
  width_mm: number | null;
  height_mm: number | null;
  width_px: number | null;
  height_px: number | null;
}

// ============================================================================
// Face Requirements Interface
// ============================================================================

/**
 * Requirements for passport photo face positioning
 */
export interface FaceRequirements {
  shoulders_visible: boolean | null;
  ears_visible: boolean | null;
  centered_face: boolean | null;
  no_tilt: boolean | null;
}

// ============================================================================
// Image Processing Specification
// ============================================================================

/**
 * Complete specification for image processing operations
 * This is the main output format from NLP parsing
 */
export interface ImageProcessingSpec {
  task_type: TaskType;
  dimensions: Dimensions;
  dpi: number | null;
  background: Background | null;
  face_requirements: FaceRequirements | null;
  max_file_size_mb: number | null;
  format: ImageFormat | null;
  effects?: ImageEffects | null;
  additional_notes: string | null;
}

// ============================================================================
// Database Models
// ============================================================================

/**
 * Processing request stored in database
 */
export interface ProcessingRequest {
  id: string;
  userId: string;
  query: string;
  jsonOutput: ImageProcessingSpec;
  processedImageUrl?: string;
  createdAt: Date;
}

// ============================================================================
// API Request/Response Interfaces
// ============================================================================

/**
 * Request to parse a natural language query
 */
export interface ParseQueryRequest {
  query: string;
  userId: string;
}

/**
 * Response from query parsing
 */
export interface ParseQueryResponse {
  success: boolean;
  data?: ImageProcessingSpec;
  error?: string;
}

/**
 * Request to process an image with specifications
 */
export interface ProcessImageRequest {
  imageFile: File;
  specifications: ImageProcessingSpec;
  userId: string;
}

/**
 * Response from image processing
 */
export interface ProcessImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Request to retrieve user history
 */
export interface HistoryRequest {
  userId: string;
  page?: number;
  limit?: number;
}

/**
 * Response containing user history
 */
export interface HistoryResponse {
  success: boolean;
  data?: ProcessingRequest[];
  total?: number;
  error?: string;
}

// ============================================================================
// Error Response Interface
// ============================================================================

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// ============================================================================
// ImageKit Transformation Parameters
// ============================================================================

/**
 * Parameters for ImageKit.io transformations
 */
export interface TransformationParams {
  width?: number;
  height?: number;
  dpr?: number;
  quality?: number;
  format?: string;
  background?: string;
  rotation?: number;
  flip?: string;
  blur?: number;
  grayscale?: boolean;
  sharpen?: number;
  contrast?: number;
  border?: string;
  [key: string]: any;
}
