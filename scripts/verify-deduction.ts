import { PrismaClient } from '@prisma/client';
import { SubscriptionService } from '../lib/subscription.service';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Starting credit deduction verification...');

        // 1. Create a test user
        const testClerkId = 'test_deduct_' + Date.now();
        const user = await prisma.user.create({
            data: {
                clerkId: testClerkId,
                email: `test_deduct_${Date.now()}@example.com`,
                credits: 10,
                monthlyCreditLimit: 10,
            }
        });
        console.log(`Created test user: ${user.id} with 10 credits`);

        // 2. Initialize Subscription Service
        const subscriptionService = new SubscriptionService();

        // 3. Deduct 1 credit
        console.log('Deducting 1 credit...');
        await subscriptionService.deductCredit(user.id, 1);

        // 4. Verify new balance
        const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!updatedUser) throw new Error('User not found after update');

        console.log(`New balance: ${updatedUser.credits}`);

        if (updatedUser.credits !== 9) {
            throw new Error(`Deduction failed! Expected 9, got ${updatedUser.credits}`);
        }

        console.log('Credit deduction verified successfully.');

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
