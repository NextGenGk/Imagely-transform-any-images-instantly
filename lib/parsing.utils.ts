/**
 * Parsing utilities for NLP Image Processor
 * Requirements: 3.1, 3.2, 3.3, 1.5, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.3
 */

import type { Dimensions, Background, ImageFormat, FaceRequirements, ImageProcessingSpec } from './types';

// ============================================================================
// Dimension Parsing Utilities (Subtask 6.1)
// ============================================================================

/**
 * Parse pixel dimensions from text (e.g., "1280x720", "1920 x 1080 pixels")
 * Requirements: 3.1
 */
export function parsePixelDimensions(text: string): { width: number; height: number } | null {
  // Match patterns like "1280x720", "1280 x 720", "1280x720px", "1280 x 720 pixels"
  const pixelPattern = /(\d+)\s*[x×]\s*(\d+)\s*(?:px|pixels?)?/i;
  const match = text.match(pixelPattern);
  
  if (match) {
    const width = parseInt(match[1], 10);
    const height = parseInt(match[2], 10);
    
    if (width > 0 && height > 0) {
      return { width, height };
    }
  }
  
  return null;
}

/**
 * Parse millimeter dimensions from text (e.g., "35mm x 45mm", "35 x 45 mm")
 * Requirements: 3.2
 */
export function parseMillimeterDimensions(text: string): { width: number; height: number } | null {
  // Match patterns like "35mm x 45mm", "35 x 45 mm", "35x45mm"
  const mmPattern = /(\d+(?:\.\d+)?)\s*(?:mm)?\s*[x×]\s*(\d+(?:\.\d+)?)\s*mm/i;
  const match = text.match(mmPattern);
  
  if (match) {
    const width = parseFloat(match[1]);
    const height = parseFloat(match[2]);
    
    if (width > 0 && height > 0) {
      return { width, height };
    }
  }
  
  return null;
}

/**
 * Convert inches to millimeters (1 inch = 25.4mm)
 * Requirements: 3.3
 */
export function convertInchesToMillimeters(inches: number): number {
  return inches * 25.4;
}

/**
 * Parse inch dimensions from text and convert to millimeters (e.g., "2x2 inch", "4 x 6 inches")
 * Requirements: 3.3
 */
export function parseInchDimensions(text: string): { width: number; height: number } | null {
  // Match patterns like "2x2 inch", "4 x 6 inches", "2x2in"
  const inchPattern = /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:inch|inches|in)/i;
  const match = text.match(inchPattern);
  
  if (match) {
    const widthInches = parseFloat(match[1]);
    const heightInches = parseFloat(match[2]);
    
    if (widthInches > 0 && heightInches > 0) {
      return {
        width: convertInchesToMillimeters(widthInches),
        height: convertInchesToMillimeters(heightInches)
      };
    }
  }
  
  return null;
}

/**
 * Detect dimension format and parse accordingly
 * Requirements: 1.5
 */
export function parseDimensions(text: string): Dimensions {
  const dimensions: Dimensions = {
    width_mm: null,
    height_mm: null,
    width_px: null,
    height_px: null
  };
  
  // Try pixel dimensions first
  const pixelDims = parsePixelDimensions(text);
  if (pixelDims) {
    dimensions.width_px = pixelDims.width;
    dimensions.height_px = pixelDims.height;
  }
  
  // Try millimeter dimensions
  const mmDims = parseMillimeterDimensions(text);
  if (mmDims) {
    dimensions.width_mm = mmDims.width;
    dimensions.height_mm = mmDims.height;
  }
  
  // Try inch dimensions (converts to mm)
  const inchDims = parseInchDimensions(text);
  if (inchDims) {
    dimensions.width_mm = inchDims.width;
    dimensions.height_mm = inchDims.height;
  }
  
  return dimensions;
}

// ============================================================================
// Passport Preset Handlers (Subtask 6.6)
// ============================================================================

/**
 * Standard passport photo defaults (35x45mm)
 * Requirements: 2.1, 2.3
 */
export function getStandardPassportDefaults(): Partial<ImageProcessingSpec> {
  return {
    dimensions: {
      width_mm: 35,
      height_mm: 45,
      width_px: null,
      height_px: null
    },
    dpi: 300,
    background: 'white',
    format: 'jpg',
    face_requirements: {
      shoulders_visible: true,
      ears_visible: true,
      centered_face: true,
      no_tilt: true
    }
  };
}

