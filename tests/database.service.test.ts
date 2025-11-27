/**
 * Unit tests for DatabaseService
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DatabaseService } from '../lib/database.service';
import { prisma } from '../lib/prisma';
import { ImageProcessingSpec } from '../lib/types';

// Mock Prisma client
vi.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    processingRequest: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('DatabaseService', () => {
  let service: DatabaseService;
  
  beforeEach(() => {
    service = new DatabaseService();
    vi.clearAllMocks();
  });

  describe('saveRequest', () => {
    it('should save a request successfully', async () => {
      const mockSpec: ImageProcessingSpec = {
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

      const mockRequest = {
        id: 'test-id',
        userId: 'user-123',
        query: 'passport photo',
        jsonOutput: mockSpec as any,
        processedImageUrl: null,
        createdAt: new Date(),
      };

      vi.mocked(prisma.processingRequest.create).mockResolvedValue(mockRequest as any);

      const result = await service.saveRequest('user-123', 'passport photo', mockSpec);

      expect(result.id).toBe('test-id');
      expect(result.userId).toBe('user-123');
      expect(result.query).toBe('passport photo');
      expect(result.jsonOutput).toEqual(mockSpec);
      expect(prisma.processingRequest.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          query: 'passport photo',
          jsonOutput: mockSpec,
          processedImageUrl: null,
        },
      });
    });

    it('should save a request with processed image URL', async () => {
      const mockSpec: ImageProcessingSpec = {
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
      };

      const mockRequest = {
        id: 'test-id-2',
        userId: 'user-456',
        query: 'resize to 1280x720',
        jsonOutput: mockSpec as any,
        processedImageUrl: 'https://example.com/image.jpg',
        createdAt: new Date(),
      };

      vi.mocked(prisma.processingRequest.create).mockResolvedValue(mockRequest as any);

      const result = await service.saveRequest(
        'user-456',
        'resize to 1280x720',
        mockSpec,
        'https://example.com/image.jpg'
      );

      expect(result.processedImageUrl).toBe('https://example.com/image.jpg');
    });

    it('should throw error for empty userId', async () => {
      const mockSpec: ImageProcessingSpec = {
        task_type: 'custom',
        dimensions: { width_mm: null, height_mm: null, width_px: null, height_px: null },
        dpi: null,
        background: null,
        face_requirements: null,
        max_file_size_mb: null,
        format: null,
        additional_notes: null,
      };

      await expect(service.saveRequest('', 'test query', mockSpec)).rejects.toThrow(
        'userId is required'
      );
    });

    it('should throw error for empty query', async () => {
      const mockSpec: ImageProcessingSpec = {
        task_type: 'custom',
        dimensions: { width_mm: null, height_mm: null, width_px: null, height_px: null },
        dpi: null,
        background: null,
        face_requirements: null,
        max_file_size_mb: null,
        format: null,
        additional_notes: null,
      };

      await expect(service.saveRequest('user-123', '', mockSpec)).rejects.toThrow(
        'query is required'
      );
    });
  });

  describe('getUserHistory', () => {
    it('should retrieve user history with pagination', async () => {
      const mockUser = {
        id: 'db-user-123',
        clerkId: 'clerk-user-123',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRequests = [
        {
          id: 'req-1',
          userId: 'db-user-123',
          query: 'passport photo',
          jsonOutput: { task_type: 'passport_photo' } as any,
          processedImageUrl: null,
          createdAt: new Date('2024-01-02'),
        },
        {
          id: 'req-2',
          userId: 'db-user-123',
          query: 'resize image',
          jsonOutput: { task_type: 'resize' } as any,
          processedImageUrl: null,
          createdAt: new Date('2024-01-01'),
        },
      ];

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.processingRequest.findMany).mockResolvedValue(mockRequests);

      const result = await service.getUserHistory('clerk-user-123', 1, 10);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('req-1');
    });

    it('should handle pagination correctly', async () => {
      const mockUser = {
        id: 'db-user-123',
        clerkId: 'clerk-user-123',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.processingRequest.findMany).mockResolvedValue([]);

      await service.getUserHistory('clerk-user-123', 2, 5);

      expect(prisma.user.findUnique).toHaveBeenCalled();
      expect(prisma.processingRequest.findMany).toHaveBeenCalled();
    });

    it('should throw error for empty userId', async () => {
      await expect(service.getUserHistory('', 1, 10)).rejects.toThrow('clerkId is required');
    });

    it('should throw error for invalid page number', async () => {
      await expect(service.getUserHistory('user-123', 0, 10)).rejects.toThrow(
        'page must be >= 1'
      );
    });

    it('should throw error for invalid limit', async () => {
      await expect(service.getUserHistory('user-123', 1, 0)).rejects.toThrow(
        'limit must be between 1 and 100'
      );
      await expect(service.getUserHistory('user-123', 1, 101)).rejects.toThrow(
        'limit must be between 1 and 100'
      );
    });
  });

  describe('getRequestById', () => {
    it('should retrieve a request by ID', async () => {
      const mockRequest = {
        id: 'req-123',
        userId: 'user-456',
        query: 'compress image',
        jsonOutput: { task_type: 'compress' } as any,
        processedImageUrl: 'https://example.com/image.jpg',
        createdAt: new Date(),
      };

      vi.mocked(prisma.processingRequest.findUnique).mockResolvedValue(mockRequest);

      const result = await service.getRequestById('req-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('req-123');
      expect(result?.userId).toBe('user-456');
      expect(prisma.processingRequest.findUnique).toHaveBeenCalledWith({
        where: { id: 'req-123' },
      });
    });

    it('should return null for non-existent request', async () => {
      vi.mocked(prisma.processingRequest.findUnique).mockResolvedValue(null);

      const result = await service.getRequestById('non-existent');

      expect(result).toBeNull();
    });

    it('should throw error for empty ID', async () => {
      await expect(service.getRequestById('')).rejects.toThrow('id is required');
    });
  });

  describe('getUserRequestCount', () => {
    it('should return the count of user requests', async () => {
      const mockUser = {
        id: 'db-user-123',
        clerkId: 'clerk-user-123',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.processingRequest.count).mockResolvedValue(42);

      const result = await service.getUserRequestCount('clerk-user-123');

      expect(result).toBe(42);
      expect(prisma.user.findUnique).toHaveBeenCalled();
    });

    it('should throw error for empty userId', async () => {
      await expect(service.getUserRequestCount('')).rejects.toThrow('clerkId is required');
    });
  });
});
