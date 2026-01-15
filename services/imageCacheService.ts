import { Image } from 'react-native';
import { logger } from '@/utils/logger';

interface CacheEntry {
  uri: string;
  timestamp: number;
  size: number;
}

interface PreloadProgress {
  total: number;
  loaded: number;
  failed: number;
  percentage: number;
  currentUri: string | null;
}

type ProgressCallback = (progress: PreloadProgress) => void;
type CompletionCallback = (success: boolean, failedUris: string[]) => void;

class ImageCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private preloadQueue: Set<string> = new Set();
  private maxCacheSize = 50 * 1024 * 1024; // 50MB cache limit
  private currentCacheSize = 0;
  private isPreloading = false;

  /**
   * Extract all image URLs from exam data
   */
  extractImageUrls(exam: any): string[] {
    const urls = new Set<string>();

    // Extract question images
    if (exam.questions && Array.isArray(exam.questions)) {
      exam.questions.forEach((question: any) => {
        // Question main image
        if (question.imageUrl) {
          urls.add(this.normalizeUrl(question.imageUrl));
        }
        if (question.image) {
          urls.add(this.normalizeUrl(question.image));
        }

        // Option images
        if (question.optionImages && Array.isArray(question.optionImages)) {
          question.optionImages.forEach((imgUrl: string | null) => {
            if (imgUrl) {
              urls.add(this.normalizeUrl(imgUrl));
            }
          });
        }

        // Images in question text (markdown and HTML)
        if (question.text) {
          const textImages = this.extractImagesFromText(question.text);
          textImages.forEach((url) => urls.add(url));
        }

        // Images in options text
        if (question.options && Array.isArray(question.options)) {
          question.options.forEach((option: any) => {
            const optionText = typeof option === 'string' ? option : option?.text || '';
            if (optionText) {
              const optionImages = this.extractImagesFromText(optionText);
              optionImages.forEach((url) => urls.add(url));
            }
          });
        }
      });
    }

    return Array.from(urls);
  }

  /**
   * Extract image URLs from text (markdown and HTML)
   */
  private extractImagesFromText(text: string): string[] {
    const urls: string[] = [];

    // Markdown images: ![alt](url)
    const markdownRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = markdownRegex.exec(text)) !== null) {
      urls.push(this.normalizeUrl(match[2]));
    }

    // HTML images: <img src="url">
    const htmlRegex = /<img\s+(?:[^>]*?\s+)?src=["']([^"']+)["'][^>]*>/gi;
    while ((match = htmlRegex.exec(text)) !== null) {
      urls.push(this.normalizeUrl(match[1]));
    }

    return urls;
  }

  /**
   * Normalize URL to absolute format
   */
  private normalizeUrl(url: string): string {
    if (!url) return url;
    return url.startsWith('http') ? url : `https://jpjonline.com${url}`;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; count: number; entries: CacheEntry[] } {
    return {
      size: this.currentCacheSize,
      count: this.cache.size,
      entries: Array.from(this.cache.values()),
    };
  }

  /**
   * Check if image is cached
   */
  isCached(uri: string): boolean {
    return this.cache.has(uri);
  }

  /**
   * Preload images with progress tracking
   */
  async preloadImages(
    uris: string[],
    onProgress?: ProgressCallback,
    onComplete?: CompletionCallback,
    options: {
      maxConcurrent?: number;
      timeout?: number;
      stopAtPercentage?: number;
    } = {}
  ): Promise<void> {
    if (this.isPreloading) {
      logger.warn('ImageCacheService', 'Preload already in progress');
      return;
    }

    this.isPreloading = true;
    const {
      maxConcurrent = 3,
      timeout = 10000,
      stopAtPercentage = 100,
    } = options;

    const uniqueUris = [...new Set(uris.map((uri) => this.normalizeUrl(uri)))];
    const total = uniqueUris.length;
    let loaded = 0;
    let failed = 0;
    const failedUris: string[] = [];

    logger.info('ImageCacheService', 'Starting preload', {
      total,
      maxConcurrent,
      stopAtPercentage,
    });

    // Filter out already cached images
    const uncachedUris = uniqueUris.filter((uri) => !this.isCached(uri));
    const remainingToLoad = uncachedUris.length;

    logger.info('ImageCacheService', 'Cache status', {
      total,
      cached: total - remainingToLoad,
      toLoad: remainingToLoad,
    });

    // Update initial progress
    if (onProgress) {
      onProgress({
        total,
        loaded: total - remainingToLoad,
        failed,
        percentage: Math.round(((total - remainingToLoad) / total) * 100),
        currentUri: null,
      });
    }

    // If we already have enough cached images
    const currentPercentage = Math.round(((total - remainingToLoad) / total) * 100);
    if (currentPercentage >= stopAtPercentage) {
      logger.info('ImageCacheService', 'Already reached target percentage', {
        currentPercentage,
        targetPercentage: stopAtPercentage,
      });
      this.isPreloading = false;
      if (onComplete) onComplete(true, []);
      return;
    }

    // Calculate how many more we need to load
    const targetLoadCount = Math.ceil((stopAtPercentage / 100) * total);
    const neededToLoad = targetLoadCount - (total - remainingToLoad);

    logger.info('ImageCacheService', 'Preload targets', {
      targetLoadCount,
      neededToLoad,
      remainingToLoad,
    });

    // Preload images in batches
    const preloadBatch = async (uris: string[]): Promise<void> => {
      const promises = uris.map((uri) =>
        this.preloadSingleImage(uri, timeout)
          .then(() => {
            loaded++;
            if (onProgress) {
              onProgress({
                total,
                loaded,
                failed,
                percentage: Math.round(((loaded + failed) / total) * 100),
                currentUri: uri,
              });
            }
          })
          .catch((error) => {
            failed++;
            failedUris.push(uri);
            logger.warn('ImageCacheService', 'Failed to preload image', {
              uri,
              error: error.message,
            });
            if (onProgress) {
              onProgress({
                total,
                loaded,
                failed,
                percentage: Math.round(((loaded + failed) / total) * 100),
                currentUri: uri,
              });
            }
          })
      );

      await Promise.all(promises);
    };

    // Load images in batches of maxConcurrent
    for (let i = 0; i < uncachedUris.length; i += maxConcurrent) {
      // Check if we've reached the target percentage
      const currentLoaded = total - uncachedUris.length + loaded;
      const currentPercentage = Math.round((currentLoaded / total) * 100);

      if (currentPercentage >= stopAtPercentage) {
        logger.info('ImageCacheService', 'Reached target percentage', {
          currentPercentage,
          targetPercentage: stopAtPercentage,
          loaded: currentLoaded,
        });
        break;
      }

      const batch = uncachedUris.slice(i, i + maxConcurrent);
      await preloadBatch(batch);
    }

    this.isPreloading = false;

    const success = failed === 0 || failed < total * 0.1; // Allow 10% failure rate
    logger.info('ImageCacheService', 'Preload completed', {
      total,
      loaded,
      failed,
      success,
      failedUris,
    });

    if (onComplete) {
      onComplete(success, failedUris);
    }
  }

  /**
   * Preload a single image with timeout
   */
  private preloadSingleImage(uri: string, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout after ${timeout}ms`));
      }, timeout);

      Image.prefetch(uri)
        .then(() => {
          clearTimeout(timeoutId);
          
          // Add to cache
          this.cache.set(uri, {
            uri,
            timestamp: Date.now(),
            size: 0, // We don't have actual size info
          });

          resolve();
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    const stats = this.getCacheStats();
    logger.info('ImageCacheService', 'Clearing cache', stats);
    this.cache.clear();
    this.currentCacheSize = 0;
    // React Native's Image.prefetch handles caching automatically
    // No need to manually clear memory/disk cache
  }

  /**
   * Remove old cache entries
   */
  cleanupCache(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    let removed = 0;

    for (const [uri, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(uri);
        this.currentCacheSize -= entry.size;
        removed++;
      }
    }

    if (removed > 0) {
      logger.info('ImageCacheService', 'Cleaned up old cache entries', {
        removed,
        remaining: this.cache.size,
      });
    }
  }

  /**
   * Get preload queue status
   */
  isPreloadingImages(): boolean {
    return this.isPreloading;
  }

  /**
   * Cancel current preload
   */
  cancelPreload(): void {
    logger.info('ImageCacheService', 'Cancelling preload');
    this.isPreloading = false;
  }
}

// Export singleton instance
export const imageCacheService = new ImageCacheService();
export type { PreloadProgress, ProgressCallback, CompletionCallback };
