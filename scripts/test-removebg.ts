import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { RemoveBgService } from '../lib/removebg.service';
import fs from 'fs';
import path from 'path';

async function testRemoveBg() {
    try {
        console.log('Testing RemoveBgService...');

        // Check if API key is present
        if (!process.env.REMOVEBG_API_KEY) {
            console.error('Error: REMOVEBG_API_KEY is not set in environment variables.');
            process.exit(1);
        }

        console.log('API Key found (length):', process.env.REMOVEBG_API_KEY.length);

        const service = new RemoveBgService();

        // Create a simple 1x1 pixel transparent PNG buffer to test connectivity
        // This is just to test if the API accepts the key, though it might reject the image as too small or empty
        // Better to use a small real image if possible, but let's try to just instantiate first.
        // Actually, let's try to make a call with a dummy buffer. The API will likely return an error about the image, 
        // but if the Auth is wrong, it will return 403/401 first.

        const dummyBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

        try {
            await service.removeBackground(dummyBuffer);
            console.log('Success: Remove.bg API call succeeded!');
        } catch (error: any) {
            console.log('API Call finished with error:', error.message);

            if (error.message.includes('401') || error.message.includes('403') || error.message.includes('API key')) {
                console.error('CRITICAL: API Key is invalid or missing credits.');
            } else if (error.message.includes('402')) {
                console.error('CRITICAL: Payment required / No credits.');
            } else {
                console.log('This might be an image error, which means Auth is likely OK.');
            }
        }

    } catch (error: any) {
        console.error('Test failed:', error.message);
    }
}

testRemoveBg();
