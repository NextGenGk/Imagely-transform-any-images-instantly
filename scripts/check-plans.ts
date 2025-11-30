import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking plans...');
        const plans = await prisma.plan.findMany();
        console.log('Plans found:', plans);

        if (plans.length === 0) {
            console.log('NO PLANS FOUND! You need to run the seed script.');
        } else {
            const basic = plans.find(p => p.slug === 'basic');
            const pro = plans.find(p => p.slug === 'pro');

            if (basic) console.log('Basic plan found.');
            else console.log('Basic plan MISSING.');

            if (pro) console.log('Pro plan found.');
            else console.log('Pro plan MISSING.');
        }

    } catch (error) {
        console.error('Error checking plans:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
