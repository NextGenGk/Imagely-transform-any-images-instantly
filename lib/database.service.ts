/**
 * DatabaseService - Data persistence service using Prisma
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

import { prisma } from './prisma';
import { ImageProcessingSpec, ProcessingRequest } from './types';

/**
 * Service class for database operations related to processing requests
 */
export class DatabaseService {
  /**
   * Ensure user exists in database, create if not
   * 
   * @param clerkId - The Clerk user ID
   * @param email - The user's email
   * @returns The user's internal database ID
   */
  async ensureUser(clerkId: string, email: string): Promise<string> {
    try {
      // Try to find existing user
      let user = await prisma.user.findUnique({
        where: { clerkId },
      });

      // Create user if doesn't exist
      if (!user) {
        user = await prisma.user.create({
          data: {
            clerkId,
            email,
          },
        });
      } else if (user.email !== email) {
        // Update email if it has changed (e.g. fixing placeholder email)
        user = await prisma.user.update({
          where: { id: user.id },
          data: { email },
        });
      }

      return user.id;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to ensure user exists: ${error.message}`);
      }
      throw new Error('Failed to ensure user exists: Unknown error');
    }
  }

  /**
   * Save a processing request to the database
   * Requirements: 9.1, 9.2
   * 
   * @param userId - The ID of the user making the request
   * @param query - The natural language query
   * @param jsonOutput - The parsed ImageProcessingSpec
   * @param processedImageUrl - Optional URL of the processed image
   * @returns The created ProcessingRequest
   */
  async saveRequest(
    userId: string,
    query: string,
    jsonOutput: ImageProcessingSpec,
    processedImageUrl?: string
  ): Promise<ProcessingRequest> {
    try {
      // Validate inputs
      if (!userId || userId.trim().length === 0) {
        throw new Error('userId is required');
      }
      if (!query || query.trim().length === 0) {
        throw new Error('query is required');
      }
      if (!jsonOutput) {
        throw new Error('jsonOutput is required');
      }

      // Create the processing request
      const request = await prisma.processingRequest.create({
        data: {
          userId,
          query,
          jsonOutput: jsonOutput as any, // Prisma Json type
          processedImageUrl: processedImageUrl || null,
        },
      });

      // Convert to ProcessingRequest interface
      return {
        id: request.id,
        userId: request.userId,
        query: request.query,
        jsonOutput: request.jsonOutput as unknown as ImageProcessingSpec,
        processedImageUrl: request.processedImageUrl || undefined,
        createdAt: request.createdAt,
      };
    } catch (error) {
      // Handle database errors
      if (error instanceof Error) {
        throw new Error(`Failed to save request: ${error.message}`);
      }
      throw new Error('Failed to save request: Unknown error');
    }
  }

  /**
   * Get user's processing history with pagination
   * Requirements: 9.3
   * 
   * @param clerkId - The Clerk ID of the user
   * @param page - Page number (1-indexed)
   * @param limit - Number of items per page
   * @returns Array of ProcessingRequest objects
   */
  async getUserHistory(
    clerkId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ProcessingRequest[]> {
    try {
      // Validate inputs
      if (!clerkId || clerkId.trim().length === 0) {
        throw new Error('clerkId is required');
      }
      if (page < 1) {
        throw new Error('page must be >= 1');
      }
      if (limit < 1 || limit > 100) {
        throw new Error('limit must be between 1 and 100');
      }

      // Find user by Clerk ID
      const user = await prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        return []; // Return empty array if user doesn't exist yet
      }

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;

      // Fetch requests ordered by creation time (newest first)
      const requests = await prisma.processingRequest.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      });

      // Convert to ProcessingRequest interface
      return requests.map(request => ({
        id: request.id,
        userId: request.userId,
        query: request.query,
        jsonOutput: request.jsonOutput as unknown as ImageProcessingSpec,
        processedImageUrl: request.processedImageUrl || undefined,
        createdAt: request.createdAt,
      }));
    } catch (error) {
      // Handle database errors
      if (error instanceof Error) {
        throw new Error(`Failed to get user history: ${error.message}`);
      }
      throw new Error('Failed to get user history: Unknown error');
    }
  }

  /**
   * Get a specific processing request by ID
   * Requirements: 9.4
   * 
   * @param id - The ID of the processing request
   * @returns The ProcessingRequest or null if not found
   */
  async getRequestById(id: string): Promise<ProcessingRequest | null> {
    try {
      // Validate input
      if (!id || id.trim().length === 0) {
        throw new Error('id is required');
      }

      // Fetch the request
      const request = await prisma.processingRequest.findUnique({
        where: {
          id,
        },
      });

      // Return null if not found
      if (!request) {
        return null;
      }

      // Convert to ProcessingRequest interface
      return {
        id: request.id,
        userId: request.userId,
        query: request.query,
        jsonOutput: request.jsonOutput as unknown as ImageProcessingSpec,
        processedImageUrl: request.processedImageUrl || undefined,
        createdAt: request.createdAt,
      };
    } catch (error) {
      // Handle database errors
      if (error instanceof Error) {
        throw new Error(`Failed to get request by ID: ${error.message}`);
      }
      throw new Error('Failed to get request by ID: Unknown error');
    }
  }

  /**
   * Get the total count of requests for a user
   * Useful for pagination metadata
   * 
   * @param clerkId - The Clerk ID of the user
   * @returns Total count of requests
   */
  async getUserRequestCount(clerkId: string): Promise<number> {
    try {
      // Validate input
      if (!clerkId || clerkId.trim().length === 0) {
        throw new Error('clerkId is required');
      }

      // Find user by Clerk ID
      const user = await prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        return 0; // Return 0 if user doesn't exist yet
      }

      // Count requests
      const count = await prisma.processingRequest.count({
        where: {
          userId: user.id,
        },
      });

      return count;
    } catch (error) {
      // Handle database errors
      if (error instanceof Error) {
        throw new Error(`Failed to get user request count: ${error.message}`);
      }
      throw new Error('Failed to get user request count: Unknown error');
    }
  }

  /**
   * Health check - verify database connectivity
   * Requirements: 13.4
   * 
   * @returns Promise that resolves if database is accessible
   */
  async healthCheck(): Promise<void> {
    try {
      // Perform a simple query to verify database connectivity
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Database health check failed: ${error.message}`);
      }
      throw new Error('Database health check failed: Unknown error');
    }
  }

  /**
   * Get user by Clerk ID
   */
  async getUserByClerkId(clerkId: string) {
    return await prisma.user.findUnique({
      where: { clerkId },
      include: { subscription: true },
    });
  }

  /**
   * Get user by internal ID
   */
  async getUserById(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * Update user subscription details
   */
  async updateUserSubscription(
    clerkId: string,
    data: {
      isTrialActive?: boolean;
      trialEndsAt?: Date;
      subscriptionStatus?: string;
      razorpayCustomerId?: string;
      razorpaySubscriptionId?: string;
    }
  ) {
    return await prisma.user.update({
      where: { clerkId },
      data,
    });
  }

  /**
   * Get user subscription
   */
  async getUserSubscription(userId: string) {
    return await prisma.subscription.findUnique({
      where: { userId },
    });
  }

  /**
   * Create or update subscription
   */
  async createOrUpdateSubscription(data: {
    userId: string;
    planId: string;
    status: string;
    razorpaySubscriptionId: string;
    razorpayPlanId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  }) {
    return await prisma.subscription.upsert({
      where: { userId: data.userId },
      update: {
        planId: data.planId,
        status: data.status,
        razorpaySubscriptionId: data.razorpaySubscriptionId,
        razorpayPlanId: data.razorpayPlanId,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
      },
      create: data,
    });
  }

  /**
   * Get subscription by Razorpay ID
   */
  async getSubscriptionByRazorpayId(razorpaySubscriptionId: string) {
    return await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId },
    });
  }

  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(
    subscriptionId: string,
    status: string,
    cancelAtPeriodEnd: boolean
  ) {
    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status,
        cancelAtPeriodEnd,
      },
    });
  }

  /**
   * Update subscription period
   */
  async updateSubscriptionPeriod(
    subscriptionId: string,
    currentPeriodStart: Date,
    currentPeriodEnd: Date
  ) {
    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        currentPeriodStart,
        currentPeriodEnd,
      },
    });
  }
}