/**
 * US passport photo defaults (51x51mm / 2x2 inch)
 * Requirements: 2.2, 2.3
 */
export function getUSPassportDefaults(): Partial<ImageProcessingSpec> {
  return {
    dimensions: {
      width_mm: 51,
      height_mm: 51,
      width_px: null,
      height_px: null
    },
    dpi: 300,
    background: 'white',
    format: 'jpg',
    face_requirements: {
      shoulders_visible: true,
      ears_visible: true,
      centered_face: true,
      no_tilt: true
    }
  };
}

/**
 * Detect passport type from query text
 * Requirements: 2.1, 2.2
 */
export function detectPassportType(text: string): 'standard' | 'us' | null {
  const lowerText = text.toLowerCase();
  
  // Check for US passport
  if (lowerText.includes('us passport') || lowerText.includes('2x2 inch')) {
    return 'us';
  }
  
  // Check for standard passport
  if (lowerText.includes('passport') || lowerText.includes('passport-size') || lowerText.includes('passport photo')) {
    return 'standard';
  }
  
  return null;
}

/**
 * Apply passport defaults with custom parameter override
 * Requirements: 2.4
 */
export function applyPassportDefaults(
  text: string,
  customSpec: Partial<ImageProcessingSpec>
): Partial<ImageProcessingSpec> {
  const passportType = detectPassportType(text);
  
  if (!passportType) {
    return customSpec;
  }
  
  // Get base defaults
  const defaults = passportType === 'us' 
    ? getUSPassportDefaults() 
    : getStandardPassportDefaults();
  
  // Override with custom parameters
  const result: Partial<ImageProcessingSpec> = {
    ...defaults,
    ...customSpec,
  };
  
  // Merge dimensions properly
  if (defaults.dimensions || customSpec.dimensions) {
    result.dimensions = {
      width_mm: customSpec.dimensions?.width_mm ?? defaults.dimensions?.width_mm ?? null,
      height_mm: customSpec.dimensions?.height_mm ?? defaults.dimensions?.height_mm ?? null,
      width_px: customSpec.dimensions?.width_px ?? defaults.dimensions?.width_px ?? null,
      height_px: customSpec.dimensions?.height_px ?? defaults.dimensions?.height_px ?? null,
    };
  }
  
  // Merge face_requirements properly
  if (defaults.face_requirements || customSpec.face_requirements) {
    result.face_requirements = {
      shoulders_visible: customSpec.face_requirements?.shoulders_visible ?? defaults.face_requirements?.shoulders_visible ?? null,
      ears_visible: customSpec.face_requirements?.ears_visible ?? defaults.face_requirements?.ears_visible ?? null,
      centered_face: customSpec.face_requirements?.centered_face ?? defaults.face_requirements?.centered_face ?? null,
      no_tilt: customSpec.face_requirements?.no_tilt ?? defaults.face_requirements?.no_tilt ?? null,
    };
  }
  
  return result;
}

// ============================================================================
// DPI and File Size Parsers (Subtask 6.10)
// ============================================================================

/**
 * Extract DPI/PPI value from text
 * Requirements: 4.1
 */
export function extractDPI(text: string): number | null {
  // Match patterns like "300 dpi", "300dpi", "300 ppi", "300ppi"
  const dpiPattern = /(\d+)\s*(?:dpi|ppi)/i;
  const match = text.match(dpiPattern);
  
  if (match) {
    const dpi = parseInt(match[1], 10);
    if (dpi > 0) {
      return dpi;
    }
  }
  
  return null;
}

/**
 * Parse file size constraint and convert to MB
 * Requirements: 4.2
 */
export function parseFileSize(text: string): number | null {
  // Match patterns like "under 1MB", "compress to 500KB", "max 2 MB", "< 1.5MB"
  const mbPattern = /(?:under|max|compress to|<|less than)?\s*(\d+(?:\.\d+)?)\s*mb/i;
  const kbPattern = /(?:under|max|compress to|<|less than)?\s*(\d+(?:\.\d+)?)\s*kb/i;
  
  const mbMatch = text.match(mbPattern);
  if (mbMatch) {
    const mb = parseFloat(mbMatch[1]);
    if (mb > 0) {
      return mb;
    }
  }
  
  const kbMatch = text.match(kbPattern);
  if (kbMatch) {
    const kb = parseFloat(kbMatch[1]);
    if (kb > 0) {
      return kb / 1024; // Convert KB to MB
    }
  }
  
  return null;
}

