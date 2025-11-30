/**
 * POST /api/subscription/verify
 * Verify payment and activate subscription
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/subscription.service';
import { RazorpayService } from '@/lib/razorpay.service';
import { AuthenticationError, ValidationError, logError, errorToResponse } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new AuthenticationError();
    }

    const body = await request.json();
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      planId,
    } = body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      throw new ValidationError('Missing payment verification parameters', 'payment');
    }

    if (!planId || !['basic', 'pro'].includes(planId)) {
      throw new ValidationError('Invalid plan ID', 'planId');
    }

    // Verify payment signature
    const razorpayService = new RazorpayService();
    const isValid = razorpayService.verifyPaymentSignature(
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature
    );

    if (!isValid) {
      throw new ValidationError('Invalid payment signature', 'signature');
    }

    // Activate subscription
    const subscriptionService = new SubscriptionService();
    await subscriptionService.activateSubscription(
      userId,
      razorpay_subscription_id,
      planId
    );

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    logError(error, { endpoint: '/api/subscription/verify' });
    const { response, statusCode } = errorToResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
