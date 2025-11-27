/**
 * Unit tests for ImageKitService
 * Requirements: 10.2, 10.3, 10.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ImageKitService } from '../lib/imagekit.service';
import { ImageProcessingSpec } from '../lib/types';

describe('ImageKitService', () => {
  describe('Constructor', () => {
    it('should throw error when credentials are missing', () => {
      // Save original env vars
      const originalPublic = process.env.IMAGEKIT_PUBLIC_KEY;
      const originalPrivate = process.env.IMAGEKIT_PRIVATE_KEY;
      const originalEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

      // Clear env vars
      delete process.env.IMAGEKIT_PUBLIC_KEY;
      delete process.env.IMAGEKIT_PRIVATE_KEY;
      delete process.env.IMAGEKIT_URL_ENDPOINT;

      expect(() => new ImageKitService()).toThrow(
        'ImageKit credentials are required'
      );

      // Restore env vars
      if (originalPublic) process.env.IMAGEKIT_PUBLIC_KEY = originalPublic;
      if (originalPrivate) process.env.IMAGEKIT_PRIVATE_KEY = originalPrivate;
      if (originalEndpoint) process.env.IMAGEKIT_URL_ENDPOINT = originalEndpoint;
    });

    it('should create instance with provided credentials', () => {
      const service = new ImageKitService(
        'test_public_key',
        'test_private_key',
        'https://ik.imagekit.io/test'
      );
      expect(service).toBeInstanceOf(ImageKitService);
    });
  });

  describe('buildTransformations', () => {
    let service: ImageKitService;

    beforeEach(() => {
      service = new ImageKitService(
        'test_public_key',
        'test_private_key',
        'https://ik.imagekit.io/test'
      );
    });

    it('should handle pixel dimensions', () => {
      const spec: ImageProcessingSpec = {
        task_type: 'resize',
        dimensions: {
          width_px: 1280,
          height_px: 720,
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

      const transformations = (service as any).buildTransformations(spec);
      expect(transformations.width).toBe(1280);
      expect(transformations.height).toBe(720);
    });

    it('should convert mm dimensions to pixels when DPI is provided', () => {
      const spec: ImageProcessingSpec = {
        task_type: 'passport_photo',
        dimensions: {
          width_px: null,
          height_px: null,
          width_mm: 35,
          height_mm: 45,
        },
        dpi: 300,
        background: 'white',
        face_requirements: {
          shoulders_visible: true,
          ears_visible: true,
          centered_face: true,
          no_tilt: true,
        },
        max_file_size_mb: null,
        format: 'jpg',
        additional_notes: null,
      };

      const transformations = (service as any).buildTransformations(spec);
      // 35mm / 25.4 * 300 = ~413 pixels
      expect(transformations.width).toBeCloseTo(413, 0);
      // 45mm / 25.4 * 300 = ~531 pixels
      expect(transformations.height).toBeCloseTo(531, 0);
      expect(transformations.dpr).toBeCloseTo(3.125, 2);
    });

    it('should handle format conversion', () => {
      const spec: ImageProcessingSpec = {
        task_type: 'format_change',
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
        format: 'png',
        additional_notes: null,
      };

      const transformations = (service as any).buildTransformations(spec);
      expect(transformations.format).toBe('png');
    });

    it('should normalize jpeg to jpg', () => {
      const spec: ImageProcessingSpec = {
        task_type: 'format_change',
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
        format: 'jpeg',
        additional_notes: null,
      };

      const transformations = (service as any).buildTransformations(spec);
      expect(transformations.format).toBe('jpg');
    });

    it('should handle white background', () => {
      const spec: ImageProcessingSpec = {
        task_type: 'background_change',
        dimensions: {
          width_px: null,
          height_px: null,
          width_mm: null,
          height_mm: null,
        },
        dpi: null,
        background: 'white',
        face_requirements: null,
        max_file_size_mb: null,
        format: null,
        additional_notes: null,
      };

      const transformations = (service as any).buildTransformations(spec);
      expect(transformations.background).toBe('FFFFFF');
    });

    it('should handle blue background', () => {
      const spec: ImageProcessingSpec = {
        task_type: 'background_change',
        dimensions: {
          width_px: null,
          height_px: null,
          width_mm: null,
          height_mm: null,
        },
        dpi: null,
        background: 'blue',
        face_requirements: null,
        max_file_size_mb: null,
        format: null,
        additional_notes: null,
      };

      const transformations = (service as any).buildTransformations(spec);
      expect(transformations.background).toBe('0000FF');
    });

    it('should handle transparent background', () => {
      const spec: ImageProcessingSpec = {
        task_type: 'background_change',
        dimensions: {
          width_px: null,
          height_px: null,
          width_mm: null,
          height_mm: null,
        },
        dpi: null,
        background: 'transparent',
        face_requirements: null,
        max_file_size_mb: null,
        format: null,
        additional_notes: null,
      };

      const transformations = (service as any).buildTransformations(spec);
      expect(transformations.background).toBe('transparent');
    });

    it('should set quality based on max file size', () => {
      const testCases = [
        { maxSize: 0.3, expectedQuality: 60 },
        { maxSize: 0.8, expectedQuality: 75 },
        { maxSize: 1.5, expectedQuality: 85 },
        { maxSize: 3, expectedQuality: 90 },
      ];

      testCases.forEach(({ maxSize, expectedQuality }) => {
        const spec: ImageProcessingSpec = {
          task_type: 'compress',
          dimensions: {
            width_px: null,
            height_px: null,
            width_mm: null,
            height_mm: null,
          },
          dpi: null,
          background: null,
          face_requirements: null,
          max_file_size_mb: maxSize,
          format: null,
          additional_notes: null,
        };

        const transformations = (service as any).buildTransformations(spec);
        expect(transformations.quality).toBe(expectedQuality);
      });
    });

    it('should handle multiple transformations together', () => {
      const spec: ImageProcessingSpec = {
        task_type: 'passport_photo',
        dimensions: {
          width_px: null,
          height_px: null,
          width_mm: 35,
          height_mm: 45,
        },
        dpi: 300,
        background: 'white',
        face_requirements: {
          shoulders_visible: true,
          ears_visible: true,
          centered_face: true,
          no_tilt: true,
        },
        max_file_size_mb: 1,
        format: 'jpg',
        additional_notes: null,
      };

      const transformations = (service as any).buildTransformations(spec);
      expect(transformations.width).toBeDefined();
      expect(transformations.height).toBeDefined();
      expect(transformations.format).toBe('jpg');
      expect(transformations.background).toBe('FFFFFF');
      expect(transformations.quality).toBe(85); // 1MB = 1024KB, which falls in 1024-2048 range = quality 85
      expect(transformations.dpr).toBeDefined();
    });
  });

  describe('buildTransformationString', () => {
    let service: ImageKitService;

    beforeEach(() => {
      service = new ImageKitService(
        'test_public_key',
        'test_private_key',
        'https://ik.imagekit.io/test'
      );
    });

    it('should build transformation string correctly', () => {
      const transformations = {
        width: 1280,
        height: 720,
        quality: 80,
        format: 'jpg',
      };

      const result = (service as any).buildTransformationString(transformations);
      expect(result.w).toBe('1280');
      expect(result.h).toBe('720');
      expect(result.q).toBe('80');
      expect(result.f).toBe('jpg');
    });

    it('should handle empty transformations', () => {
      const transformations = {};
      const result = (service as any).buildTransformationString(transformations);
      expect(Object.keys(result).length).toBe(0);
    });
  });
});
