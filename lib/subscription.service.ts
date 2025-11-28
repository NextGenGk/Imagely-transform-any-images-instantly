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
}

export class SubscriptionService {
  private databaseService: DatabaseService;
  private razorpayService: RazorpayService;
  private TRIAL_DAYS = 3;

  constructor() {
    this.databaseService = new DatabaseService();
    this.razorpayService = new RazorpayService();
  }

  /**
   * Initialize trial for new user
   */
  async initializeTrial(clerkId: string, email: string): Promise<void> {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + this.TRIAL_DAYS);

    await this.databaseService.updateUserSubscription(clerkId, {
      isTrialActive: true,
      trialEndsAt,
      subscriptionStatus: 'trial',
    });
  }

  /**
   * Check if user has access to upload feature
   */
  async checkAccess(clerkId: string): Promise<SubscriptionStatus> {
    const user = await this.databaseService.getUserByClerkId(clerkId);

    if (!user) {
      throw new Error('User not found');
    }

    // Check if trial is active
    const now = new Date();
    const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
    const isTrialActive = user.isTrialActive && trialEndsAt && trialEndsAt > now;

    // Calculate trial days remaining
    let trialDaysRemaining = 0;
    if (isTrialActive && trialEndsAt) {
      const diffTime = trialEndsAt.getTime() - now.getTime();
      trialDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Check if user has active paid subscription
    const subscription = await this.databaseService.getUserSubscription(user.id);
    const isPaidSubscriber = subscription?.status === 'active';

    // User has access if trial is active OR has paid subscription
    const hasAccess = isTrialActive || isPaidSubscriber;

    // If trial expired and no paid subscription, update status
    if (!isTrialActive && !isPaidSubscriber && user.subscriptionStatus === 'trial') {
      await this.databaseService.updateUserSubscription(clerkId, {
        isTrialActive: false,
        subscriptionStatus: 'expired',
      });
    }

    return {
      hasAccess,
      isTrialActive: isTrialActive || false,
      isPaidSubscriber,
      trialDaysRemaining,
      subscriptionStatus: user.subscriptionStatus,
      planId: subscription?.planId,
    };
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
      isTrialActive: false,
    });
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
