/**
 * Unit tests for core TypeScript interfaces and types
 * Requirements: 1.1, 7.2
 */

import { describe, it, expect } from 'vitest';
import type {
  TaskType,
  Background,
  ImageFormat,
  Dimensions,
  FaceRequirements,
  ImageProcessingSpec,
  ProcessingRequest,
  ParseQueryRequest,
  ParseQueryResponse,
  ProcessImageRequest,
  ProcessImageResponse,
  HistoryRequest,
  HistoryResponse,
  ErrorResponse,
  TransformationParams,
} from '../lib/types';

describe('Core TypeScript Types', () => {
  describe('TaskType', () => {
    it('should accept valid task types', () => {
      const validTypes: TaskType[] = [
        'passport_photo',
        'resize',
        'compress',
        'background_change',
        'enhance',
        'format_change',
        'custom',
      ];
      
      expect(validTypes).toHaveLength(7);
    });
  });

  describe('Background', () => {
    it('should accept valid background values', () => {
      const validBackgrounds: Background[] = [
        'white',
        'blue',
        'transparent',
        'original',
      ];
      
      expect(validBackgrounds).toHaveLength(4);
    });
  });

  describe('ImageFormat', () => {
    it('should accept valid image formats', () => {
      const validFormats: ImageFormat[] = ['jpg', 'jpeg', 'png', 'webp'];
      
      expect(validFormats).toHaveLength(4);
    });
  });

  describe('Dimensions', () => {
    it('should create valid dimensions object', () => {
      const dimensions: Dimensions = {
        width_mm: 35,
        height_mm: 45,
        width_px: null,
        height_px: null,
      };
      
      expect(dimensions.width_mm).toBe(35);
      expect(dimensions.height_mm).toBe(45);
      expect(dimensions.width_px).toBeNull();
      expect(dimensions.height_px).toBeNull();
    });

    it('should allow all null values', () => {
      const dimensions: Dimensions = {
        width_mm: null,
        height_mm: null,
        width_px: null,
        height_px: null,
      };
      
      expect(dimensions.width_mm).toBeNull();
    });
  });

  describe('FaceRequirements', () => {
    it('should create valid face requirements object', () => {
      const faceReqs: FaceRequirements = {
        shoulders_visible: true,
        ears_visible: true,
        centered_face: true,
        no_tilt: true,
      };
      
      expect(faceReqs.shoulders_visible).toBe(true);
      expect(faceReqs.ears_visible).toBe(true);
      expect(faceReqs.centered_face).toBe(true);
      expect(faceReqs.no_tilt).toBe(true);
    });

    it('should allow null values', () => {
      const faceReqs: FaceRequirements = {
        shoulders_visible: null,
        ears_visible: null,
        centered_face: null,
        no_tilt: null,
      };
      
      expect(faceReqs.shoulders_visible).toBeNull();
    });
  });

  describe('ImageProcessingSpec', () => {
    it('should create valid complete specification', () => {
      const spec: ImageProcessingSpec = {
        task_type: 'passport_photo',
        dimensions: {
          width_mm: 35,
          height_mm: 45,
          width_px: null,
          height_px: null,
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
      
      expect(spec.task_type).toBe('passport_photo');
      expect(spec.dimensions.width_mm).toBe(35);
      expect(spec.dpi).toBe(300);
      expect(spec.background).toBe('white');
      expect(spec.format).toBe('jpg');
    });

    it('should allow null values for optional fields', () => {
      const spec: ImageProcessingSpec = {
        task_type: 'custom',
        dimensions: {
          width_mm: null,
          height_mm: null,
          width_px: null,
          height_px: null,
        },
        dpi: null,
        background: null,
        face_requirements: null,
        max_file_size_mb: null,
        format: null,
        additional_notes: null,
      };
      
      expect(spec.task_type).toBe('custom');
      expect(spec.dpi).toBeNull();
      expect(spec.background).toBeNull();
    });
  });

  describe('ProcessingRequest', () => {
    it('should create valid processing request', () => {
      const request: ProcessingRequest = {
        id: 'test-id',
        userId: 'user-123',
        query: 'convert to passport photo',
        jsonOutput: {
          task_type: 'passport_photo',
          dimensions: {
            width_mm: 35,
            height_mm: 45,
            width_px: null,
            height_px: null,
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
        },
        processedImageUrl: 'https://example.com/image.jpg',
        createdAt: new Date(),
      };
      
      expect(request.id).toBe('test-id');
      expect(request.userId).toBe('user-123');
      expect(request.query).toBe('convert to passport photo');
    });
  });

  describe('API Request/Response Interfaces', () => {
    it('should create valid ParseQueryRequest', () => {
      const request: ParseQueryRequest = {
        query: 'resize to 1280x720',
        userId: 'user-123',
      };
      
      expect(request.query).toBe('resize to 1280x720');
      expect(request.userId).toBe('user-123');
    });

    it('should create valid ParseQueryResponse with success', () => {
      const response: ParseQueryResponse = {
        success: true,
        data: {
          task_type: 'resize',
          dimensions: {
            width_mm: null,
            height_mm: null,
            width_px: 1280,
            height_px: 720,
          },
          dpi: null,
          background: null,
          face_requirements: null,
          max_file_size_mb: null,
          format: null,
          additional_notes: null,
        },
      };
      
      expect(response.success).toBe(true);
      expect(response.data?.task_type).toBe('resize');
    });

    it('should create valid ParseQueryResponse with error', () => {
      const response: ParseQueryResponse = {
        success: false,
        error: 'Invalid query',
      };
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid query');
    });

    it('should create valid HistoryRequest', () => {
      const request: HistoryRequest = {
        userId: 'user-123',
        page: 1,
        limit: 10,
      };
      
      expect(request.userId).toBe('user-123');
      expect(request.page).toBe(1);
      expect(request.limit).toBe(10);
    });

    it('should create valid HistoryResponse', () => {
      const response: HistoryResponse = {
        success: true,
        data: [],
        total: 0,
      };
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual([]);
      expect(response.total).toBe(0);
    });
  });

  describe('ErrorResponse', () => {
    it('should create valid error response', () => {
      const error: ErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input provided',
          details: {
            field: 'query',
            reason: 'Query cannot be empty',
          },
        },
      };
      
      expect(error.success).toBe(false);
      expect(error.error.code).toBe('VALIDATION_ERROR');
      expect(error.error.message).toBe('Invalid input provided');
      expect(error.error.details?.field).toBe('query');
    });
  });

  describe('TransformationParams', () => {
    it('should create valid transformation parameters', () => {
      const params: TransformationParams = {
        width: 1280,
        height: 720,
        dpr: 2,
        quality: 80,
        format: 'jpg',
        background: 'white',
      };
      
      expect(params.width).toBe(1280);
      expect(params.height).toBe(720);
      expect(params.quality).toBe(80);
    });

    it('should allow additional custom properties', () => {
      const params: TransformationParams = {
        customProp: 'value',
        anotherProp: 123,
      };
      
      expect(params.customProp).toBe('value');
      expect(params.anotherProp).toBe(123);
    });
  });
});
