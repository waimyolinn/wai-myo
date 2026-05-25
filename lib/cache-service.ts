/**
 * Offline Caching Service
 * Network-first strategy with 100MB cache limit and 7-day auto-clear
 */

import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_DIR = `${(FileSystem as any).cacheDirectory || ""}mibamyitta-cache/`;
const CACHE_METADATA_KEY = "cache_metadata";
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
const CACHE_EXPIRY_DAYS = 7;
const MAX_CACHED_IMAGES = 50;

interface CacheMetadata {
  url: string;
  timestamp: number;
  size: number;
  filename: string;
}

interface CacheInfo {
  images: CacheMetadata[];
  totalSize: number;
  lastCleared: number;
}

/**
 * Initialize cache directory
 */
export async function initializeCache(): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }

    // Check if cache needs clearing
    await clearExpiredCache();
  } catch (error) {
    console.error("Error initializing cache:", error);
  }
}

/**
 * Get cache metadata
 */
async function getCacheMetadata(): Promise<CacheInfo> {
  try {
    const metadata = await AsyncStorage.getItem(CACHE_METADATA_KEY);
    return metadata
      ? JSON.parse(metadata)
      : { images: [], totalSize: 0, lastCleared: Date.now() };
  } catch (error) {
    console.error("Error reading cache metadata:", error);
    return { images: [], totalSize: 0, lastCleared: Date.now() };
  }
}

/**
 * Save cache metadata
 */
async function saveCacheMetadata(info: CacheInfo): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(info));
  } catch (error) {
    console.error("Error saving cache metadata:", error);
  }
}

/**
 * Clear expired cache (older than 7 days)
 */
async function clearExpiredCache(): Promise<void> {
  try {
    const info = await getCacheMetadata();
    const now = Date.now();
    const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    const expiredImages = info.images.filter(
      (img) => now - img.timestamp > expiryTime
    );

    for (const img of expiredImages) {
      try {
        await FileSystem.deleteAsync(`${CACHE_DIR}${img.filename}`);
      } catch (e) {
        console.warn(`Failed to delete cached file: ${img.filename}`);
      }
    }

    if (expiredImages.length > 0) {
      info.images = info.images.filter(
        (img) => !expiredImages.find((exp) => exp.url === img.url)
      );
      info.totalSize = info.images.reduce((sum, img) => sum + img.size, 0);
      await saveCacheMetadata(info);
    }
  } catch (error) {
    console.error("Error clearing expired cache:", error);
  }
}

/**
 * Enforce cache size limit by removing oldest images
 */
async function enforceCacheLimit(info: CacheInfo): Promise<void> {
  try {
    // Remove oldest images if cache exceeds limit
    while (info.totalSize > MAX_CACHE_SIZE && info.images.length > 0) {
      // Sort by timestamp (oldest first)
      info.images.sort((a, b) => a.timestamp - b.timestamp);
      const oldest = info.images.shift();

      if (oldest) {
        try {
          await FileSystem.deleteAsync(`${CACHE_DIR}${oldest.filename}`);
          info.totalSize -= oldest.size;
        } catch (e) {
          console.warn(`Failed to delete oldest cached file: ${oldest.filename}`);
        }
      }
    }

    // Keep only last 50 images
    if (info.images.length > MAX_CACHED_IMAGES) {
      const toRemove = info.images.splice(0, info.images.length - MAX_CACHED_IMAGES);
      for (const img of toRemove) {
        try {
          await FileSystem.deleteAsync(`${CACHE_DIR}${img.filename}`);
          info.totalSize -= img.size;
        } catch (e) {
          console.warn(`Failed to delete cache file: ${img.filename}`);
        }
      }
    }

    await saveCacheMetadata(info);
  } catch (error) {
    console.error("Error enforcing cache limit:", error);
  }
}

/**
 * Get cached image or fetch from network
 * Network-first strategy: try network first, fallback to cache
 */
export async function getCachedImage(url: string): Promise<string | null> {
  try {
    // Try to fetch from network first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        // Use standard Buffer-like conversion if available or standard btoa
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        // Cache the image
        await cacheImage(url, base64, blob.size);
        return `data:image/jpeg;base64,${base64}`;
      }
    } catch (networkError) {
      console.warn(`Network fetch failed for ${url}, trying cache:`, networkError);
    }

    // Fallback to cache
    const cachedPath = await getCachedImagePath(url);
    if (cachedPath) {
      const base64 = await FileSystem.readAsStringAsync(cachedPath, {
        encoding: "base64" as any,
      });
      return `data:image/jpeg;base64,${base64}`;
    }

    return null;
  } catch (error) {
    console.error(`Error getting cached image for ${url}:`, error);
    return null;
  }
}

/**
 * Cache image locally
 */
async function cacheImage(
  url: string,
  base64Data: string,
  size: number
): Promise<void> {
  try {
    const filename = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const filepath = `${CACHE_DIR}${filename}`;

    await FileSystem.writeAsStringAsync(filepath, base64Data, {
      encoding: "base64" as any,
    });

    const info = await getCacheMetadata();
    info.images.push({
      url,
      timestamp: Date.now(),
      size,
      filename,
    });
    info.totalSize += size;

    await enforceCacheLimit(info);
    await saveCacheMetadata(info);
  } catch (error) {
    console.error(`Error caching image from ${url}:`, error);
  }
}

/**
 * Get cached image file path
 */
async function getCachedImagePath(url: string): Promise<string | null> {
  try {
    const info = await getCacheMetadata();
    const cached = info.images.find((img) => img.url === url);
    return cached ? `${CACHE_DIR}${cached.filename}` : null;
  } catch (error) {
    console.error("Error getting cached image path:", error);
    return null;
  }
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<void> {
  try {
    await FileSystem.deleteAsync(CACHE_DIR);
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    await AsyncStorage.removeItem(CACHE_METADATA_KEY);
  } catch (error) {
    console.error("Error clearing all cache:", error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalSize: number;
  imageCount: number;
  maxSize: number;
}> {
  try {
    const info = await getCacheMetadata();
    return {
      totalSize: info.totalSize,
      imageCount: info.images.length,
      maxSize: MAX_CACHE_SIZE,
    };
  } catch (error) {
    console.error("Error getting cache stats:", error);
    return { totalSize: 0, imageCount: 0, maxSize: MAX_CACHE_SIZE };
  }
}
