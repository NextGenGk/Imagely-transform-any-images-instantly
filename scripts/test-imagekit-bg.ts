import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { ImageKitService } from '../lib/imagekit.service';
import { ImageProcessingSpec } from '../lib/types';

async function testImageKitBg() {
    try {
        console.log('Testing ImageKitService Background Removal...');

        const service = new ImageKitService();

        // Test 1: Transparent Background
        const specTransparent: ImageProcessingSpec = {
            task_type: 'background_change',
            dimensions: { width_mm: null, height_mm: null, width_px: null, height_px: null },
            dpi: null,
            background: 'transparent',
            face_requirements: null,
            max_file_size_mb: null,
            format: 'png',
            additional_notes: null
        };

        console.log('\nTest 1: Transparent Background');
        // @ts-ignore - Accessing private method for testing
        const transforms1 = service.buildTransformations(specTransparent);
        // @ts-ignore
        const string1 = service.buildTransformationString(transforms1);

        if (string1.raw === 'e-bgremove' && string1.bg === undefined) {
            console.log('PASS: Correctly set e-bgremove for transparent background');
        } else {
            console.error('FAIL: Incorrect transformations for transparent background', string1);
        }

        // Test 2: Color Background (Red)
        const specColor: ImageProcessingSpec = {
            task_type: 'background_change',
            dimensions: { width_mm: null, height_mm: null, width_px: null, height_px: null },
            dpi: null,
            background: 'red',
            face_requirements: null,
            max_file_size_mb: null,
            format: 'jpg',
            additional_notes: null
        };

        console.log('\nTest 2: Color Background (Red)');
        // @ts-ignore
        const transforms2 = service.buildTransformations(specColor);
        // @ts-ignore
        const string2 = service.buildTransformationString(transforms2);

        if (string2.raw === 'e-bgremove' && string2.bg === 'FF0000') {
            console.log('PASS: Correctly set e-bgremove and bg color for red background');
        } else {
            console.error('FAIL: Incorrect transformations for red background', string2);
        }

        // Test 3: Original Background (No Change)
        const specOriginal: ImageProcessingSpec = {
            task_type: 'compress',
            dimensions: { width_mm: null, height_mm: null, width_px: null, height_px: null },
            dpi: null,
            background: 'original',
            face_requirements: null,
            max_file_size_mb: null,
            format: 'jpg',
            additional_notes: null
        };

        console.log('\nTest 3: Original Background');
        // @ts-ignore
        const transforms3 = service.buildTransformations(specOriginal);
        // @ts-ignore
        const string3 = service.buildTransformationString(transforms3);

        if (string3.raw === undefined && string3.bg === undefined) {
            console.log('PASS: No background transformations for original background');
        } else {
            console.error('FAIL: Incorrect transformations for original background', string3);
        }

    } catch (error: any) {
        console.error('Test failed:', error.message);
    }
}

testImageKitBg();
