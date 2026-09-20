export type CaptionChunkCallback = (chunk: string | null) => void;

/**
 * TTSService: Text-To-Speech speech synthesis and teleprompter caption streamer.
 * Breaks speech responses into line-by-line fixed word count chunks (3-4 words per line)
 * displayed to the right of the mouth visualizer.
 */
export class TTSService {
  private static instance: TTSService;
  private captionTimer: ReturnType<typeof setInterval> | null = null;
  private activeCallback: CaptionChunkCallback | null = null;

  public static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  /**
   * Speaks text and streams caption chunks (fixed 3-4 words at a time).
   */
  public speakWithCaptions(
    text: string,
    onChunk: CaptionChunkCallback,
    wordsPerChunk: number = 4
  ): void {
    this.stop();

    this.activeCallback = onChunk;
    const words = text.trim().split(/\s+/);
    if (words.length === 0) return;

    // Group words into fixed chunks of `wordsPerChunk`
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += wordsPerChunk) {
      chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
    }

    let currentIdx = 0;
    // Emit first chunk immediately
    onChunk(chunks[0]);

    if (chunks.length <= 1) {
      // Single chunk speech response: clear caption after 2.5 seconds
      setTimeout(() => {
        if (this.activeCallback) {
          this.activeCallback(null);
          this.activeCallback = null;
        }
      }, 2500);
      return;
    }

    // Stream subsequent chunks every 1.2 seconds per 4-word chunk
    this.captionTimer = setInterval(() => {
      currentIdx++;
      if (currentIdx < chunks.length) {
        if (this.activeCallback) {
          this.activeCallback(chunks[currentIdx]);
        }
      } else {
        // Speech complete: stop interval and clear caption after 1.5 seconds
        if (this.captionTimer) {
          clearInterval(this.captionTimer);
          this.captionTimer = null;
        }
        setTimeout(() => {
          if (this.activeCallback) {
            this.activeCallback(null);
            this.activeCallback = null;
          }
        }, 1500);
      }
    }, 1200);
  }

  /**
   * Stop active speech and clear captions.
   */
  public stop(): void {
    if (this.captionTimer) {
      clearInterval(this.captionTimer);
      this.captionTimer = null;
    }
    if (this.activeCallback) {
      this.activeCallback(null);
      this.activeCallback = null;
    }
  }
}
