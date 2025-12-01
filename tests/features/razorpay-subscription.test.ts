/**
 * Comprehensive Razorpay Subscription Tests
 * Tests subscription lifecycle, credit management, renewals, and plan transitions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the services before importing them
vi.mock('@/lib/database.service');
vi.mock('@/lib/razorpay.service');

import { SubscriptionService } from '@/lib/subscription.service';
import { RazorpayService } from '@/lib/razorpay.service';
import { DatabaseService } from '@/lib/database.service';

describe('Razorpay Subscription Management', () => {
  let subscriptionService: SubscriptionService;
  let mockDatabaseService: any;
  let mockRazorpayService: any;

  const mockUser = {
    id: 'test-user-id',
    clerkId: 'clerk_test_user',
    email: 'test@example.com',
    credits: 10,
    monthlyCreditLimit: 10,
    subscriptionStatus: 'inactive',
    razorpayCustomerId: null,
    razorpaySubscriptionId: null,
    creditsResetAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Create mock instances
    mockDatabaseService = {
      getUserByClerkId: vi.fn(),
      getUserById: vi.fn(),
      updateUserSubscription: vi.fn(),
      createOrUpdateSubscription: vi.fn(),
      updateUserCredits: vi.fn(),
      getPlanBySlug: vi.fn(),
      getUserSubscription: vi.fn(),
      getSubscriptionByRazorpayId: vi.fn(),
      updateSubscriptionStatus: vi.fn(),
      updateSubscriptionPeriod: vi.fn(),
    };

    mockRazorpayService = {
      createCustomer: vi.fn(),
      createSubscription: vi.fn(),
      getSubscription: vi.fn(),
      cancelSubscription: vi.fn(),
      verifyPaymentSignature: vi.fn(),
    };

    // Mock the constructors to return our mocks
    vi.mocked(DatabaseService).mockImplementation(() => mockDatabaseService);
    vi.mocked(RazorpayService).mockImplementation(() => mockRazorpayService);

    subscriptionService = new SubscriptionService();
  });

  describe('Subscription Creation', () => {
    it('should create a Razorpay customer for new user', async () => {
      const mockCustomer = {
        id: 'cust_test123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockDatabaseService.getUserByClerkId.mockResolvedValue(mockUser);
      mockRazorpayService.createCustomer.mockResolvedValue(mockCustomer);
      mockDatabaseService.updateUserSubscription.mockResolvedValue({});
      mockRazorpayService.createSubscription.mockResolvedValue({
        id: 'sub_test123',
        plan_id: 'plan_test',
      });

      const result = await subscriptionService.createSubscription(
        'clerk_test_user',
        'test@example.com',
        'Test User',
        'pro'
      );

      expect(result.subscriptionId).toBe('sub_test123');
      expect(mockRazorpayService.createCustomer).toHaveBeenCalledWith(
        'test@example.com',
        'Test User',
        'clerk_test_user'
      );
    });

    it('should reuse existing Razorpay customer', async () => {
      const userWithCustomer = {
        ...mockUser,
        razorpayCustomerId: 'cust_existing123',
      };

      mockDatabaseService.getUserByClerkId.mockResolvedValue(userWithCustomer);
      mockRazorpayService.createSubscription.mockResolvedValue({
        id: 'sub_test123',
        plan_id: 'plan_test',
      });

      await subscriptionService.createSubscription(
        'clerk_test_user',
        'test@example.com',
        'Test User',
        'pro'
      );

      expect(mockRazorpayService.createCustomer).not.toHaveBeenCalled();
    });

    it('should throw error for basic plan subscription creation', async () => {
      mockDatabaseService.getUserByClerkId.mockResolvedValue(mockUser);

      await expect(
        subscriptionService.createSubscription(
          'clerk_test_user',
          'test@example.com',
          'Test User',
          'basic'
        )
      ).rejects.toThrow('Basic plan does not require a Razorpay subscription');
    });
  });

  describe('Subscription Activation', () => {
    it('should activate pro subscription and set credits', async () => {
      const mockRazorpaySubscription = {
        id: 'sub_test123',
        plan_id: 'plan_pro',
        current_start: Math.floor(Date.now() / 1000),
        current_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        status: 'active',
      };

      const mockPlan = {
        id: 'plan-id',
        slug: 'pro',
        features: [
          {
            feature: { key: 'monthly_requests' },
            value: '500',
          },
        ],
      };

      mockDatabaseService.getUserByClerkId.mockResolvedValue(mockUser);
      mockRazorpayService.getSubscription.mockResolvedValue(mockRazorpaySubscription);
      mockDatabaseService.createOrUpdateSubscription.mockResolvedValue({});
      mockDatabaseService.updateUserSubscription.mockResolvedValue({});
      mockDatabaseService.getPlanBySlug.mockResolvedValue(mockPlan);
      mockDatabaseService.updateUserCredits.mockResolvedValue({});

      await subscriptionService.activateSubscription(
        'clerk_test_user',
        'sub_test123',
        'pro'
      );

      expect(mockDatabaseService.updateUserCredits).toHaveBeenCalledWith(
        mockUser.id,
        500,
        500,
        expect.any(Date)
      );
      expect(mockDatabaseService.updateUserSubscription).toHaveBeenCalledWith(
        'clerk_test_user',
        {
          subscriptionStatus: 'active',
          razorpaySubscriptionId: 'sub_test123',
        }
      );
    });

    it('should activate free subscription without Razorpay', async () => {
      const mockPlan = {
        id: 'plan-id',
        slug: 'basic',
        features: [
          {
            feature: { key: 'monthly_requests' },
            value: '10',
          },
        ],
      };

      mockDatabaseService.getUserById.mockResolvedValue(mockUser);
      mockDatabaseService.createOrUpdateSubscription.mockResolvedValue({});
      mockDatabaseService.updateUserSubscription.mockResolvedValue({});
      mockDatabaseService.getPlanBySlug.mockResolvedValue(mockPlan);
      mockDatabaseService.updateUserCredits.mockResolvedValue({});

      await subscriptionService.activateFreeSubscription(mockUser.id);

      expect(mockDatabaseService.updateUserCredits).toHaveBeenCalledWith(
        mockUser.id,
        10,
        10,
        expect.any(Date)
      );
    });
  });

  describe('Credit Management', () => {
    it('should initialize credits for new user', async () => {
      const userWithoutCredits = {
        ...mockUser,
        credits: 0,
        monthlyCreditLimit: 0,
        creditsResetAt: null,
      };

      const mockPlan = {
        id: 'plan-id',
        slug: 'basic',
        features: [
          {
            feature: { key: 'monthly_requests' },
            value: '10',
          },
        ],
      };

      mockDatabaseService.getUserById.mockResolvedValue(userWithoutCredits);
      mockDatabaseService.getPlanBySlug.mockResolvedValue(mockPlan);
      mockDatabaseService.updateUserCredits.mockResolvedValue({});

      const result = await subscriptionService.syncCredits(userWithoutCredits.id, 'basic');

      expect(result.credits).toBe(10);
      expect(result.monthlyCreditLimit).toBe(10);
      expect(mockDatabaseService.updateUserCredits).toHaveBeenCalled();
    });

    it('should reset credits when reset date has passed', async () => {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1);

      const userWithExpiredCredits = {
        ...mockUser,
        credits: 2,
        monthlyCreditLimit: 10,
        creditsResetAt: pastDate,
      };

      const mockPlan = {
        id: 'plan-id',
        slug: 'basic',
        features: [
          {
            feature: { key: 'monthly_requests' },
            value: '10',
          },
        ],
      };

      mockDatabaseService.getUserById.mockResolvedValue(userWithExpiredCredits);
      mockDatabaseService.getPlanBySlug.mockResolvedValue(mockPlan);
      mockDatabaseService.updateUserCredits.mockResolvedValue({});

      const result = await subscriptionService.syncCredits(userWithExpiredCredits.id, 'basic');

      expect(result.credits).toBe(10);
      expect(mockDatabaseService.updateUserCredits).toHaveBeenCalledWith(
        userWithExpiredCredits.id,
        10,
        10,
        expect.any(Date)
      );
    });

    it('should not reset credits before reset date', async () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);

      const userWithValidCredits = {
        ...mockUser,
        credits: 5,
        monthlyCreditLimit: 10,
        creditsResetAt: futureDate,
      };

      mockDatabaseService.getUserById.mockResolvedValue(userWithValidCredits);

      const result = await subscriptionService.syncCredits(userWithValidCredits.id);

      expect(result.credits).toBe(5);
      expect(mockDatabaseService.updateUserCredits).not.toHaveBeenCalled();
    });

    it('should handle unlimited credits for pro plan', async () => {
      const mockPlan = {
        id: 'plan-id',
        slug: 'pro',
        features: [
          {
            feature: { key: 'monthly_requests' },
            value: 'unlimited',
          },
        ],
      };

      const userWithoutCredits = {
        ...mockUser,
        credits: 0,
        monthlyCreditLimit: 0,
        creditsResetAt: null,
      };

      mockDatabaseService.getUserById.mockResolvedValue(userWithoutCredits);
      mockDatabaseService.getPlanBySlug.mockResolvedValue(mockPlan);
      mockDatabaseService.updateUserCredits.mockResolvedValue({});

      const result = await subscriptionService.syncCredits(userWithoutCredits.id, 'pro');

      expect(result.credits).toBe(999999);
      expect(result.monthlyCreditLimit).toBe(999999);
    });

    it('should deduct credits after usage', async () => {
      const userWithCredits = {
        ...mockUser,
        credits: 10,
      };

      mockDatabaseService.getUserById.mockResolvedValue(userWithCredits);
      mockDatabaseService.updateUserCredits.mockResolvedValue({});

      await subscriptionService.deductCredit(userWithCredits.id, 1);

      expect(mockDatabaseService.updateUserCredits).toHaveBeenCalledWith(
        userWithCredits.id,
        9
      );
    });

    it('should throw error when insufficient credits', async () => {
      const userWithLowCredits = {
        ...mockUser,
        credits: 0,
      };

      mockDatabaseService.getUserById.mockResolvedValue(userWithLowCredits);

      await expect(
        subscriptionService.deductCredit(userWithLowCredits.id, 1)
      ).rejects.toThrow('Insufficient credits');
    });

    it('should check if user has sufficient credits', async () => {
      const userWithCredits = {
        ...mockUser,
        credits: 5,
      };

      mockDatabaseService.getUserById.mockResolvedValue(userWithCredits);

      const hasCredits = await subscriptionService.hasCredits(userWithCredits.id, 3);
      expect(hasCredits).toBe(true);

      const hasEnoughCredits = await subscriptionService.hasCredits(userWithCredits.id, 10);
      expect(hasEnoughCredits).toBe(false);
    });
  });

  describe('Subscription Cancellation', () => {
    it('should cancel subscription at period end', async () => {
      const userWithSubscription = {
        ...mockUser,
        razorpaySubscriptionId: 'sub_test123',
      };

      const mockSubscription = {
        id: 'db-sub-id',
        userId: mockUser.id,
        razorpaySubscriptionId: 'sub_test123',
        status: 'active',
      };

      vi.spyOn(databaseService, 'getUserByClerkId').mockResolvedValue(userWithSubscription as any);
      vi.spyOn(razorpayService, 'cancelSubscription').mockResolvedValue({} as any);
      vi.spyOn(databaseService, 'getUserSubscription').mockResolvedValue(mockSubscription as any);
      vi.spyOn(databaseService, 'updateSubscriptionStatus').mockResolvedValue({} as any);

      await subscriptionService.cancelSubscription('clerk_test_user', true);

      expect(razorpayService.cancelSubscription).toHaveBeenCalledWith('sub_test123', true);
      expect(databaseService.updateSubscriptionStatus).toHaveBeenCalledWith(
        'db-sub-id',
        'active',
        true
      );
    });

    it('should cancel subscription immediately', async () => {
      const userWithSubscription = {
        ...mockUser,
        razorpaySubscriptionId: 'sub_test123',
      };

      const mockSubscription = {
        id: 'db-sub-id',
        userId: mockUser.id,
        razorpaySubscriptionId: 'sub_test123',
        status: 'active',
      };

      vi.spyOn(databaseService, 'getUserByClerkId').mockResolvedValue(userWithSubscription as any);
      vi.spyOn(razorpayService, 'cancelSubscription').mockResolvedValue({} as any);
      vi.spyOn(databaseService, 'getUserSubscription').mockResolvedValue(mockSubscription as any);
      vi.spyOn(databaseService, 'updateSubscriptionStatus').mockResolvedValue({} as any);
      vi.spyOn(databaseService, 'updateUserSubscription').mockResolvedValue({} as any);

      await subscriptionService.cancelSubscription('clerk_test_user', false);

      expect(databaseService.updateSubscriptionStatus).toHaveBeenCalledWith(
        'db-sub-id',
        'cancelled',
        false
      );
      expect(databaseService.updateUserSubscription).toHaveBeenCalledWith(
        'clerk_test_user',
        { subscriptionStatus: 'cancelled' }
      );
    });

    it('should throw error when no active subscription', async () => {
      vi.spyOn(databaseService, 'getUserByClerkId').mockResolvedValue(mockUser as any);

      await expect(
        subscriptionService.cancelSubscription('clerk_test_user', true)
      ).rejects.toThrow('No active subscription found');
    });
  });

  describe('Subscription Renewal', () => {
    it('should handle subscription renewal webhook', async () => {
      const mockSubscription = {
        id: 'db-sub-id',
        userId: mockUser.id,
        razorpaySubscriptionId: 'sub_test123',
        status: 'active',
      };

      const mockRazorpaySubscription = {
        id: 'sub_test123',
        current_start: Math.floor(Date.now() / 1000),
        current_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      };

      vi.spyOn(databaseService, 'getSubscriptionByRazorpayId').mockResolvedValue(mockSubscription as any);
      vi.spyOn(razorpayService, 'getSubscription').mockResolvedValue(mockRazorpaySubscription as any);
      vi.spyOn(databaseService, 'updateSubscriptionPeriod').mockResolvedValue({} as any);

      await subscriptionService.handleSubscriptionRenewal('sub_test123');

      expect(databaseService.updateSubscriptionPeriod).toHaveBeenCalledWith(
        'db-sub-id',
        expect.any(Date),
        expect.any(Date)
      );
    });

    it('should reset credits on renewal', async () => {
      // This test verifies that credits are reset when subscription renews
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1);

      const userWithExpiredCredits = {
        ...mockUser,
        credits: 0,
        monthlyCreditLimit: 500,
        creditsResetAt: pastDate,
      };

      const mockPlan = {
        id: 'plan-id',
        slug: 'pro',
        features: [
          {
            feature: { key: 'monthly_requests' },
            value: '500',
          },
        ],
      };

      vi.spyOn(databaseService, 'getUserById').mockResolvedValue(userWithExpiredCredits as any);
      vi.spyOn(databaseService, 'getPlanBySlug').mockResolvedValue(mockPlan as any);
      vi.spyOn(databaseService, 'updateUserCredits').mockResolvedValue({} as any);

      const result = await subscriptionService.syncCredits(userWithExpiredCredits.id, 'pro');

      expect(result.credits).toBe(500);
      expect(databaseService.updateUserCredits).toHaveBeenCalled();
    });
  });

  describe('Subscription Status Check', () => {
    it('should return correct status for active pro subscriber', async () => {
      const proUser = {
        ...mockUser,
        credits: 450,
        monthlyCreditLimit: 500,
        subscriptionStatus: 'active',
      };

      const mockSubscription = {
        id: 'sub-id',
        userId: proUser.id,
        planId: 'pro',
        status: 'active',
      };

      vi.spyOn(databaseService, 'getUserByClerkId').mockResolvedValue(proUser as any);
      vi.spyOn(databaseService, 'getUserSubscription').mockResolvedValue(mockSubscription as any);
      vi.spyOn(databaseService, 'getUserById').mockResolvedValue(proUser as any);

      const status = await subscriptionService.checkAccess('clerk_test_user');

      expect(status.isPaidSubscriber).toBe(true);
      expect(status.hasAccess).toBe(true);
      expect(status.credits).toBe(450);
      expect(status.monthlyCreditLimit).toBe(500);
    });

    it('should return correct status for free user', async () => {
      const freeUser = {
        ...mockUser,
        credits: 5,
        monthlyCreditLimit: 10,
        subscriptionStatus: 'inactive',
      };

      vi.spyOn(databaseService, 'getUserByClerkId').mockResolvedValue(freeUser as any);
      vi.spyOn(databaseService, 'getUserSubscription').mockResolvedValue(null);
      vi.spyOn(databaseService, 'getUserById').mockResolvedValue(freeUser as any);

      const status = await subscriptionService.checkAccess('clerk_test_user');

      expect(status.isPaidSubscriber).toBe(false);
      expect(status.hasAccess).toBe(true);
      expect(status.credits).toBe(5);
    });

    it('should return no access when credits exhausted', async () => {
      const userNoCredits = {
        ...mockUser,
        credits: 0,
        monthlyCreditLimit: 10,
        subscriptionStatus: 'inactive',
      };

      vi.spyOn(databaseService, 'getUserByClerkId').mockResolvedValue(userNoCredits as any);
      vi.spyOn(databaseService, 'getUserSubscription').mockResolvedValue(null);
      vi.spyOn(databaseService, 'getUserById').mockResolvedValue(userNoCredits as any);

      const status = await subscriptionService.checkAccess('clerk_test_user');

      expect(status.hasAccess).toBe(false);
      expect(status.credits).toBe(0);
    });
  });

  describe('Plan Transitions', () => {
    it('should upgrade from basic to pro', async () => {
      const basicUser = {
        ...mockUser,
        credits: 5,
        monthlyCreditLimit: 10,
      };

      const mockRazorpaySubscription = {
        id: 'sub_test123',
        plan_id: 'plan_pro',
        current_start: Math.floor(Date.now() / 1000),
        current_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      };

      const mockProPlan = {
        id: 'plan-id',
        slug: 'pro',
        features: [
          {
            feature: { key: 'monthly_requests' },
            value: '500',
          },
        ],
      };

      vi.spyOn(databaseService, 'getUserByClerkId').mockResolvedValue(basicUser as any);
      vi.spyOn(razorpayService, 'getSubscription').mockResolvedValue(mockRazorpaySubscription as any);
      vi.spyOn(databaseService, 'createOrUpdateSubscription').mockResolvedValue({} as any);
      vi.spyOn(databaseService, 'updateUserSubscription').mockResolvedValue({} as any);
      vi.spyOn(databaseService, 'getPlanBySlug').mockResolvedValue(mockProPlan as any);
      vi.spyOn(databaseService, 'updateUserCredits').mockResolvedValue({} as any);

      await subscriptionService.activateSubscription(
        'clerk_test_user',
        'sub_test123',
        'pro'
      );

      expect(databaseService.updateUserCredits).toHaveBeenCalledWith(
        basicUser.id,
        500,
        500,
        expect.any(Date)
      );
    });

    it('should downgrade from pro to basic after cancellation', async () => {
      const proUser = {
        ...mockUser,
        credits: 450,
        monthlyCreditLimit: 500,
        razorpaySubscriptionId: 'sub_test123',
      };

      const mockSubscription = {
        id: 'db-sub-id',
        userId: proUser.id,
        razorpaySubscriptionId: 'sub_test123',
        status: 'active',
        planId: 'pro',
      };

      vi.spyOn(databaseService, 'getSubscriptionByRazorpayId').mockResolvedValue(mockSubscription as any);
      vi.spyOn(databaseService, 'updateSubscriptionStatus').mockResolvedValue({} as any);
      vi.spyOn(databaseService, 'getUserById').mockResolvedValue(proUser as any);
      vi.spyOn(databaseService, 'updateUserSubscription').mockResolvedValue({} as any);

      await subscriptionService.handleSubscriptionCancelled('sub_test123');

      expect(databaseService.updateSubscriptionStatus).toHaveBeenCalledWith(
        'db-sub-id',
        'cancelled',
        false
      );
      expect(databaseService.updateUserSubscription).toHaveBeenCalledWith(
        proUser.clerkId,
        { subscriptionStatus: 'cancelled' }
      );
    });
  });

  describe('Month End Scenarios', () => {
    it('should convert pro user to free when subscription expires', async () => {
      // Simulate end of billing period
      const expiredProUser = {
        ...mockUser,
        credits: 100,
        monthlyCreditLimit: 500,
        subscriptionStatus: 'cancelled',
        creditsResetAt: new Date(Date.now() - 1000), // Past date
      };

      const mockBasicPlan = {
        id: 'plan-id',
        slug: 'basic',
        features: [
          {
            feature: { key: 'monthly_requests' },
            value: '10',
          },
        ],
      };

      vi.spyOn(databaseService, 'getUserById').mockResolvedValue(expiredProUser as any);
      vi.spyOn(databaseService, 'getPlanBySlug').mockResolvedValue(mockBasicPlan as any);
      vi.spyOn(databaseService, 'updateUserCredits').mockResolvedValue({} as any);

      // Sync credits should reset to basic plan limits
      const result = await subscriptionService.syncCredits(expiredProUser.id, 'basic');

      expect(result.credits).toBe(10);
      expect(result.monthlyCreditLimit).toBe(10);
    });

    it('should maintain pro access until period end even after cancellation', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);

      const cancelledProUser = {
        ...mockUser,
        credits: 300,
        monthlyCreditLimit: 500,
        subscriptionStatus: 'active',
        creditsResetAt: futureDate,
      };

      const mockSubscription = {
        id: 'sub-id',
        userId: cancelledProUser.id,
        planId: 'pro',
        status: 'active',
        cancelAtPeriodEnd: true,
      };

      vi.spyOn(databaseService, 'getUserByClerkId').mockResolvedValue(cancelledProUser as any);
      vi.spyOn(databaseService, 'getUserSubscription').mockResolvedValue(mockSubscription as any);
      vi.spyOn(databaseService, 'getUserById').mockResolvedValue(cancelledProUser as any);

      const status = await subscriptionService.checkAccess('clerk_test_user');

      expect(status.isPaidSubscriber).toBe(true);
      expect(status.hasAccess).toBe(true);
      expect(status.credits).toBe(300);
    });
  });
});
