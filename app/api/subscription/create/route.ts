/**
 * POST /api/subscription/create
 * Create a new subscription for the user
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/subscription.service';
import { AuthenticationError, ValidationError, logError, errorToResponse } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new AuthenticationError();
    }

    const user = await currentUser();
    if (!user) {
      throw new AuthenticationError();
    }

    const body = await request.json();
    const { planId } = body;

    if (!planId || !['basic', 'pro'].includes(planId)) {
      throw new ValidationError('Invalid plan ID', 'planId');
    }

    const subscriptionService = new SubscriptionService();
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      throw new AuthenticationError('User email required');
    }

    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

    // Handle Free Plan (Basic) directly
    if (planId === 'basic') {
      // For basic plan, we don't need Razorpay.
      // We just ensure the user has the basic plan in DB.
      // We can reuse activateSubscription logic but without Razorpay ID,
      // OR we can create a specific method.
      // For simplicity, let's just update the user credits and plan here directly
      // or call a new method in service.

      // Actually, let's add a method to SubscriptionService for this.
      await subscriptionService.activateFreeSubscription(userId);

      return NextResponse.json({
        success: true,
        data: { planId: 'basic' },
      });
    }

    const result = await subscriptionService.createSubscription(
      userId,
      email,
      name,
      planId
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logError(error, { endpoint: '/api/subscription/create' });
    const { response, statusCode } = errorToResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
