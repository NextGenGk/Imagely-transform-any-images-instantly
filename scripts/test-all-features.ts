import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { ImageKitService } from '../lib/imagekit.service';
import { ImageProcessingSpec } from '../lib/types';

// Polyfill fetch if needed (Node 18+ has it globally)
const fetchUrl = global.fetch;

async function testAllFeatures() {
  try {
    console.log('Testing All ImageKit Features...');
    const service = new ImageKitService();

    // 1. Upload a test image
    console.log('\n--- Step 1: Uploading Test Image ---');
    // Small 1x1 red pixel jpg
    const base64Image = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAAFgAAQAAAAAAAAAAAAAAAAAAAAQAAQAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAA//aAAgBAQAAPwB/AAAB//2Q==';
    const buffer = Buffer.from(base64Image, 'base64');
    const fileName = 'test-feature-check.jpg';

    const uploadedUrl = await service.uploadImage(buffer, fileName);
    console.log('Uploaded URL:', uploadedUrl);

    if (!uploadedUrl.includes('ik.imagekit.io')) {
      throw new Error('Upload failed or returned invalid URL');
    }

    // Helper to check URL accessibility
    const checkUrl = async (url: string, description: string) => {
      try {
        const res = await fetchUrl(url);
        if (res.status === 200) {
          console.log(`[PASS] ${description}: URL is accessible (200 OK)`);
          return true;
        } else {
          console.error(`[FAIL] ${description}: URL returned status ${res.status}`);
          return false;
        }
      } catch (e: any) {
        console.error(`[FAIL] ${description}: Request failed - ${e.message}`);
        return false;
      }
    };

    // 2. Test Resize
    console.log('\n--- Step 2: Testing Resize ---');
    const specResize: ImageProcessingSpec = {
      task_type: 'resize',
      dimensions: { width_px: 100, height_px: 100, width_mm: null, height_mm: null },
      dpi: null, background: null, face_requirements: null, max_file_size_mb: null, format: null, additional_notes: null
    };
    const urlResize = await service.transformImage(uploadedUrl, specResize);
    console.log('Resize URL:', urlResize);
    await checkUrl(urlResize, 'Resize (100x100)');

    // 3. Test Compression
    console.log('\n--- Step 3: Testing Compression ---');
    const specCompress: ImageProcessingSpec = {
      task_type: 'compress',
      dimensions: { width_px: null, height_px: null, width_mm: null, height_mm: null },
      dpi: null, background: null, face_requirements: null,
      max_file_size_mb: 0.01, // Very small to force compression
      format: 'jpg', additional_notes: null
    };
    const urlCompress = await service.transformImage(uploadedUrl, specCompress);
    console.log('Compress URL:', urlCompress);
    await checkUrl(urlCompress, 'Compression (Low Quality)');

    // 4. Test Format Change
    console.log('\n--- Step 4: Testing Format Change (to PNG) ---');
    const specFormat: ImageProcessingSpec = {
      task_type: 'format_change',
      dimensions: { width_px: null, height_px: null, width_mm: null, height_mm: null },
      dpi: null, background: null, face_requirements: null, max_file_size_mb: null,
      format: 'png', additional_notes: null
    };
    const urlFormat = await service.transformImage(uploadedUrl, specFormat);
    console.log('Format URL:', urlFormat);
    await checkUrl(urlFormat, 'Format Change (PNG)');

    // 5. Test Background Removal
    console.log('\n--- Step 5: Testing Background Removal ---');
    const specBg: ImageProcessingSpec = {
      task_type: 'background_change',
      dimensions: { width_px: null, height_px: null, width_mm: null, height_mm: null },
      dpi: null,
      background: 'transparent',
      face_requirements: null, max_file_size_mb: null, format: 'png', additional_notes: null
    };
    const urlBg = await service.transformImage(uploadedUrl, specBg);
    console.log('Bg Remove URL:', urlBg);
    await checkUrl(urlBg, 'Background Removal (Transparent)');

    // 6. Test Background Color
    console.log('\n--- Step 6: Testing Background Color (Blue) ---');
    const specBgColor: ImageProcessingSpec = {
      task_type: 'background_change',
      dimensions: { width_px: null, height_px: null, width_mm: null, height_mm: null },
      dpi: null,
      background: 'blue',
      face_requirements: null, max_file_size_mb: null, format: 'jpg', additional_notes: null
    };
    const urlBgColor = await service.transformImage(uploadedUrl, specBgColor);
    console.log('Bg Color URL:', urlBgColor);
    await checkUrl(urlBgColor, 'Background Change (Blue)');

    // 7. Test Upscale
    console.log('\n--- Step 7: Testing Upscale ---');
    const specUpscale: ImageProcessingSpec = {
      task_type: 'upscale',
      dimensions: { width_px: null, height_px: null, width_mm: null, height_mm: null },
      dpi: null, background: null, face_requirements: null, max_file_size_mb: null, format: null, additional_notes: null
    };
    const urlUpscale = await service.transformImage(uploadedUrl, specUpscale);
    console.log('Upscale URL:', urlUpscale);
    await checkUrl(urlUpscale, 'Upscale');

    // 8. Test Drop Shadow
    console.log('\n--- Step 8: Testing Drop Shadow ---');
    const specShadow: ImageProcessingSpec = {
      task_type: 'enhance',
      dimensions: { width_px: null, height_px: null, width_mm: null, height_mm: null },
      dpi: null, background: null, face_requirements: null, max_file_size_mb: null, format: null, additional_notes: null,
      effects: {
        drop_shadow: { enabled: true, top: 10, left: 10, blur: 5, opacity: 50, color: 'black' }
      }
    };
    const urlShadow = await service.transformImage(uploadedUrl, specShadow);
    console.log('Drop Shadow URL:', urlShadow);
    await checkUrl(urlShadow, 'Drop Shadow');

    // 9. Test Smart Crop (Focus)
    console.log('\n--- Step 9: Testing Smart Crop (Auto Focus) ---');
    const specSmartCrop: ImageProcessingSpec = {
      task_type: 'smart_crop',
      dimensions: { width_px: 200, height_px: 200, width_mm: null, height_mm: null },
      dpi: null, background: null, face_requirements: null, max_file_size_mb: null, format: null, additional_notes: null
    };
    const urlSmartCrop = await service.transformImage(uploadedUrl, specSmartCrop);
    console.log('Smart Crop URL:', urlSmartCrop);
    await checkUrl(urlSmartCrop, 'Smart Crop (200x200 Auto Focus)');

    // 10. Test Generative Fill
    console.log('\n--- Step 10: Testing Generative Fill ---');
    const specGenFill: ImageProcessingSpec = {
      task_type: 'generative_fill',
      dimensions: { width_px: null, height_px: null, width_mm: null, height_mm: null },
      dpi: null, background: null, face_requirements: null, max_file_size_mb: null, format: null, additional_notes: null
    };
    const urlGenFill = await service.transformImage(uploadedUrl, specGenFill);
    console.log('Generative Fill URL:', urlGenFill);
    await checkUrl(urlGenFill, 'Generative Fill');

  } catch (error: any) {
    console.error('Test Suite Failed:', error.message);
  }
}

testAllFeatures();
