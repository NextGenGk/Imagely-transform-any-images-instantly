/**
 * ImageKitService - Image processing service using ImageKit.io
 * Requirements: 10.2, 10.3, 10.4
 */

import ImageKit from 'imagekit';
import { ImageProcessingSpec, TransformationParams } from './types';

/**
 * Service class for uploading and transforming images using ImageKit.io
 */
export class ImageKitService {
  private imagekit: ImageKit;
  private readonly MAX_RETRIES = 2;
  private readonly RETRY_DELAY = 2000; // 2 seconds

  constructor(
    publicKey?: string,
    privateKey?: string,
    urlEndpoint?: string
  ) {
    const pubKey = publicKey || process.env.IMAGEKIT_PUBLIC_KEY;
    const privKey = privateKey || process.env.IMAGEKIT_PRIVATE_KEY;
    const endpoint = urlEndpoint || process.env.IMAGEKIT_URL_ENDPOINT;

    if (!pubKey || !privKey || !endpoint) {
      throw new Error(
        'ImageKit credentials are required: IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT'
      );
    }

    this.imagekit = new ImageKit({
      publicKey: pubKey,
      privateKey: privKey,
      urlEndpoint: endpoint,
    });
  }

  /**
   * Upload an image to ImageKit.io
   * Requirements: 10.2
   * 
   * @param file - Image file buffer
   * @param fileName - Name for the uploaded file
   * @returns URL of the uploaded image
   */
  async uploadImage(file: Buffer, fileName: string): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const result = await this.imagekit.upload({
          file: file,
          fileName: fileName,
          useUniqueFileName: true,
        });

