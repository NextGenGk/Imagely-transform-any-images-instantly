import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { RazorpayService } from '../lib/razorpay.service';

async function main() {
    console.log('Checking Razorpay Configuration...');

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const basicPlanId = process.env.RAZORPAY_BASIC_PLAN_ID;
    const proPlanId = process.env.RAZORPAY_PRO_PLAN_ID;

    console.log('Key ID:', keyId ? 'Set' : 'Missing');
    console.log('Key Secret:', keySecret ? 'Set' : 'Missing');
    console.log('Basic Plan ID:', basicPlanId);
    console.log('Pro Plan ID:', proPlanId);

    if (!keyId || !keySecret) {
        console.error('Razorpay credentials missing!');
        return;
    }

    const razorpayService = new RazorpayService();

    if (basicPlanId) {
        try {
            console.log(`Fetching Basic Plan (${basicPlanId})...`);
            const plan = await razorpayService.getPlan(basicPlanId);
            console.log('Basic Plan found:', plan.item.name);
        } catch (error) {
            console.error('Failed to fetch Basic Plan:', error.message);
        }
    }

    if (proPlanId) {
        try {
            console.log(`Fetching Pro Plan (${proPlanId})...`);
            const plan = await razorpayService.getPlan(proPlanId);
            console.log('Pro Plan found:', plan.item.name);
        } catch (error) {
            console.error('Failed to fetch Pro Plan:', error.message);
        }
    }
}

main().catch(console.error);
