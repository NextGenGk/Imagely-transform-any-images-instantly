import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database.service';
import { SubscriptionService } from '@/lib/subscription.service';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const email = user.emailAddresses[0]?.emailAddress;
        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        const databaseService = new DatabaseService();

        // Ensure user exists and get ID (this initializes credits if new user)
        const dbUserId = await databaseService.ensureUser(userId, email);

        // Fetch full user object
        const dbUser = await databaseService.getUserById(dbUserId);

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const subscriptionService = new SubscriptionService();

        // Sync credits to ensure they are initialized and reset if needed
        const subscription = await databaseService.getUserSubscription(dbUser.id);
        const planSlug = subscription?.planId || undefined;

        const { credits, monthlyCreditLimit } = await subscriptionService.syncCredits(dbUser.id, planSlug);

        return NextResponse.json({
            credits,
            monthlyCreditLimit,
        });
    } catch (error) {
        console.error('Error fetching credits:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
