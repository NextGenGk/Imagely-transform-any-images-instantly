/**
 * Subscription Management Service
 * Handles user subscription status, trial periods, and access control
 */

import { DatabaseService } from './database.service';
import { RazorpayService } from './razorpay.service';

export interface SubscriptionStatus {
  hasAccess: boolean;
  isTrialActive: boolean;
  isPaidSubscriber: boolean;
  trialDaysRemaining: number;
  subscriptionStatus: string;
  planId?: string;
  credits: number;
  monthlyCreditLimit: number;
}

export class SubscriptionService {
  private databaseService: DatabaseService;
  private razorpayService: RazorpayService;


  constructor() {
    this.databaseService = new DatabaseService();
    this.razorpayService = new RazorpayService();
  }

  /**
   * Initialize new user (no trial)
   */
  async initializeUser(clerkId: string, email: string): Promise<void> {
    // No trial initialization needed anymore
    // Just ensure default status is set if needed (schema handles default "inactive")
  }

  /**
   * Check if user has access to upload feature
   */
  async checkAccess(clerkId: string): Promise<SubscriptionStatus & { features: Record<string, any> }> {
    const user = await this.databaseService.getUserByClerkId(clerkId);

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has active paid subscription
    const subscription = await this.databaseService.getUserSubscription(user.id);
    const isPaidSubscriber = subscription?.status === 'active';

    // User has access if they have credits or paid subscription
    // For now, we rely on credits for access control in the API
    const hasAccess = isPaidSubscriber || user.credits > 0;

    // Fetch features based on plan
    let features: Record<string, any> = {};
    let planSlug = subscription?.planId;

    // Sync credits (handle reset and initialization)
    const { credits, monthlyCreditLimit } = await this.syncCredits(user.id, planSlug);

    return {
      hasAccess,
      isTrialActive: false, // Deprecated
      isPaidSubscriber,
      trialDaysRemaining: 0, // Deprecated
      subscriptionStatus: user.subscriptionStatus,
      planId: subscription?.planId,
      features,
      credits,
      monthlyCreditLimit
    };
  }

  /**
   * Sync user credits (handle reset and initialization)
   */
  async syncCredits(userId: string, planSlug?: string): Promise<{ credits: number; monthlyCreditLimit: number }> {
    const user = await this.databaseService.getUserById(userId);
    if (!user) throw new Error('User not found');

    let monthlyCreditLimit = user.monthlyCreditLimit;

    // If planSlug is provided, update limit from plan
    // If no planSlug provided and user has no limit set (0), default to 'basic'
    if (!planSlug && monthlyCreditLimit === 0) {
      planSlug = 'basic';
    }

    if (planSlug) {
      const plan = await this.databaseService.getPlanBySlug(planSlug);
      if (plan) {
        const features = plan.features.reduce((acc: Record<string, any>, pf: any) => {
          acc[pf.feature.key] = pf.value;
          return acc;
        }, {} as Record<string, any>);

        const limitStr = features['monthly_requests'];
        if (limitStr === 'unlimited') {
          monthlyCreditLimit = 999999;
        } else if (limitStr) {
          monthlyCreditLimit = parseInt(limitStr, 10) || 0;
        }
      }
    }

    const now = new Date();
    const creditsResetAt = user.creditsResetAt ? new Date(user.creditsResetAt) : null;
    let credits = user.credits;

    // Initialize credits if never set or if reset period has passed
    // Also update if monthlyCreditLimit changed (optional, but good for upgrades)
    if (!creditsResetAt || (creditsResetAt < now)) {
      credits = monthlyCreditLimit;

      const nextResetDate = new Date();
      nextResetDate.setMonth(nextResetDate.getMonth() + 1);

      await this.databaseService.updateUserCredits(userId, credits, monthlyCreditLimit, nextResetDate);
    } else if (user.monthlyCreditLimit !== monthlyCreditLimit) {
      // Update limit if it changed (e.g. plan change) without resetting credits immediately
      // unless we want to enforce new limit immediately. 
      // For now, just update the stored limit.
      await this.databaseService.updateUserCredits(userId, credits, monthlyCreditLimit);
    }

    return { credits, monthlyCreditLimit };
  }

  /**
   * Check if user has sufficient credits
   */
  async hasCredits(userId: string, amount: number = 1): Promise<boolean> {
    const user = await this.databaseService.getUserById(userId);
    if (!user) {
      console.log('hasCredits: User not found', userId);
      return false;
    }
    console.log(`hasCredits check: User ${userId} has ${user.credits} credits. Required: ${amount}`);
    return user.credits >= amount;
  }

  /**
   * Deduct credits from user
   */
  async deductCredit(userId: string, amount: number = 1): Promise<void> {
    const user = await this.databaseService.getUserById(userId);
    if (!user) throw new Error('User not found');

    if (user.credits < amount) {
      throw new Error('Insufficient credits');
    }

    await this.databaseService.updateUserCredits(user.id, user.credits - amount);
  }

