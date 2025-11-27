/**
 * Unit tests for parsing utilities
 * Requirements: 3.1, 3.2, 3.3, 1.5, 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.5, 6.1, 6.2, 6.3, 6.5, 7.3
 */

import { describe, it, expect } from 'vitest';
import {
  parsePixelDimensions,
  parseMillimeterDimensions,
  parseInchDimensions,
  convertInchesToMillimeters,
  parseDimensions,
  getStandardPassportDefaults,
  getUSPassportDefaults,
  detectPassportType,
  applyPassportDefaults,
  extractDPI,
  parseFileSize,
  detectCompression,
  parseFileSizeWithDefaults,
  parseBackground,
  isBackgroundRemovalTask,
  parseFormat,
  getDefaultFormat,
  isFieldDetermined,
  normalizeUndeterminedFields
} from '../lib/parsing.utils';

// ============================================================================
// Dimension Parsing Tests (Subtask 6.1)
// ============================================================================

describe('parsePixelDimensions', () => {
  it('should parse basic pixel dimensions', () => {
    expect(parsePixelDimensions('1280x720')).toEqual({ width: 1280, height: 720 });
  });

  it('should parse pixel dimensions with spaces', () => {
    expect(parsePixelDimensions('1920 x 1080')).toEqual({ width: 1920, height: 1080 });
  });

  it('should parse pixel dimensions with px suffix', () => {
    expect(parsePixelDimensions('800x600px')).toEqual({ width: 800, height: 600 });
  });

  it('should parse pixel dimensions with pixels suffix', () => {
    expect(parsePixelDimensions('1024 x 768 pixels')).toEqual({ width: 1024, height: 768 });
  });

  it('should return null for invalid input', () => {
    expect(parsePixelDimensions('not dimensions')).toBeNull();
  });
});

describe('parseMillimeterDimensions', () => {
  it('should parse millimeter dimensions', () => {
    expect(parseMillimeterDimensions('35mm x 45mm')).toEqual({ width: 35, height: 45 });
  });

  it('should parse millimeter dimensions with spaces', () => {
    expect(parseMillimeterDimensions('35 x 45 mm')).toEqual({ width: 35, height: 45 });
  });

  it('should parse decimal millimeter dimensions', () => {
    expect(parseMillimeterDimensions('35.5mm x 45.5mm')).toEqual({ width: 35.5, height: 45.5 });
  });

  it('should return null for invalid input', () => {
    expect(parseMillimeterDimensions('not dimensions')).toBeNull();
  });
});

describe('convertInchesToMillimeters', () => {
  it('should convert 2 inches to 50.8mm', () => {
    expect(convertInchesToMillimeters(2)).toBe(50.8);
  });

  it('should convert 1 inch to 25.4mm', () => {
    expect(convertInchesToMillimeters(1)).toBe(25.4);
  });

  it('should convert decimal inches', () => {
    expect(convertInchesToMillimeters(2.5)).toBe(63.5);
  });
});

describe('parseInchDimensions', () => {
  it('should parse inch dimensions and convert to mm', () => {
    const result = parseInchDimensions('2x2 inch');
    expect(result).toEqual({ width: 50.8, height: 50.8 });
  });

  it('should parse inch dimensions with spaces', () => {
    const result = parseInchDimensions('4 x 6 inches');
    expect(result?.width).toBeCloseTo(101.6, 1);
    expect(result?.height).toBeCloseTo(152.4, 1);
  });

  it('should return null for invalid input', () => {
    expect(parseInchDimensions('not dimensions')).toBeNull();
  });
});

describe('parseDimensions', () => {
  it('should parse pixel dimensions', () => {
    const result = parseDimensions('resize to 1280x720');
    expect(result.width_px).toBe(1280);
    expect(result.height_px).toBe(720);
  });

  it('should parse millimeter dimensions', () => {
    const result = parseDimensions('35mm x 45mm');
    expect(result.width_mm).toBe(35);
    expect(result.height_mm).toBe(45);
  });

  it('should parse inch dimensions', () => {
    const result = parseDimensions('2x2 inch');
    expect(result.width_mm).toBe(50.8);
    expect(result.height_mm).toBe(50.8);
  });
});

// ============================================================================
// Passport Preset Tests (Subtask 6.6)
// ============================================================================