        return result.url;
      } catch (error) {
        lastError = error as Error;

        // If this is the last attempt, throw the error
        if (attempt === this.MAX_RETRIES - 1) {
          throw new Error(
            `ImageKit upload failed after ${this.MAX_RETRIES} attempts: ${lastError.message}`
          );
        }

        // Wait before retrying
        await this.sleep(this.RETRY_DELAY);
      }
    }

    // This should never be reached, but TypeScript needs it
    throw new Error(`ImageKit upload failed: ${lastError?.message}`);
  }

  /**
   * Transform an image using ImageKit.io transformations
   * Requirements: 10.3, 10.4
   * 
   * @param imageUrl - URL of the image to transform
   * @param specs - Image processing specifications
   * @returns URL of the transformed image
   */
  async transformImage(
    imageUrl: string,
    specs: ImageProcessingSpec
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const transformations = this.buildTransformations(specs);
        
        // Build transformation string
        const transformationString = this.buildTransformationString(transformations);
        
        // Log the transformation for debugging
        console.log('ImageKit transformation:', transformationString);
        
        // Generate transformed URL
        const transformedUrl = this.imagekit.url({
          src: imageUrl,
          transformation: [transformationString],
        });

        console.log('Transformed URL:', transformedUrl);
        
        return transformedUrl;
      } catch (error) {
        lastError = error as Error;

        // If this is the last attempt, throw the error
        if (attempt === this.MAX_RETRIES - 1) {
          throw new Error(
            `ImageKit transformation failed after ${this.MAX_RETRIES} attempts: ${lastError.message}`
          );
        }

        // Wait before retrying
        await this.sleep(this.RETRY_DELAY);
      }
    }

    // This should never be reached, but TypeScript needs it
    throw new Error(`ImageKit transformation failed: ${lastError?.message}`);
  }

  /**
   * Build transformation parameters from ImageProcessingSpec
   * Requirements: 10.4
   * 
   * @param specs - Image processing specifications
   * @returns Transformation parameters for ImageKit
   */
  private buildTransformations(specs: ImageProcessingSpec): TransformationParams {
    const transformations: TransformationParams = {};

    console.log('Building transformations from specs:', JSON.stringify(specs, null, 2));

    // Handle dimensions
    if (specs.dimensions.width_px !== null && specs.dimensions.width_px > 0) {
      transformations.width = specs.dimensions.width_px;
      console.log('Set width:', transformations.width);
    }
    if (specs.dimensions.height_px !== null && specs.dimensions.height_px > 0) {
      transformations.height = specs.dimensions.height_px;
      console.log('Set height:', transformations.height);
    }

    // Convert mm dimensions to pixels if DPI is provided
    if (specs.dpi !== null && specs.dpi > 0) {
      if (specs.dimensions.width_mm !== null && specs.dimensions.width_mm > 0 && !transformations.width) {
        // Convert mm to inches, then to pixels: mm / 25.4 * dpi
        transformations.width = Math.round((specs.dimensions.width_mm / 25.4) * specs.dpi);
        console.log('Converted width from mm:', transformations.width);
      }
      if (specs.dimensions.height_mm !== null && specs.dimensions.height_mm > 0 && !transformations.height) {
        transformations.height = Math.round((specs.dimensions.height_mm / 25.4) * specs.dpi);
        console.log('Converted height from mm:', transformations.height);
      }
      
      // Set DPR for high-resolution output
      transformations.dpr = specs.dpi / 96; // 96 is standard screen DPI
      console.log('Set DPR:', transformations.dpr);
    }

    // Handle format
    if (specs.format !== null && specs.format.trim() !== '') {
      // Normalize format
      let format = specs.format.toLowerCase();
      if (format === 'jpeg') {
        format = 'jpg';
      }
      transformations.format = format;
      console.log('Set format:', transformations.format);
    } else if (specs.max_file_size_mb !== null && specs.max_file_size_mb > 0) {
      // If compressing but no format specified, use JPG for better compression
      transformations.format = 'jpg';
      console.log('Set format to JPG for compression:', transformations.format);
    }

    // Handle background
    if (specs.background !== null && specs.background !== 'original') {
      if (specs.background === 'transparent') {
        // For transparent background, we need to remove the background
        transformations.background = 'transparent';
        console.log('Set background: transparent');
      } else {
        // For color backgrounds - map common color names to hex codes
        const colorMap: Record<string, string> = {
          white: 'FFFFFF',
          black: '000000',
          blue: '0000FF',
          red: 'FF0000',
          green: '00FF00',
          yellow: 'FFFF00',
          gray: '808080',
          grey: '808080',
          lightblue: 'ADD8E6',
          darkblue: '00008B',
          lightgray: 'D3D3D3',
          lightgrey: 'D3D3D3',
        };
        
        const lowerColor = specs.background.toLowerCase();
        transformations.background = colorMap[lowerColor] || specs.background.replace('#', '');
        console.log('Set background color:', transformations.background);
      }
    }

    // Handle quality/compression based on max file size
    if (specs.max_file_size_mb !== null && specs.max_file_size_mb > 0) {
      // Estimate quality based on target file size
      // This is a rough heuristic - smaller target = lower quality
      const targetSizeMB = specs.max_file_size_mb;
      const targetSizeKB = targetSizeMB * 1024;
      
      console.log('Target file size:', targetSizeKB, 'KB');
      
      // For very small file sizes (< 50KB), we need aggressive compression
      if (targetSizeKB < 50) {
        transformations.quality = 30;
        // Also reduce dimensions if not specified
        if (!transformations.width && !transformations.height) {
          transformations.width = 800; // Reduce to 800px width
          console.log('Set width for compression:', transformations.width);
        }
      } else if (targetSizeKB < 100) {
        transformations.quality = 40;
        if (!transformations.width && !transformations.height) {
          transformations.width = 1024;
          console.log('Set width for compression:', transformations.width);
        }
      } else if (targetSizeKB < 500) {
        transformations.quality = 60;
        if (!transformations.width && !transformations.height) {
          transformations.width = 1280;
          console.log('Set width for compression:', transformations.width);
        }
      } else if (targetSizeKB < 1024) {
        transformations.quality = 75;
      } else if (targetSizeKB < 2048) {
        transformations.quality = 85;
      } else {
        transformations.quality = 90;
      }
      
      console.log('Set quality for target size:', transformations.quality);
    }

    // Handle effects
    if (specs.effects) {
      // Rotation
      if (specs.effects.rotation !== null && specs.effects.rotation !== undefined) {
        transformations.rotation = specs.effects.rotation;
        console.log('Set rotation:', transformations.rotation);
      }

      // Flip
      if (specs.effects.flip) {
        transformations.flip = specs.effects.flip;
        console.log('Set flip:', transformations.flip);
      }

      // Blur
      if (specs.effects.blur !== null && specs.effects.blur !== undefined && specs.effects.blur > 0) {
        transformations.blur = specs.effects.blur;
        console.log('Set blur:', transformations.blur);
      }

      // Grayscale
      if (specs.effects.grayscale === true) {
        transformations.grayscale = true;
        console.log('Set grayscale: true');
      }

      // Sharpen
      if (specs.effects.sharpen !== null && specs.effects.sharpen !== undefined && specs.effects.sharpen > 0) {
        transformations.sharpen = specs.effects.sharpen;
        console.log('Set sharpen:', transformations.sharpen);
      }

      // Contrast
      if (specs.effects.contrast !== null && specs.effects.contrast !== 0) {
        transformations.contrast = specs.effects.contrast;
        console.log('Set contrast:', transformations.contrast);
      }
    }

    console.log('Final transformations:', transformations);
    return transformations;
  }

  /**
   * Build transformation string from transformation parameters
   * 
   * @param transformations - Transformation parameters
   * @returns Transformation string for ImageKit URL
   */
  private buildTransformationString(transformations: TransformationParams): Record<string, string> {
    const result: Record<string, string> = {};

    if (transformations.width) {
      result.w = transformations.width.toString();
      console.log('Added w parameter:', result.w);
    }
    if (transformations.height) {
      result.h = transformations.height.toString();
      console.log('Added h parameter:', result.h);
    }
    if (transformations.dpr) {
      result.dpr = transformations.dpr.toFixed(2);
      console.log('Added dpr parameter:', result.dpr);
    }
    if (transformations.quality) {
      result.q = transformations.quality.toString();
      console.log('Added q parameter:', result.q);
    }
    if (transformations.format) {
      result.f = transformations.format;
      console.log('Added f parameter:', result.f);
    }
    
    // Handle background - only works for transparent images or with padding
    if (transformations.background && transformations.background !== 'transparent') {
      result.bg = transformations.background;
      console.log('Added bg parameter:', result.bg);
    }

    // Handle rotation
    if (transformations.rotation !== undefined && transformations.rotation !== null) {
      result.rt = transformations.rotation.toString();
      console.log('Added rt parameter:', result.rt);
    }

    // Handle flip
    if (transformations.flip) {
      // ImageKit uses negative rotation for flipping
      if (transformations.flip === 'horizontal') {
        result.rt = result.rt ? `${result.rt}:h` : '0:h'; // Horizontal flip
      } else if (transformations.flip === 'vertical') {
        result.rt = result.rt ? `${result.rt}:v` : '0:v'; // Vertical flip
      } else if (transformations.flip === 'both') {
        result.rt = result.rt ? `${result.rt}:hv` : '0:hv'; // Both
      }
      console.log('Added flip to rt parameter:', result.rt);
    }

    // Handle blur
    if (transformations.blur !== undefined && transformations.blur > 0) {
      result.bl = transformations.blur.toString();
      console.log('Added bl parameter:', result.bl);
    }

    // Handle grayscale
    if (transformations.grayscale === true) {
      result['e-grayscale'] = '';
      console.log('Added e-grayscale extension');
    }

    // Handle sharpen
    if (transformations.sharpen !== undefined && transformations.sharpen > 0) {
      result['e-sharpen'] = transformations.sharpen.toString();
      console.log('Added e-sharpen parameter:', result['e-sharpen']);
    }

    // Handle contrast
    if (transformations.contrast !== undefined && transformations.contrast !== 0) {
      result['e-contrast'] = transformations.contrast.toString();
      console.log('Added e-contrast parameter:', result['e-contrast']);
    }

    console.log('Final transformation string:', result);
    return result;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
