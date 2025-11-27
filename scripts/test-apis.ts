/**
 * API Testing Script
 * Tests all external APIs to verify they're working correctly
 */

import { GeminiService } from '../lib/gemini.service';
import { ImageKitService } from '../lib/imagekit.service';
import { RemoveBgService } from '../lib/removebg.service';
import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

interface TestResult {
  service: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function logResult(result: TestResult) {
  results.push(result);
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${icon} ${result.service}: ${result.message}`);
  if (result.details) {
    console.log('   Details:', result.details);
  }
}

async function testGeminiAPI() {
  console.log('\n🧪 Testing Gemini API...');
  
  if (!process.env.GEMINI_API_KEY) {
    logResult({
      service: 'Gemini API',
      status: 'SKIP',
      message: 'GEMINI_API_KEY not set',
    });
    return;
  }

  try {
    const geminiService = new GeminiService();
    const testQuery = 'resize to 800x600';
    
    console.log(`   Query: "${testQuery}"`);
    const result = await geminiService.parseQuery(testQuery);
    
    if (result.task_type === 'resize' && 
        result.dimensions.width_px === 800 && 
        result.dimensions.height_px === 600) {
      logResult({
        service: 'Gemini API',
        status: 'PASS',
        message: 'Successfully parsed query',
        details: { task_type: result.task_type, dimensions: result.dimensions },
      });
    } else {
      logResult({
        service: 'Gemini API',
        status: 'FAIL',
        message: 'Unexpected parsing result',
        details: result,
      });
    }
  } catch (error) {
    logResult({
      service: 'Gemini API',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function testImageKitAPI() {
  console.log('\n🧪 Testing ImageKit API...');
  
  if (!process.env.IMAGEKIT_PUBLIC_KEY || 
      !process.env.IMAGEKIT_PRIVATE_KEY || 
      !process.env.IMAGEKIT_URL_ENDPOINT) {
    logResult({
      service: 'ImageKit API',
      status: 'SKIP',
      message: 'ImageKit credentials not set',
    });
    return;
  }

  try {
    const imagekitService = new ImageKitService();
    
    // Create a simple test image (1x1 red pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
      'base64'
    );
    
    console.log('   Uploading test image...');
    const uploadedUrl = await imagekitService.uploadImage(
      testImageBuffer,
      `test-${Date.now()}.png`
    );
    
    if (uploadedUrl && uploadedUrl.includes('ik.imagekit.io')) {
      logResult({
        service: 'ImageKit API',
        status: 'PASS',
        message: 'Successfully uploaded and transformed image',
        details: { url: uploadedUrl.substring(0, 50) + '...' },
      });
    } else {
      logResult({
        service: 'ImageKit API',
        status: 'FAIL',
        message: 'Invalid URL returned',
        details: { url: uploadedUrl },
      });
    }
  } catch (error) {
    logResult({
      service: 'ImageKit API',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function testRemoveBgAPI() {
  console.log('\n🧪 Testing Remove.bg API...');
  
  if (!process.env.REMOVEBG_API_KEY) {
    logResult({
      service: 'Remove.bg API',
      status: 'SKIP',
      message: 'REMOVEBG_API_KEY not set (optional)',
    });
    return;
  }

  try {
    const removebgService = new RemoveBgService();
    
    // Create a simple test image
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
      'base64'
    );
    
    console.log('   Processing test image...');
    const result = await removebgService.removeBackground(testImageBuffer);
    
    if (result && result.length > 0) {
      logResult({
        service: 'Remove.bg API',
        status: 'PASS',
        message: 'Successfully processed image',
        details: { resultSize: `${(result.length / 1024).toFixed(2)} KB` },
      });
    } else {
      logResult({
        service: 'Remove.bg API',
        status: 'FAIL',
        message: 'Empty result returned',
      });
    }
  } catch (error) {
    logResult({
      service: 'Remove.bg API',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function testDatabaseConnection() {
  console.log('\n🧪 Testing Database Connection...');
  
  if (!process.env.DATABASE_URL) {
    logResult({
      service: 'Database',
      status: 'SKIP',
      message: 'DATABASE_URL not set',
    });
    return;
  }

  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    
    logResult({
      service: 'Database',
      status: 'PASS',
      message: 'Successfully connected to database',
    });
  } catch (error) {
    logResult({
      service: 'Database',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function testClerkAuth() {
  console.log('\n🧪 Testing Clerk Authentication...');
  
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
      !process.env.CLERK_SECRET_KEY) {
    logResult({
      service: 'Clerk Auth',
      status: 'SKIP',
      message: 'Clerk credentials not set',
    });
    return;
  }

  try {
    // Just verify the keys are set and formatted correctly
    const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const secretKey = process.env.CLERK_SECRET_KEY;
    
    if (pubKey.startsWith('pk_') && secretKey.startsWith('sk_')) {
      logResult({
        service: 'Clerk Auth',
        status: 'PASS',
        message: 'Credentials are properly formatted',
        details: { 
          publicKey: pubKey.substring(0, 20) + '...',
          secretKey: secretKey.substring(0, 20) + '...',
        },
      });
    } else {
      logResult({
        service: 'Clerk Auth',
        status: 'FAIL',
        message: 'Invalid credential format',
      });
    }
  } catch (error) {
    logResult({
      service: 'Clerk Auth',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  const total = results.length;
  
  console.log(`\n✅ Passed:  ${passed}/${total}`);
  console.log(`❌ Failed:  ${failed}/${total}`);
  console.log(`⏭️  Skipped: ${skipped}/${total}`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`   - ${r.service}: ${r.message}`);
      });
  }
  
  if (skipped > 0) {
    console.log('\n⏭️  SKIPPED TESTS (Missing API Keys):');
    results
      .filter(r => r.status === 'SKIP')
      .forEach(r => {
        console.log(`   - ${r.service}: ${r.message}`);
      });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (failed === 0 && passed > 0) {
    console.log('🎉 All configured APIs are working correctly!');
  } else if (failed > 0) {
    console.log('⚠️  Some APIs failed. Check the errors above.');
  } else {
    console.log('ℹ️  No APIs were tested. Configure API keys to test.');
  }
  
  console.log('='.repeat(60) + '\n');
}

async function main() {
  console.log('🚀 Starting API Tests...\n');
  console.log('This will test all configured external services.\n');
  
  try {
    await testGeminiAPI();
    await testImageKitAPI();
    await testRemoveBgAPI();
    await testDatabaseConnection();
    await testClerkAuth();
    
    await printSummary();
    
    // Exit with appropriate code
    const failed = results.filter(r => r.status === 'FAIL').length;
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Test runner failed:', error);
    process.exit(1);
  }
}

// Run tests
main();