describe('getStandardPassportDefaults', () => {
  it('should return standard passport defaults', () => {
    const defaults = getStandardPassportDefaults();
    expect(defaults.dimensions?.width_mm).toBe(35);
    expect(defaults.dimensions?.height_mm).toBe(45);
    expect(defaults.dpi).toBe(300);
    expect(defaults.background).toBe('white');
    expect(defaults.format).toBe('jpg');
    expect(defaults.face_requirements?.shoulders_visible).toBe(true);
    expect(defaults.face_requirements?.ears_visible).toBe(true);
    expect(defaults.face_requirements?.centered_face).toBe(true);
    expect(defaults.face_requirements?.no_tilt).toBe(true);
  });
});

describe('getUSPassportDefaults', () => {
  it('should return US passport defaults', () => {
    const defaults = getUSPassportDefaults();
    expect(defaults.dimensions?.width_mm).toBe(51);
    expect(defaults.dimensions?.height_mm).toBe(51);
    expect(defaults.dpi).toBe(300);
    expect(defaults.background).toBe('white');
    expect(defaults.format).toBe('jpg');
    expect(defaults.face_requirements?.shoulders_visible).toBe(true);
  });
});

describe('detectPassportType', () => {
  it('should detect standard passport', () => {
    expect(detectPassportType('convert to passport photo')).toBe('standard');
    expect(detectPassportType('passport-size')).toBe('standard');
    expect(detectPassportType('make it a passport')).toBe('standard');
  });

  it('should detect US passport', () => {
    expect(detectPassportType('US passport photo')).toBe('us');
    expect(detectPassportType('2x2 inch photo')).toBe('us');
  });

  it('should return null for non-passport queries', () => {
    expect(detectPassportType('resize to 1280x720')).toBeNull();
  });
});

describe('applyPassportDefaults', () => {
  it('should apply standard passport defaults', () => {
    const result = applyPassportDefaults('passport photo', {});
    expect(result.dimensions?.width_mm).toBe(35);
    expect(result.dimensions?.height_mm).toBe(45);
  });

  it('should apply US passport defaults', () => {
    const result = applyPassportDefaults('US passport', {});
    expect(result.dimensions?.width_mm).toBe(51);
    expect(result.dimensions?.height_mm).toBe(51);
  });

  it('should override defaults with custom parameters', () => {
    const result = applyPassportDefaults('passport photo', { dpi: 600 });
    expect(result.dimensions?.width_mm).toBe(35);
    expect(result.dpi).toBe(600);
  });

  it('should return custom spec for non-passport queries', () => {
    const customSpec = { dpi: 150 };
    const result = applyPassportDefaults('resize image', customSpec);
    expect(result).toEqual(customSpec);
  });
});

// ============================================================================
// DPI and File Size Tests (Subtask 6.10)
// ============================================================================

describe('extractDPI', () => {
  it('should extract DPI value', () => {
    expect(extractDPI('300 dpi')).toBe(300);
    expect(extractDPI('300dpi')).toBe(300);
  });

  it('should extract PPI value', () => {
    expect(extractDPI('300 ppi')).toBe(300);
    expect(extractDPI('300ppi')).toBe(300);
  });

  it('should return null for no DPI', () => {
    expect(extractDPI('resize image')).toBeNull();
  });
});

describe('parseFileSize', () => {
  it('should parse MB file size', () => {
    expect(parseFileSize('under 1MB')).toBe(1);
    expect(parseFileSize('max 2 MB')).toBe(2);
    expect(parseFileSize('compress to 1.5MB')).toBe(1.5);
  });

  it('should parse KB file size and convert to MB', () => {
    expect(parseFileSize('under 500KB')).toBeCloseTo(0.488, 2);
    expect(parseFileSize('compress to 1024KB')).toBe(1);
  });

  it('should return null for no file size', () => {
    expect(parseFileSize('resize image')).toBeNull();
  });
});

describe('detectCompression', () => {
  it('should detect compression without specific size', () => {
    expect(detectCompression('compress image')).toBe(1);
    expect(detectCompression('reduce size')).toBe(1);
  });

  it('should return null when specific size is provided', () => {
    expect(detectCompression('compress to 500KB')).toBeNull();
  });

  it('should return null for no compression', () => {
    expect(detectCompression('resize image')).toBeNull();
  });
});

