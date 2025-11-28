/**
 * POST /api/subscription/cancel
 * Cancel user's subscription
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/subscription.service';
import { AuthenticationError, logError, errorToResponse } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new AuthenticationError();
    }

    const body = await request.json();
    const { cancelAtPeriodEnd = true } = body;

    const subscriptionService = new SubscriptionService();
    await subscriptionService.cancelSubscription(userId, cancelAtPeriodEnd);

    return NextResponse.json({
      success: true,
      message: cancelAtPeriodEnd
        ? 'Subscription will be cancelled at the end of the billing period'
        : 'Subscription cancelled immediately',
    });
  } catch (error) {
    logError(error, { endpoint: '/api/subscription/cancel' });
    const { response, statusCode } = errorToResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
