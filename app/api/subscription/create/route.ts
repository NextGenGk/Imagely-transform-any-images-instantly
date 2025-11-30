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
