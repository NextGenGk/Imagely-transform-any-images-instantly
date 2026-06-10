/**
 * GeminiService - Natural Language Processing service using Google Gemini API
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ImageProcessingSpec } from './types';

/**
 * Service class for parsing natural language queries into structured image processing specifications
 */
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY = 1000; // 1 second

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is required');
    }
    this.genAI = new GoogleGenerativeAI(key);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  /**
   * Parse a natural language query into an ImageProcessingSpec
   * Requirements: 11.1, 11.2
   */
  async parseQuery(query: string): Promise<ImageProcessingSpec> {
    if (!query || query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }

    const prompt = this.buildPrompt(query);
    
    // Implement retry logic with exponential backoff
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Validate and sanitize the response
        return this.validateResponse(text);
      } catch (error) {
        lastError = error as Error;
        
        // If this is the last attempt, throw the error
        if (attempt === this.MAX_RETRIES - 1) {
          throw new Error(`Gemini API failed after ${this.MAX_RETRIES} attempts: ${lastError.message}`);
        }
        
        // Calculate exponential backoff delay
        const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }
    
    // This should never be reached, but TypeScript needs it
    throw new Error(`Gemini API failed: ${lastError?.message}`);
  }

  /**
   * Build the prompt with parsing rules and JSON schema
   * Requirements: 11.1, 11.5
   */
  private buildPrompt(query: string): string {
    return `You are an expert image processing specification parser. Your task is to convert natural language queries into structured JSON specifications for image processing.

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON - no explanations, no markdown, no code blocks, no additional text
2. The response must be pure JSON that can be directly parsed
3. Do not wrap the JSON in markdown code blocks or any other formatting

INPUT QUERY: "${query}"

PARSING RULES:

1. TASK TYPE DETECTION:
   - "passport", "passport-size", "passport photo" → task_type: "passport_photo"
   - "resize", "dimensions", "size" → task_type: "resize"
   - "compress", "reduce size", "smaller file" → task_type: "compress"
   - "background", "remove background", "change background" → task_type: "background_change"
   - "enhance", "improve", "quality" → task_type: "enhance"
   - "convert to", "save as", "format" → task_type: "format_change"
   - If unclear or multiple operations → task_type: "custom"

2. PASSPORT PHOTO PRESETS:
   - Standard passport: width_mm=35, height_mm=45, dpi=300, background="white", format="jpg", all face_requirements=true
   - US passport or "2x2 inch": width_mm=51, height_mm=51, dpi=300, background="white", format="jpg", all face_requirements=true
   - Custom parameters override defaults

3. DIMENSION PARSING:
   - Pixel format "1280x720" or "1280 x 720 pixels" → width_px, height_px
   - Millimeter format "35mm x 45mm" → width_mm, height_mm
   - Inch format "2x2 inch" → convert to mm (1 inch = 25.4mm) → width_mm, height_mm
   - If units unclear, infer from magnitude (>100 likely pixels, <100 likely mm)

4. DPI/PPI EXTRACTION:
   - Look for numbers followed by "dpi", "ppi", "DPI", "PPI"
   - Extract numeric value and set dpi field

5. FILE SIZE CONSTRAINTS:
   - "under XMB", "less than XMB", "max XMB" → max_file_size_mb: X
   - "compress to XKB", "XKB file size" → max_file_size_mb: X/1024
   - "compress to XKB" where X < 100 → also suggest format: "jpg" for better compression
   - "compress" without size → max_file_size_mb: 1
   - For very small sizes (< 50KB), aggressive compression is needed

6. BACKGROUND HANDLING:
   - "remove background", "transparent background", "no background" → background: "transparent"
   - For ANY color request (e.g. "white", "blue", "light rose gradient color", "dark red"): YOU MUST CONVERT THE COLOR TO A 6-CHARACTER HEX CODE (e.g., "FFFFFF", "0000FF", "FFB6C1", "8B0000").
   - NEVER output color names or descriptions. ONLY output "transparent" or a 6-character hex code (without the #).
   - No mention → background: null

7. FORMAT EXTRACTION:
   - "JPG", "JPEG", "jpg", "jpeg" → format: "jpg"
   - "PNG", "png" → format: "png"
   - "WebP", "webp" → format: "webp"
   - Normalize "jpeg" to "jpg"

8. EFFECTS PARSING:
   - "rotate X degrees", "rotation X" → effects.rotation: X (0-360)
   - "flip horizontal", "mirror" → effects.flip: "horizontal"
   - "flip vertical", "upside down" → effects.flip: "vertical"
   - "blur", "add blur" → effects.blur: 50 (default medium blur)
   - "grayscale", "black and white", "monochrome" → effects.grayscale: true
   - "sharpen", "make sharper" → effects.sharpen: 50 (default medium sharpen)
   - "increase contrast", "more contrast" → effects.contrast: 50
10. IMAGEKIT PARAMETERS & AI TRANSFORMATIONS:
   - Map requests for specific ImageKit transformations to the imagekit_parameters object.
   - For Aspect Ratio: "resize to 16:9" -> { "ar": "16-9" }
   - For Drop Shadow: "add drop shadow" -> { "e-dropshadow": "" }
   - For Generative Fill: "extend image with generative fill" -> { "bg-genfill": "" } (Optionally with prompt: { "bg-genfill-prompt": "flowers" })
   - For Change Background with AI: "change background to a snowy scene" -> { "e-changebg-prompt": "a snowy scene" }
   - For Edit Image with AI: "add some flair to this cake" -> { "e-edit-prompt": "add some flair to this cake" }
   - For Upscale: "upscale image" -> { "e-upscale": "" }
   - For Retouch: "retouch image" -> { "e-retouch": "" }
   - For Face Crop: "crop face" -> { "fo": "face" }
   - For Smart Crop: "smart crop" -> { "fo": "auto" }
   - Example: "resize to 16:9 aspect ratio" -> "imagekit_parameters": { "ar": "16-9" }
   - If no specific ImageKit parameters are needed, set to null.

11. NULL HANDLING:
   - If a field cannot be determined from the query, set it to null
   - Never omit required fields

JSON SCHEMA (all fields required):
{
  "task_type": "passport_photo" | "resize" | "compress" | "background_change" | "enhance" | "format_change" | "custom",
  "dimensions": {
    "width_mm": number | null,
    "height_mm": number | null,
    "width_px": number | null,
    "height_px": number | null
  },
  "dpi": number | null,
  "background": string | null ("transparent" or a 6-character hex code like "FFFFFF"),
  "face_requirements": {
    "shoulders_visible": boolean | null,
    "ears_visible": boolean | null,
    "centered_face": boolean | null,
    "no_tilt": boolean | null
  } | null,
  "max_file_size_mb": number | null,
  "format": "jpg" | "png" | "webp" | null,
  "effects": {
    "rotation": number | null (0-360 degrees),
    "flip": "horizontal" | "vertical" | "both" | null,
    "blur": number | null (1-100),
    "grayscale": boolean | null,
    "sharpen": number | null (1-100),
    "contrast": number | null (-100 to 100)
  } | null,
  "imagekit_parameters": Record<string, any> | null,
  "additional_notes": string | null
}

EXAMPLES:

Query: "convert this to a passport photo 300 ppi"
Response:
{"task_type":"passport_photo","dimensions":{"width_mm":35,"height_mm":45,"width_px":null,"height_px":null},"dpi":300,"background":"FFFFFF","face_requirements":{"shoulders_visible":true,"ears_visible":true,"centered_face":true,"no_tilt":true},"max_file_size_mb":null,"format":"jpg","imagekit_parameters":null,"additional_notes":null}

Query: "resize to 1280x720"
Response:
{"task_type":"resize","dimensions":{"width_mm":null,"height_mm":null,"width_px":1280,"height_px":720},"dpi":null,"background":null,"face_requirements":null,"max_file_size_mb":null,"format":null,"imagekit_parameters":null,"additional_notes":null}

Query: "resize to 16:9 aspect ratio"
Response:
{"task_type":"resize","dimensions":{"width_mm":null,"height_mm":null,"width_px":null,"height_px":null},"dpi":null,"background":null,"face_requirements":null,"max_file_size_mb":null,"format":null,"imagekit_parameters":{"ar":"16-9"},"additional_notes":null}

Query: "US passport photo with blue background"
Response:
{"task_type":"passport_photo","dimensions":{"width_mm":51,"height_mm":51,"width_px":null,"height_px":null},"dpi":300,"background":"0000FF","face_requirements":{"shoulders_visible":true,"ears_visible":true,"centered_face":true,"no_tilt":true},"max_file_size_mb":null,"format":"jpg","additional_notes":null}

Query: "change background from yellow to green"
Response:
{"task_type":"background_change","dimensions":{"width_mm":null,"height_mm":null,"width_px":null,"height_px":null},"dpi":null,"background":"00FF00","face_requirements":null,"max_file_size_mb":null,"format":null,"effects":null,"additional_notes":"Change background from yellow to green."}

Query: "rotate 90 degrees and make it grayscale"
Response:
{"task_type":"custom","dimensions":{"width_mm":null,"height_mm":null,"width_px":null,"height_px":null},"dpi":null,"background":null,"face_requirements":null,"max_file_size_mb":null,"format":null,"effects":{"rotation":90,"flip":null,"blur":null,"grayscale":true,"sharpen":null,"contrast":null},"additional_notes":null}

Query: "flip horizontally and sharpen"
Response:
{"task_type":"custom","dimensions":{"width_mm":null,"height_mm":null,"width_px":null,"height_px":null},"dpi":null,"background":null,"face_requirements":null,"max_file_size_mb":null,"format":null,"effects":{"rotation":null,"flip":"horizontal","blur":null,"grayscale":false,"sharpen":50,"contrast":null},"additional_notes":null}

Query: "compress to 500KB and convert to PNG"
Response:
{"task_type":"compress","dimensions":{"width_mm":null,"height_mm":null,"width_px":null,"height_px":null},"dpi":null,"background":null,"face_requirements":null,"max_file_size_mb":0.48828125,"format":"png","effects":null,"additional_notes":null}

Query: "compress this image into 10kb"
Response:
{"task_type":"compress","dimensions":{"width_mm":null,"height_mm":null,"width_px":null,"height_px":null},"dpi":null,"background":null,"face_requirements":null,"max_file_size_mb":0.009765625,"format":"jpg","effects":null,"additional_notes":"Aggressive compression to 10KB - quality and dimensions will be reduced"}

Now parse the input query and return ONLY the JSON response with no additional text:`;
  }

  /**
   * Validate and sanitize the Gemini API response
   * Requirements: 11.2
   */
  private validateResponse(responseText: string): ImageProcessingSpec {
    try {
      // Remove any markdown code blocks or extra formatting
      let cleanedText = responseText.trim();
      
      // Remove markdown code blocks if present
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      // Remove any leading/trailing whitespace again
      cleanedText = cleanedText.trim();
      
      // Parse the JSON
      const parsed = JSON.parse(cleanedText);
      
      // Validate required fields
      this.validateSchema(parsed);
      
      return parsed as ImageProcessingSpec;
    } catch (error) {
      throw new Error(`Failed to parse Gemini response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate that the parsed response matches the expected schema
   */
  private validateSchema(obj: any): void {
    const requiredFields = [
      'task_type',
      'dimensions',
      'dpi',
      'background',
      'face_requirements',
      'max_file_size_mb',
      'format',
      'imagekit_parameters',
      'additional_notes'
    ];

    for (const field of requiredFields) {
      if (!(field in obj)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate dimensions object
    if (typeof obj.dimensions !== 'object' || obj.dimensions === null) {
      throw new Error('dimensions must be an object');
    }

    const dimensionFields = ['width_mm', 'height_mm', 'width_px', 'height_px'];
    for (const field of dimensionFields) {
      if (!(field in obj.dimensions)) {
        throw new Error(`Missing required dimension field: ${field}`);
      }
    }

    // Validate task_type
    const validTaskTypes = [
      'passport_photo',
      'resize',
      'compress',
      'background_change',
      'enhance',
      'format_change',
      'custom'
    ];
    if (!validTaskTypes.includes(obj.task_type)) {
      throw new Error(`Invalid task_type: ${obj.task_type}`);
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
