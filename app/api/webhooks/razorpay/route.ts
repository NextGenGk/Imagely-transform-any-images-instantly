/**
 * POST /api/webhooks/razorpay
 * Handle Razorpay webhook events
 */

import { NextRequest, NextResponse } from 'next/server';
import { RazorpayService } from '@/lib/razorpay.service';
import { SubscriptionService } from '@/lib/subscription.service';
import { logError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const razorpayService = new RazorpayService();
    const isValid = razorpayService.verifyWebhookSignature(body, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    const subscriptionService = new SubscriptionService();

    // Handle different event types
    switch (event.event) {
      case 'subscription.activated':
        // Subscription activated after first payment
        console.log('Subscription activated:', event.payload.subscription.entity.id);
        break;

      case 'subscription.charged':
        // Subscription renewed/charged
        await subscriptionService.handleSubscriptionRenewal(
          event.payload.subscription.entity.id
        );
        break;

      case 'subscription.cancelled':
        // Subscription cancelled
        await subscriptionService.handleSubscriptionCancelled(
          event.payload.subscription.entity.id
        );
        break;

      case 'subscription.completed':
        // Subscription completed (all payments done)
        console.log('Subscription completed:', event.payload.subscription.entity.id);
        break;

      case 'subscription.paused':
        // Subscription paused
        console.log('Subscription paused:', event.payload.subscription.entity.id);
        break;

      case 'subscription.resumed':
        // Subscription resumed
        console.log('Subscription resumed:', event.payload.subscription.entity.id);
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logError(error, { endpoint: '/api/webhooks/razorpay' });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