  /**
   * Create subscription for user
   */
  async createSubscription(
    clerkId: string,
    email: string,
    name: string,
    planId: string
  ) {
    const user = await this.databaseService.getUserByClerkId(clerkId);

    if (!user) {
      throw new Error('User not found');
    }

    // Create or get Razorpay customer
    let customerId = user.razorpayCustomerId;
    if (!customerId) {
      const customer = await this.razorpayService.createCustomer(email, name, clerkId);
      customerId = customer.id;

      await this.databaseService.updateUserSubscription(clerkId, {
        razorpayCustomerId: customerId,
      });
    }

    // Get Razorpay plan ID from environment
    const razorpayPlanId =
      planId === 'pro'
        ? process.env.RAZORPAY_PRO_PLAN_ID!
        : process.env.RAZORPAY_BASIC_PLAN_ID!;

    // Create subscription
    const subscription = await this.razorpayService.createSubscription({
      planId: razorpayPlanId,
      customerEmail: email,
      customerName: name,
    });

    return {
      subscriptionId: subscription.id,
      planId: razorpayPlanId,
    };
  }

  /**
   * Activate subscription after successful payment
   */
  async activateSubscription(
    clerkId: string,
    razorpaySubscriptionId: string,
    planId: string
  ) {
    const user = await this.databaseService.getUserByClerkId(clerkId);

    if (!user) {
      throw new Error('User not found');
    }

    // Fetch subscription details from Razorpay
    const razorpaySubscription = await this.razorpayService.getSubscription(
      razorpaySubscriptionId
    );

    const currentPeriodStart = new Date((razorpaySubscription.current_start || 0) * 1000);
    const currentPeriodEnd = new Date((razorpaySubscription.current_end || 0) * 1000);

    // Create or update subscription in database
    await this.databaseService.createOrUpdateSubscription({
      userId: user.id,
      planId,
      status: 'active',
      razorpaySubscriptionId,
      razorpayPlanId: razorpaySubscription.plan_id,
      currentPeriodStart,
      currentPeriodEnd,
    });

    // Update user subscription status
    await this.databaseService.updateUserSubscription(clerkId, {
      subscriptionStatus: 'active',
      razorpaySubscriptionId,
    });

    // Update credits based on the new plan
    const plan = await this.databaseService.getPlanBySlug(planId);
    if (plan) {
      const features = plan.features.reduce((acc: Record<string, any>, pf: any) => {
        acc[pf.feature.key] = pf.value;
        return acc;
      }, {} as Record<string, any>);

      let monthlyCreditLimit = 0;
      const limitStr = features['monthly_requests'];
      if (limitStr === 'unlimited') {
        monthlyCreditLimit = 999999;
      } else if (limitStr) {
        monthlyCreditLimit = parseInt(limitStr, 10) || 0;
      }

      // Reset credits to the new limit
      await this.databaseService.updateUserCredits(
        user.id,
        monthlyCreditLimit,
        monthlyCreditLimit,
        currentPeriodEnd // Set reset date to end of current billing period
      );
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(clerkId: string, cancelAtPeriodEnd: boolean = true) {
    const user = await this.databaseService.getUserByClerkId(clerkId);

    if (!user || !user.razorpaySubscriptionId) {
      throw new Error('No active subscription found');
    }

    // Cancel in Razorpay
    await this.razorpayService.cancelSubscription(
      user.razorpaySubscriptionId,
      cancelAtPeriodEnd
    );

    // Update database
    const subscription = await this.databaseService.getUserSubscription(user.id);
    if (subscription) {
      await this.databaseService.updateSubscriptionStatus(
        subscription.id,
        cancelAtPeriodEnd ? 'active' : 'cancelled',
        cancelAtPeriodEnd
      );
    }

    if (!cancelAtPeriodEnd) {
      await this.databaseService.updateUserSubscription(clerkId, {
        subscriptionStatus: 'cancelled',
      });
    }
  }

  /**
   * Handle subscription renewal
   */
  async handleSubscriptionRenewal(razorpaySubscriptionId: string) {
    const subscription = await this.databaseService.getSubscriptionByRazorpayId(
      razorpaySubscriptionId
    );

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Fetch updated details from Razorpay
    const razorpaySubscription = await this.razorpayService.getSubscription(
      razorpaySubscriptionId
    );

    const currentPeriodStart = new Date((razorpaySubscription.current_start || 0) * 1000);
    const currentPeriodEnd = new Date((razorpaySubscription.current_end || 0) * 1000);

    // Update subscription period
    await this.databaseService.updateSubscriptionPeriod(
      subscription.id,
      currentPeriodStart,
      currentPeriodEnd
    );
  }

  /**
   * Handle subscription cancellation from webhook
   */
  async handleSubscriptionCancelled(razorpaySubscriptionId: string) {
    const subscription = await this.databaseService.getSubscriptionByRazorpayId(
      razorpaySubscriptionId
    );

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    await this.databaseService.updateSubscriptionStatus(
      subscription.id,
      'cancelled',
      false
    );

    const user = await this.databaseService.getUserById(subscription.userId);
    if (user) {
      await this.databaseService.updateUserSubscription(user.clerkId, {
        subscriptionStatus: 'cancelled',
      });
    }
  }
}
