/**
 * Razorpay Payment Service
 * Handles subscription creation, management, and payment processing
 */

import Razorpay from 'razorpay';

export interface RazorpaySubscription {
  id: string;
  plan_id: string;
  customer_id: string;
  status: string;
  current_start: number;
  current_end: number;
  charge_at: number;
}

export interface CreateSubscriptionParams {
  planId: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
  totalCount?: number;
}

export class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured');
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  /**
   * Create a new customer in Razorpay
   */
  async createCustomer(email: string, name: string, clerkId: string) {
    try {
      const customer = await this.razorpay.customers.create({
        email,
        name,
        notes: {
          clerkId,
        },
      });

      return customer;
    } catch (error: any) {
      // Check if customer already exists
      if (error.error && error.error.code === 'BAD_REQUEST_ERROR' && error.error.description.includes('Customer already exists')) {
        console.log('Customer already exists in Razorpay, fetching details...');
        try {
          const customers = await this.razorpay.customers.all({
            email: email,
            count: 1
          } as any);

          if (customers.items && customers.items.length > 0) {
            console.log('Found existing customer:', customers.items[0].id);
            return customers.items[0];
          }
        } catch (fetchError) {
          console.error('Failed to fetch existing customer:', fetchError);
        }
      }

      console.error('Failed to create Razorpay customer:', error);
      if (error && typeof error === 'object' && 'error' in error) {
        console.error('Razorpay Customer Creation Error Details:', JSON.stringify((error as any).error, null, 2));
      }
      throw new Error('Failed to create customer');
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(params: CreateSubscriptionParams) {
    try {
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: params.planId,
        customer_notify: 1,
        total_count: params.totalCount || 12, // 12 months by default
        quantity: 1,
        notes: {
          customerEmail: params.customerEmail,
        },
      });

      return subscription;
      return subscription;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      // Log full error details if available
      if (error && typeof error === 'object' && 'error' in error) {
        console.error('Razorpay Error Details:', JSON.stringify((error as any).error, null, 2));
      }
      throw new Error('Failed to create subscription');
    }
  }

  /**
   * Fetch subscription details
   */
  async getSubscription(subscriptionId: string) {
    try {
      const subscription = await this.razorpay.subscriptions.fetch(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      throw new Error('Failed to fetch subscription');
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtCycleEnd: boolean = true) {
    try {
      const subscription = await this.razorpay.subscriptions.cancel(
        subscriptionId,
        cancelAtCycleEnd
      );
      return subscription;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Verify payment signature
   */
  verifyPaymentSignature(
    razorpayPaymentId: string,
    razorpaySubscriptionId: string,
    razorpaySignature: string
  ): boolean {
    try {
      const crypto = require('crypto');
      const keySecret = process.env.RAZORPAY_KEY_SECRET!;

      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
        .digest('hex');

      return generatedSignature === razorpaySignature;
    } catch (error) {
      console.error('Failed to verify payment signature:', error);
      return false;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const crypto = require('crypto');
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

      const generatedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      return generatedSignature === signature;
    } catch (error) {
      console.error('Failed to verify webhook signature:', error);
      return false;
    }
  }

  /**
   * Get plan details
   */
  async getPlan(planId: string) {
    try {
      const plan = await this.razorpay.plans.fetch(planId);
      return plan;
    } catch (error) {
      console.error('Failed to fetch plan:', error);
      throw new Error('Failed to fetch plan');
    }
  }
}