describe('parseFileSizeWithDefaults', () => {
  it('should parse explicit file size', () => {
    expect(parseFileSizeWithDefaults('under 2MB')).toBe(2);
  });

  it('should apply default for compression without size', () => {
    expect(parseFileSizeWithDefaults('compress image')).toBe(1);
  });

  it('should return null for no file size or compression', () => {
    expect(parseFileSizeWithDefaults('resize image')).toBeNull();
  });
});

// ============================================================================
// Background and Format Tests (Subtask 6.15)
// ============================================================================

describe('parseBackground', () => {
  it('should parse white background', () => {
    expect(parseBackground('white background')).toBe('white');
  });

  it('should parse blue background', () => {
    expect(parseBackground('blue background')).toBe('blue');
  });

  it('should parse transparent background', () => {
    expect(parseBackground('remove background')).toBe('transparent');
    expect(parseBackground('transparent background')).toBe('transparent');
    expect(parseBackground('no background')).toBe('transparent');
  });

  it('should return null for no background specification', () => {
    expect(parseBackground('resize image')).toBeNull();
  });
});

describe('isBackgroundRemovalTask', () => {
  it('should detect background removal', () => {
    expect(isBackgroundRemovalTask('remove background')).toBe(true);
    expect(isBackgroundRemovalTask('transparent background')).toBe(true);
    expect(isBackgroundRemovalTask('no background')).toBe(true);
  });

  it('should return false for no background removal', () => {
    expect(isBackgroundRemovalTask('resize image')).toBe(false);
  });
});

describe('parseFormat', () => {
  it('should parse JPG format', () => {
    expect(parseFormat('convert to jpg')).toBe('jpg');
    expect(parseFormat('save as jpeg')).toBe('jpg');
  });

  it('should parse PNG format', () => {
    expect(parseFormat('convert to png')).toBe('png');
  });

  it('should parse WebP format', () => {
    expect(parseFormat('convert to webp')).toBe('webp');
  });

  it('should normalize jpeg to jpg', () => {
    expect(parseFormat('convert to jpeg')).toBe('jpg');
  });

  it('should return null for no format', () => {
    expect(parseFormat('resize image')).toBeNull();
  });
});

describe('getDefaultFormat', () => {
  it('should return jpg for passport_photo', () => {
    expect(getDefaultFormat('passport_photo')).toBe('jpg');
  });

  it('should return null for format_change', () => {
    expect(getDefaultFormat('format_change')).toBeNull();
  });

  it('should return null for other task types', () => {
    expect(getDefaultFormat('resize')).toBeNull();
  });
});

// ============================================================================
// Null Handling Tests (Subtask 6.20)
// ============================================================================

describe('isFieldDetermined', () => {
  it('should return false for null', () => {
    expect(isFieldDetermined(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isFieldDetermined(undefined)).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isFieldDetermined('')).toBe(false);
    expect(isFieldDetermined('   ')).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isFieldDetermined({})).toBe(false);
  });

  it('should return true for valid values', () => {
    expect(isFieldDetermined('value')).toBe(true);
    expect(isFieldDetermined(123)).toBe(true);
    expect(isFieldDetermined(true)).toBe(true);
    expect(isFieldDetermined({ key: 'value' })).toBe(true);
  });
});

describe('normalizeUndeterminedFields', () => {
  it('should set undetermined fields to null', () => {
    const spec = {
      dpi: undefined,
      background: '',
      format: 'jpg' as const
    };
    const result = normalizeUndeterminedFields(spec as any);
    expect(result.dpi).toBeNull();
    expect(result.background).toBeNull();
    expect(result.format).toBe('jpg');
  });

  it('should normalize dimensions', () => {
    const spec = {
      dimensions: {
        width_mm: 35,
        height_mm: null,
        width_px: null,
        height_px: 720
      }
    };
    const result = normalizeUndeterminedFields(spec as any);
    expect(result.dimensions?.width_mm).toBe(35);
    expect(result.dimensions?.height_mm).toBeNull();
    expect(result.dimensions?.width_px).toBeNull();
    expect(result.dimensions?.height_px).toBe(720);
  });
});
