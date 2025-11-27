/**
 * Automated Feature Testing Script
 * Run all feature tests and generate a report
 */

import { GeminiService } from '../lib/gemini.service';

interface TestResult {
  feature: string;
  test: string;
  query: string;
  passed: boolean;
  expected: any;
  actual: any;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(
  feature: string,
  test: string,
  query: string,
  validator: (result: any) => boolean,
  expectedDescription: string
) {
  console.log(`\n🧪 Testing: ${feature} - ${test}`);
  console.log(`   Query: "${query}"`);

  try {
    const geminiService = new GeminiService(process.env.GEMINI_API_KEY);
    const result = await geminiService.parseQuery(query);
    
    const passed = validator(result);
    
    results.push({
      feature,
      test,
      query,
      passed,
      expected: expectedDescription,
      actual: result,
    });

    if (passed) {
      console.log(`   ✅ PASSED`);
    } else {
      console.log(`   ❌ FAILED`);
      console.log(`   Expected: ${expectedDescription}`);
      console.log(`   Got:`, JSON.stringify(result, null, 2));
    }

    return passed;
  } catch (error) {
    console.log(`   ❌ ERROR: ${error}`);
    results.push({
      feature,
      test,
      query,
      passed: false,
      expected: expectedDescription,
      actual: null,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Automated Feature Tests\n');
  console.log('=' .repeat(60));

  let passed = 0;
  let failed = 0;

  // Feature 1: Resize
  console.log('\n📐 FEATURE 1: RESIZE');
  if (await runTest(
    'Resize',
    'Resize to pixels',
    'resize to 1280x720',
    (r) => r.dimensions.width_px === 1280 && r.dimensions.height_px === 720,
    '1280x720 pixels'
  )) passed++; else failed++;

  if (await runTest(
    'Resize',
    'Resize to millimeters',
    'resize to 35mm x 45mm',
    (r) => r.dimensions.width_mm === 35 && r.dimensions.height_mm === 45,
    '35mm x 45mm'
  )) passed++; else failed++;

  // Feature 2: Format Conversion
  console.log('\n📦 FEATURE 2: FORMAT CONVERSION');
  if (await runTest(
    'Format',
    'Convert to PNG',
    'convert to PNG',
    (r) => r.format === 'png',
    'PNG format'
  )) passed++; else failed++;

  if (await runTest(
    'Format',
    'Convert to JPG',
    'save as JPG',
    (r) => r.format === 'jpg',
    'JPG format'
  )) passed++; else failed++;

  if (await runTest(
    'Format',
    'Convert to WebP',
    'convert to WebP',
    (r) => r.format === 'webp',
    'WebP format'
  )) passed++; else failed++;

  // Feature 3: Compression
  console.log('\n🗜️  FEATURE 3: COMPRESSION');
  if (await runTest(
    'Compression',
    'Compress to 10KB',
    'compress this image into 10kb',
    (r) => r.max_file_size_mb && r.max_file_size_mb < 0.02 && r.format === 'jpg',
    '~0.01MB with JPG format'
  )) passed++; else failed++;

  if (await runTest(
    'Compression',
    'Compress to 500KB',
    'compress to 500KB',
    (r) => r.max_file_size_mb && r.max_file_size_mb > 0.4 && r.max_file_size_mb < 0.6,
    '~0.5MB'
  )) passed++; else failed++;

  // Feature 4: Rotation
  console.log('\n🔄 FEATURE 4: ROTATION');
  if (await runTest(
    'Rotation',
    'Rotate 90 degrees',
    'rotate 90 degrees',
    (r) => r.effects?.rotation === 90,
    '90 degrees'
  )) passed++; else failed++;

  if (await runTest(
    'Rotation',
    'Rotate 45 degrees',
    'rotate image 45 degrees',
    (r) => r.effects?.rotation === 45,
    '45 degrees'
  )) passed++; else failed++;

  // Feature 5: Flip
  console.log('\n🔃 FEATURE 5: FLIP/MIRROR');
  if (await runTest(
    'Flip',
    'Flip horizontally',
    'flip horizontally',
    (r) => r.effects?.flip === 'horizontal',
    'horizontal flip'
  )) passed++; else failed++;

  if (await runTest(
    'Flip',
    'Flip vertically',
    'flip vertical',
    (r) => r.effects?.flip === 'vertical',
    'vertical flip'
  )) passed++; else failed++;

  // Feature 6: Grayscale
  console.log('\n⚫ FEATURE 6: GRAYSCALE');
  if (await runTest(
    'Grayscale',
    'Make grayscale',
    'make it grayscale',
    (r) => r.effects?.grayscale === true,
    'grayscale enabled'
  )) passed++; else failed++;

  if (await runTest(
    'Grayscale',
    'Black and white',
    'convert to black and white',
    (r) => r.effects?.grayscale === true,
    'grayscale enabled'
  )) passed++; else failed++;

  // Feature 7: Blur
  console.log('\n🌫️  FEATURE 7: BLUR');
  if (await runTest(
    'Blur',
    'Add blur',
    'add blur',
    (r) => r.effects?.blur && r.effects.blur > 0,
    'blur > 0'
  )) passed++; else failed++;

  // Feature 8: Sharpen
  console.log('\n🔪 FEATURE 8: SHARPEN');
  if (await runTest(
    'Sharpen',
    'Sharpen image',
    'sharpen the image',
    (r) => r.effects?.sharpen && r.effects.sharpen > 0,
    'sharpen > 0'
  )) passed++; else failed++;

  // Feature 9: Contrast
  console.log('\n🎚️  FEATURE 9: CONTRAST');
  if (await runTest(
    'Contrast',
    'Increase contrast',
    'increase contrast',
    (r) => r.effects?.contrast && r.effects.contrast > 0,
    'contrast > 0'
  )) passed++; else failed++;

  if (await runTest(
    'Contrast',
    'Decrease contrast',
    'decrease contrast',
    (r) => r.effects?.contrast && r.effects.contrast < 0,
    'contrast < 0'
  )) passed++; else failed++;

  // Feature 10: DPI
  console.log('\n📊 FEATURE 10: DPI/RESOLUTION');
  if (await runTest(
    'DPI',
    'Set 300 DPI',
    'set resolution to 300 DPI',
    (r) => r.dpi === 300,
    '300 DPI'
  )) passed++; else failed++;

  // Feature 11: Passport Photos
  console.log('\n🛂 FEATURE 11: PASSPORT PHOTOS');
  if (await runTest(
    'Passport',
    'Standard passport',
    'convert to passport photo',
    (r) => r.task_type === 'passport_photo' && 
           r.dimensions.width_mm === 35 && 
           r.dimensions.height_mm === 45 &&
           r.dpi === 300,
    '35x45mm, 300 DPI'
  )) passed++; else failed++;

  if (await runTest(
    'Passport',
    'US passport',
    'US passport photo',
    (r) => r.dimensions.width_mm === 51 && r.dimensions.height_mm === 51,
    '51x51mm (2x2 inch)'
  )) passed++; else failed++;

  // Feature 12: Combined Operations
  console.log('\n🔗 FEATURE 12: COMBINED OPERATIONS');
  if (await runTest(
    'Combined',
    'Resize and rotate',
    'resize to 800x600 and rotate 90 degrees',
    (r) => r.dimensions.width_px === 800 && 
           r.dimensions.height_px === 600 && 
           r.effects?.rotation === 90,
    '800x600 + 90° rotation'
  )) passed++; else failed++;

  if (await runTest(
    'Combined',
    'Flip and grayscale',
    'flip horizontally and make it grayscale',
    (r) => r.effects?.flip === 'horizontal' && r.effects?.grayscale === true,
    'horizontal flip + grayscale'
  )) passed++; else failed++;

  // Feature 13: Background
  console.log('\n🎨 FEATURE 13: BACKGROUND COLORS');
  if (await runTest(
    'Background',
    'White background',
    'white background',
    (r) => r.background === 'white',
    'white background'
  )) passed++; else failed++;

  if (await runTest(
    'Background',
    'Blue background',
    'blue background',
    (r) => r.background === 'blue',
    'blue background'
  )) passed++; else failed++;

  // Print Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  // Print Failed Tests
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:\n');
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`   ${r.feature} - ${r.test}`);
        console.log(`   Query: "${r.query}"`);
        console.log(`   Expected: ${r.expected}`);
        if (r.error) {
          console.log(`   Error: ${r.error}`);
        }
        console.log('');
      });
  }

  // Save results to file
  const fs = require('fs');
  const reportPath = './test-results.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Full results saved to: ${reportPath}`);

  console.log('\n' + '='.repeat(60));
  
  return { passed, failed, total: passed + failed };
}

// Run tests
runAllTests()
  .then(({ passed, failed, total }) => {
    process.exit(failed > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
