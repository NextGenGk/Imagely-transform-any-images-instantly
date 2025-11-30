import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Features
    const features = [
        { key: 'monthly_requests', name: 'Monthly Requests', description: 'Number of image processing requests allowed per month' },
        { key: 'max_file_size', name: 'Max File Size', description: 'Maximum file size allowed for upload' },
        { key: 'batch_processing', name: 'Batch Processing', description: 'Process multiple images at once' },
        { key: 'api_access', name: 'API Access', description: 'Access to the API' },
        { key: 'priority_support', name: 'Priority Support', description: 'Priority customer support' },
    ];

    for (const feature of features) {
        await prisma.feature.upsert({
            where: { key: feature.key },
            update: {},
            create: feature,
        });
    }

    // Plans
    const plans = [
        {
            name: 'Basic',
            slug: 'basic',
            price: 299,
            currency: 'INR',
            razorpayPlanId: process.env.RAZORPAY_BASIC_PLAN_ID || 'plan_basic_test',
            features: [
                { key: 'monthly_requests', value: '10' },
                { key: 'max_file_size', value: '10MB' },
            ],
        },
        {
            name: 'Pro',
            slug: 'pro',
            price: 599,
            currency: 'INR',
            razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID || 'plan_pro_test',
            features: [
                { key: 'monthly_requests', value: '500' },
                { key: 'max_file_size', value: 'unlimited' },
                { key: 'batch_processing', value: 'true' },
                { key: 'api_access', value: 'true' },
                { key: 'priority_support', value: 'true' },
            ],
        },
    ];

    for (const planData of plans) {
        console.log(`Processing plan: ${planData.name}`);
        const plan = await prisma.plan.upsert({
            where: { slug: planData.slug },
            update: {
                razorpayPlanId: planData.razorpayPlanId,
            },
            create: {
                name: planData.name,
                slug: planData.slug,
                price: planData.price,
                currency: planData.currency,
                razorpayPlanId: planData.razorpayPlanId,
            },
        });
        console.log(`Upserted plan: ${plan.name}`);

        for (const featureData of planData.features) {
            const feature = await prisma.feature.findUnique({
                where: { key: featureData.key },
            });

            if (feature) {
                await prisma.planFeature.upsert({
                    where: {
                        planId_featureId: {
                            planId: plan.id,
                            featureId: feature.id,
                        },
                    },
                    update: {
                        value: featureData.value,
                    },
                    create: {
                        planId: plan.id,
                        featureId: feature.id,
                        value: featureData.value,
                    },
                });
            }
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
