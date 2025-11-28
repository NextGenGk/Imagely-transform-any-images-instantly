/**
 * GET /api/subscription/status
 * Get user's subscription status and access information
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/subscription.service';
import { DatabaseService } from '@/lib/database.service';
import { AuthenticationError, logError, errorToResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new AuthenticationError();
    }

    const subscriptionService = new SubscriptionService();
    const databaseService = new DatabaseService();

    // Ensure user exists and initialize trial if new user
    const user = await databaseService.getUserByClerkId(userId);
    
    if (!user) {
      // New user - initialize trial
      const email = `${userId}@clerk.user`; // Will be updated with real email later
      await databaseService.ensureUser(userId, email);
      await subscriptionService.initializeTrial(userId, email);
    } else if (!user.trialEndsAt && user.subscriptionStatus === 'trial') {
      // Existing user without trial end date - initialize trial
      await subscriptionService.initializeTrial(userId, user.email);
    }

    const status = await subscriptionService.checkAccess(userId);

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    logError(error, { endpoint: '/api/subscription/status' });
    const { response, statusCode } = errorToResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