/**
 * Detect compression request and apply default file size
 * Requirements: 4.3
 */
export function detectCompression(text: string): number | null {
  const lowerText = text.toLowerCase();
  
  // Check for compression keywords without specific size
  const hasCompressionKeyword = /\b(compress|compression|reduce size|smaller)\b/i.test(lowerText);
  const hasSpecificSize = parseFileSize(text) !== null;
  
  if (hasCompressionKeyword && !hasSpecificSize) {
    return 1; // Default to 1MB
  }
  
  return null;
}

/**
 * Parse file size with compression default handling
 * Requirements: 4.2, 4.3
 */
export function parseFileSizeWithDefaults(text: string): number | null {
  // First try to parse explicit file size
  const explicitSize = parseFileSize(text);
  if (explicitSize !== null) {
    return explicitSize;
  }
  
  // If no explicit size, check for compression keywords
  return detectCompression(text);
}

// ============================================================================
// Background and Format Handlers (Subtask 6.15)
// ============================================================================

/**
 * Map background color keywords to Background type
 * Requirements: 5.1, 5.2, 5.3
 */
export function parseBackground(text: string): Background | null {
  const lowerText = text.toLowerCase();
  
  // Check for transparent/remove background
  if (lowerText.includes('remove background') || lowerText.includes('transparent background') || lowerText.includes('no background')) {
    return 'transparent';
  }
  
  // Check for white background
  if (lowerText.includes('white background')) {
    return 'white';
  }
  
  // Check for blue background
  if (lowerText.includes('blue background')) {
    return 'blue';
  }
  
  return null;
}

/**
 * Detect if background removal is requested
 * Requirements: 5.5
 */
export function isBackgroundRemovalTask(text: string): boolean {
  const lowerText = text.toLowerCase();
  return lowerText.includes('remove background') || 
         lowerText.includes('transparent background') ||
         lowerText.includes('no background');
}

/**
 * Extract and normalize image format
 * Requirements: 6.1, 6.2, 6.3, 6.5
 */
export function parseFormat(text: string): ImageFormat | null {
  const lowerText = text.toLowerCase();
  
  // Check for JPG/JPEG
  if (lowerText.includes('convert to jpg') || 
      lowerText.includes('save as jpg') ||
      lowerText.includes('convert to jpeg') || 
      lowerText.includes('save as jpeg') ||
      lowerText.includes('.jpg') ||
      lowerText.includes('.jpeg')) {
    return 'jpg'; // Normalize to 'jpg'
  }
  
  // Check for PNG
  if (lowerText.includes('convert to png') || 
      lowerText.includes('save as png') ||
      lowerText.includes('.png')) {
    return 'png';
  }
  
  // Check for WebP
  if (lowerText.includes('convert to webp') || 
      lowerText.includes('save as webp') ||
      lowerText.includes('.webp')) {
    return 'webp';
  }
  
  return null;
}

/**
 * Get default format based on task type
 * Requirements: 6.4
 */
export function getDefaultFormat(taskType: string): ImageFormat | null {
  switch (taskType) {
    case 'passport_photo':
      return 'jpg';
    case 'format_change':
      return null; // Must be explicitly specified
    default:
      return null;
  }
}

// ============================================================================
// Null Handling for Undetermined Fields (Subtask 6.20)
// ============================================================================

/**
 * Check if a field value is determined (not null/undefined/empty)
 * Requirements: 7.3
 */
export function isFieldDetermined(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return false;
  }
  
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return false;
  }
  
  return true;
}

/**
 * Ensure undetermined fields are set to null
 * Requirements: 7.3
 */
export function normalizeUndeterminedFields(spec: Partial<ImageProcessingSpec>): Partial<ImageProcessingSpec> {
  const normalized: any = { ...spec };
  
  // Normalize top-level fields
  Object.keys(normalized).forEach(key => {
    if (!isFieldDetermined(normalized[key])) {
      normalized[key] = null;
    }
  });
  
  // Normalize dimensions
  if (normalized.dimensions) {
    Object.keys(normalized.dimensions).forEach(key => {
      if (!isFieldDetermined(normalized.dimensions[key])) {
        normalized.dimensions[key] = null;
      }
    });
  }
  
  // Normalize face_requirements
  if (normalized.face_requirements) {
    Object.keys(normalized.face_requirements).forEach(key => {
      if (!isFieldDetermined(normalized.face_requirements[key])) {
        normalized.face_requirements[key] = null;
      }
    });
  }
  
  return normalized;
}
