/**
 * Tests for GeminiService
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GeminiService } from '../lib/gemini.service';

describe('GeminiService', () => {
  describe('Constructor', () => {
    it('should throw error when API key is not provided', () => {
      // Temporarily remove the env var
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      expect(() => new GeminiService()).toThrow('GEMINI_API_KEY is required');

      // Restore the env var
      if (originalKey) {
        process.env.GEMINI_API_KEY = originalKey;
      }
    });

    it('should accept API key as constructor parameter', () => {
      expect(() => new GeminiService('test-api-key')).not.toThrow();
    });

    it('should use environment variable when no API key provided', () => {
      process.env.GEMINI_API_KEY = 'env-api-key';
      expect(() => new GeminiService()).not.toThrow();
    });
  });

  describe('parseQuery', () => {
    let service: GeminiService;

    beforeEach(() => {
      service = new GeminiService('test-api-key');
    });

    it('should throw error for empty query', async () => {
      await expect(service.parseQuery('')).rejects.toThrow('Query cannot be empty');
    });

    it('should throw error for whitespace-only query', async () => {
      await expect(service.parseQuery('   ')).rejects.toThrow('Query cannot be empty');
    });
  });

  describe('Response validation', () => {
    let service: GeminiService;

    beforeEach(() => {
      service = new GeminiService('test-api-key');
    });

    it('should validate that response has all required fields', () => {
      const validResponse = {
        task_type: 'resize',
        dimensions: {
          width_mm: null,
          height_mm: null,
          width_px: 1280,
          height_px: 720
        },
        dpi: null,
        background: null,
        face_requirements: null,
        max_file_size_mb: null,
        format: null,
        additional_notes: null
      };

      // Access private method through type assertion for testing
      const validateResponse = (service as any).validateResponse.bind(service);
      expect(() => validateResponse(JSON.stringify(validResponse))).not.toThrow();
    });

    it('should handle markdown code blocks in response', () => {
      const responseWithMarkdown = '```json\n{"task_type":"resize","dimensions":{"width_mm":null,"height_mm":null,"width_px":1280,"height_px":720},"dpi":null,"background":null,"face_requirements":null,"max_file_size_mb":null,"format":null,"additional_notes":null}\n```';
      
      const validateResponse = (service as any).validateResponse.bind(service);
      const result = validateResponse(responseWithMarkdown);
      
      expect(result.task_type).toBe('resize');
      expect(result.dimensions.width_px).toBe(1280);
    });

    it('should throw error for missing required fields', () => {
      const invalidResponse = {
        task_type: 'resize',
        dimensions: {
          width_mm: null,
          height_mm: null,
          width_px: 1280,
          height_px: 720
        }
        // Missing other required fields
      };

      const validateResponse = (service as any).validateResponse.bind(service);
      expect(() => validateResponse(JSON.stringify(invalidResponse))).toThrow('Missing required field');
    });

    it('should throw error for invalid task_type', () => {
      const invalidResponse = {
        task_type: 'invalid_type',
        dimensions: {
          width_mm: null,
          height_mm: null,
          width_px: 1280,
          height_px: 720
        },
        dpi: null,
        background: null,
        face_requirements: null,
        max_file_size_mb: null,
        format: null,
        additional_notes: null
      };

      const validateResponse = (service as any).validateResponse.bind(service);
      expect(() => validateResponse(JSON.stringify(invalidResponse))).toThrow('Invalid task_type');
    });
  });

  describe('Prompt building', () => {
    let service: GeminiService;

    beforeEach(() => {
      service = new GeminiService('test-api-key');
    });

    it('should include the query in the prompt', () => {
      const query = 'resize to 1280x720';
      const buildPrompt = (service as any).buildPrompt.bind(service);
      const prompt = buildPrompt(query);

      expect(prompt).toContain(query);
    });

    it('should include parsing rules in the prompt', () => {
      const buildPrompt = (service as any).buildPrompt.bind(service);
      const prompt = buildPrompt('test query');

      expect(prompt).toContain('PARSING RULES');
      expect(prompt).toContain('JSON SCHEMA');
      expect(prompt).toContain('task_type');
      expect(prompt).toContain('dimensions');
    });

    it('should include examples in the prompt', () => {
      const buildPrompt = (service as any).buildPrompt.bind(service);
      const prompt = buildPrompt('test query');

      expect(prompt).toContain('EXAMPLES');
      expect(prompt).toContain('passport photo');
      expect(prompt).toContain('resize');
    });
  });
});
