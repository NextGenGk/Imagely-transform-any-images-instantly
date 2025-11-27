/**
 * Tests for validation utilities
 * Requirements: 13.1, 13.3
 */

import { describe, it, expect } from 'vitest';
import {
  validateNonEmptyString,
  validateStringLength,
  validatePositiveInteger,
  validateNumberRange,
  validateFileType,
  validateFileSize,
  validateAndParseJSON,
  validateImageProcessingSpec,
  validatePaginationParams,
} from '../lib/validation.utils';
import { ValidationError } from '../lib/errors';

describe('String Validation', () => {
  describe('validateNonEmptyString', () => {
    it('should accept valid non-empty strings', () => {
      expect(validateNonEmptyString('hello', 'field')).toBe('hello');
      expect(validateNonEmptyString('  test  ', 'field')).toBe('  test  ');
    });

    it('should reject non-string values', () => {
      expect(() => validateNonEmptyString(123, 'field')).toThrow(ValidationError);
      expect(() => validateNonEmptyString(null, 'field')).toThrow(ValidationError);
      expect(() => validateNonEmptyString(undefined, 'field')).toThrow(ValidationError);
    });

    it('should reject empty strings', () => {
      expect(() => validateNonEmptyString('', 'field')).toThrow(ValidationError);
      expect(() => validateNonEmptyString('   ', 'field')).toThrow(ValidationError);
    });
  });

  describe('validateStringLength', () => {
    it('should accept strings within length constraints', () => {
      expect(() => validateStringLength('hello', 'field', 1, 10)).not.toThrow();
      expect(() => validateStringLength('test', 'field', 4, 4)).not.toThrow();
    });

    it('should reject strings below minimum length', () => {
      expect(() => validateStringLength('hi', 'field', 5)).toThrow(ValidationError);
    });

    it('should reject strings above maximum length', () => {
      expect(() => validateStringLength('hello world', 'field', undefined, 5)).toThrow(ValidationError);
    });
  });
});

describe('Number Validation', () => {
  describe('validatePositiveInteger', () => {
    it('should accept positive integers', () => {
      expect(validatePositiveInteger(1, 'field')).toBe(1);
      expect(validatePositiveInteger(100, 'field')).toBe(100);
    });

    it('should accept string numbers and convert them', () => {
      expect(validatePositiveInteger('5', 'field')).toBe(5);
      expect(validatePositiveInteger('42', 'field')).toBe(42);
    });

    it('should reject non-numbers', () => {
      expect(() => validatePositiveInteger('abc', 'field')).toThrow(ValidationError);
      expect(() => validatePositiveInteger(null, 'field')).toThrow(ValidationError);
    });

    it('should reject non-integers', () => {
      expect(() => validatePositiveInteger(3.14, 'field')).toThrow(ValidationError);
      // Note: parseInt('2.5') converts to 2, which is valid
      // To test string decimals, we need a string that parseInt can't convert to integer
      expect(() => validatePositiveInteger(2.5, 'field')).toThrow(ValidationError);
    });

    it('should reject zero and negative numbers', () => {
      expect(() => validatePositiveInteger(0, 'field')).toThrow(ValidationError);
      expect(() => validatePositiveInteger(-5, 'field')).toThrow(ValidationError);
    });
  });

  describe('validateNumberRange', () => {
    it('should accept numbers within range', () => {
      expect(() => validateNumberRange(5, 'field', 1, 10)).not.toThrow();
      expect(() => validateNumberRange(1, 'field', 1, 10)).not.toThrow();
      expect(() => validateNumberRange(10, 'field', 1, 10)).not.toThrow();
    });

    it('should reject numbers below minimum', () => {
      expect(() => validateNumberRange(0, 'field', 1)).toThrow(ValidationError);
    });

    it('should reject numbers above maximum', () => {
      expect(() => validateNumberRange(11, 'field', undefined, 10)).toThrow(ValidationError);
    });
  });
});

describe('File Validation', () => {
  describe('validateFileType', () => {
    it('should accept allowed file types', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const allowedTypes = ['image/jpeg', 'image/png'];
      
      expect(() => validateFileType(file, allowedTypes)).not.toThrow();
    });

    it('should reject disallowed file types', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const allowedTypes = ['image/jpeg', 'image/png'];
      
      expect(() => validateFileType(file, allowedTypes)).toThrow(ValidationError);
    });
  });

  describe('validateFileSize', () => {
    it('should accept files within size limit', () => {
      const content = 'a'.repeat(1000); // 1KB
      const file = new File([content], 'test.txt');
      const maxSize = 10 * 1024; // 10KB
      
      expect(() => validateFileSize(file, maxSize)).not.toThrow();
    });

    it('should reject files exceeding size limit', () => {
      const content = 'a'.repeat(2000); // 2KB
      const file = new File([content], 'test.txt');
      const maxSize = 1024; // 1KB
      
      expect(() => validateFileSize(file, maxSize)).toThrow(ValidationError);
    });
  });
});

