import { PrismaClient } from '@prisma/client';
import { SubscriptionService } from '../lib/subscription.service';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Starting debug script...');

        // 1. Get or create a user
        let user = await prisma.user.findFirst();
        if (!user) {
            console.log('No user found, creating one...');
            user = await prisma.user.create({
                data: {
                    clerkId: 'debug_user_' + Date.now(),
                    email: 'debug@example.com',
                    credits: 10,
                    monthlyCreditLimit: 10,
                }
            });
        }
        console.log(`Using user: ${user.id} (${user.email})`);

        // 2. Initialize Subscription Service
        const subscriptionService = new SubscriptionService();

        // 3. Attempt to create subscription
        const planId = 'pro';
        console.log(`Attempting to create subscription for plan: ${planId}`);

        try {
            const result = await subscriptionService.createSubscription(
                user.clerkId,
                user.email,
                'Debug User',
                planId
            );
            console.log('Subscription created successfully:', result);
        } catch (error) {
            console.error('FAILED to create subscription:');
            if (error instanceof Error) {
                console.error(error.message);
                // @ts-ignore
                if (error.error) console.error(JSON.stringify(error.error, null, 2));
            } else {
                console.error(error);
            }
        }

    } catch (error) {
        console.error('Script error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
