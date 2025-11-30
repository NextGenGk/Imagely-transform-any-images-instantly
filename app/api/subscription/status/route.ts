/**
 * GET /api/subscription/status
 * Get user's subscription status and access information
 */

import { auth, currentUser } from '@clerk/nextjs/server';
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

    // Ensure user exists
    const user = await databaseService.getUserByClerkId(userId);

    if (!user) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress;

      if (email) {
        await databaseService.ensureUser(userId, email);
      }
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
