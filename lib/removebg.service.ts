/**
 * RemoveBgService - Background removal service using Remove.bg API
 * Handles background removal and replacement
 */

export class RemoveBgService {
  private apiKey: string;
  private readonly API_URL = 'https://api.remove.bg/v1.0/removebg';
  private readonly MAX_RETRIES = 2;
  private readonly RETRY_DELAY = 2000;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.REMOVEBG_API_KEY;
    if (!key) {
      throw new Error('REMOVEBG_API_KEY is required');
    }
    this.apiKey = key;
  }

  /**
   * Remove background from image
   * @param imageBuffer - Image file buffer
   * @param backgroundColor - Optional background color (hex without #)
   * @returns Buffer of processed image
   */
  async removeBackground(
    imageBuffer: Buffer,
    backgroundColor?: string
  ): Promise<Buffer> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(imageBuffer)]);
        formData.append('image_file', blob);
        formData.append('size', 'auto');

        // If background color is specified, add it
        if (backgroundColor && backgroundColor !== 'transparent') {
          formData.append('bg_color', backgroundColor);
        }

        const response = await fetch(this.API_URL, {
          method: 'POST',
          headers: {
            'X-Api-Key': this.apiKey,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Remove.bg API error: ${response.status} - ${errorText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.MAX_RETRIES - 1) {
          throw new Error(
            `Remove.bg failed after ${this.MAX_RETRIES} attempts: ${lastError.message}`
          );
        }

        await this.sleep(this.RETRY_DELAY);
      }
    }

    throw new Error(`Remove.bg failed: ${lastError?.message}`);
  }

  /**
   * Check if Remove.bg API is available
   */
  isAvailable(): boolean {
    return !!process.env.REMOVEBG_API_KEY;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