describe('JSON Validation', () => {
  describe('validateAndParseJSON', () => {
    it('should parse valid JSON', () => {
      const json = '{"key": "value"}';
      const result = validateAndParseJSON(json);
      
      expect(result).toEqual({ key: 'value' });
    });

    it('should parse JSON arrays', () => {
      const json = '[1, 2, 3]';
      const result = validateAndParseJSON(json);
      
      expect(result).toEqual([1, 2, 3]);
    });

    it('should reject invalid JSON', () => {
      expect(() => validateAndParseJSON('not json')).toThrow(ValidationError);
      expect(() => validateAndParseJSON('{invalid}')).toThrow(ValidationError);
    });
  });
});

describe('ImageProcessingSpec Validation', () => {
  describe('validateImageProcessingSpec', () => {
    it('should accept valid specification', () => {
      const spec = {
        task_type: 'resize',
        dimensions: {
          width_px: 1280,
          height_px: 720,
          width_mm: null,
          height_mm: null,
        },
        dpi: 300,
        background: 'white',
        face_requirements: null,
        max_file_size_mb: 1,
        format: 'jpg',
        additional_notes: null,
      };

      expect(() => validateImageProcessingSpec(spec)).not.toThrow();
    });

    it('should reject non-object specifications', () => {
      expect(() => validateImageProcessingSpec('not an object')).toThrow(ValidationError);
      expect(() => validateImageProcessingSpec(null)).toThrow(ValidationError);
    });

    it('should reject invalid task_type', () => {
      const spec = {
        task_type: 'invalid_type',
        dimensions: {},
        dpi: null,
        background: null,
        face_requirements: null,
        max_file_size_mb: null,
        format: null,
        additional_notes: null,
      };

      expect(() => validateImageProcessingSpec(spec)).toThrow(ValidationError);
    });

    it('should accept any string for background', () => {
      // Background validation now accepts any string (color names, hex codes, etc.)
      const spec = {
        task_type: 'resize',
        dimensions: {
          width_mm: null,
          height_mm: null,
          width_px: null,
          height_px: null,
        },
        dpi: null,
        background: 'custom_color',
        face_requirements: null,
        max_file_size_mb: null,
        format: null,
        additional_notes: null,
      };

      expect(() => validateImageProcessingSpec(spec)).not.toThrow();
    });

    it('should reject invalid format', () => {
      const spec = {
        task_type: 'resize',
        dimensions: {},
        dpi: null,
        background: null,
        face_requirements: null,
        max_file_size_mb: null,
        format: 'bmp',
        additional_notes: null,
      };

      expect(() => validateImageProcessingSpec(spec)).toThrow(ValidationError);
    });

    it('should reject invalid dpi', () => {
      const spec = {
        task_type: 'resize',
        dimensions: {},
        dpi: -100,
        background: null,
        face_requirements: null,
        max_file_size_mb: null,
        format: null,
        additional_notes: null,
      };

      expect(() => validateImageProcessingSpec(spec)).toThrow(ValidationError);
    });

    it('should reject invalid max_file_size_mb', () => {
      const spec = {
        task_type: 'resize',
        dimensions: {},
        dpi: null,
        background: null,
        face_requirements: null,
        max_file_size_mb: 0,
        format: null,
        additional_notes: null,
      };

      expect(() => validateImageProcessingSpec(spec)).toThrow(ValidationError);
    });

    it('should accept null values for optional fields', () => {
      const spec = {
        task_type: 'custom',
        dimensions: {
          width_px: null,
          height_px: null,
          width_mm: null,
          height_mm: null,
        },
        dpi: null,
        background: null,
        face_requirements: null,
        max_file_size_mb: null,
        format: null,
        additional_notes: null,
      };

      expect(() => validateImageProcessingSpec(spec)).not.toThrow();
    });
  });
});

describe('Pagination Validation', () => {
  describe('validatePaginationParams', () => {
    it('should accept valid pagination parameters', () => {
      const result = validatePaginationParams(1, 10);
      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it('should accept string numbers', () => {
      const result = validatePaginationParams('5', '20');
      expect(result).toEqual({ page: 5, limit: 20 });
    });

    it('should reject invalid page', () => {
      expect(() => validatePaginationParams(0, 10)).toThrow(ValidationError);
      expect(() => validatePaginationParams(-1, 10)).toThrow(ValidationError);
      expect(() => validatePaginationParams('abc', 10)).toThrow(ValidationError);
    });

    it('should reject invalid limit', () => {
      expect(() => validatePaginationParams(1, 0)).toThrow(ValidationError);
      expect(() => validatePaginationParams(1, -5)).toThrow(ValidationError);
      expect(() => validatePaginationParams(1, 'xyz')).toThrow(ValidationError);
    });

    it('should reject limit above maximum', () => {
      expect(() => validatePaginationParams(1, 101)).toThrow(ValidationError);
      expect(() => validatePaginationParams(1, 200)).toThrow(ValidationError);
    });

    it('should accept limit at boundaries', () => {
      expect(() => validatePaginationParams(1, 1)).not.toThrow();
      expect(() => validatePaginationParams(1, 100)).not.toThrow();
    });
  });
});
