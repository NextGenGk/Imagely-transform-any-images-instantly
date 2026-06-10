import { RazorpayService } from '../lib/razorpay.service';
import { describe, it } from 'vitest';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

describe('Razorpay Diagnostic', () => {
    it('should create a customer or report real error', async () => {
        const razorpayService = new RazorpayService();
        const testEmail = `test_${Date.now()}@example.com`;
        const testName = 'Test User';
        const testClerkId = 'user_test_123';

        console.log('Attempting to create customer with:', { testEmail, testName, testClerkId });
        
        try {
            const customer = await razorpayService.createCustomer(testEmail, testName, testClerkId);
            console.log('Customer created successfully:', customer.id);
        } catch (error: any) {
            console.log('CAUGHT ERROR IN TEST:');
            // Log the full error object structure
            console.log(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            if (error.error) {
                console.log('Sub-error details:', JSON.stringify(error.error, null, 2));
            }
            throw error;
        }
    }, 20000); // 20s timeout
});
