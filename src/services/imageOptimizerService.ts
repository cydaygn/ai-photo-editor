import { manipulateAsync, SaveFormat, ActionResize } from 'expo-image-manipulator';
import { Image } from 'react-native';
import { OptimizedImageResult } from '../types/editor';

const MAX_LONG_EDGE = 1080;

/**
 * Gets image dimensions via Image.getSize if not already provided.
 */
export const getImageDimensions = (uri: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error)
    );
  });
};

/**
 * Optimizes an image to protect device memory (RAM) and prevent Out Of Memory (OOM)
 * crashes on Android with 12MP+ or 4K+ camera photos.
 * 
 * If the longest edge exceeds 1080px, it proportionally resizes it to 1080px
 * while preserving aspect ratio.
 */
export async function optimizeImageForEditing(
  sourceUri: string,
  providedWidth?: number,
  providedHeight?: number
): Promise<OptimizedImageResult> {
  let width = providedWidth || 0;
  let height = providedHeight || 0;

  // If dimensions were not provided by the picker, measure them
  if (!width || !height) {
    try {
      const dimensions = await getImageDimensions(sourceUri);
      width = dimensions.width;
      height = dimensions.height;
    } catch (e) {
      console.warn('[ImageOptimizer] Could not determine dimensions, fallback to 1080px width resize:', e);
      width = 2000;
      height = 2000;
    }
  }

  const originalWidth = width;
  const originalHeight = height;
  const longestEdge = Math.max(width, height);

  // If image already fits comfortably in RAM budget
  if (longestEdge <= MAX_LONG_EDGE) {
    return {
      uri: sourceUri,
      width,
      height,
      originalWidth,
      originalHeight,
      isResized: false,
    };
  }

  // Calculate target resize action while strictly preserving aspect ratio
  const resizeAction: ActionResize = {};
  let targetWidth = width;
  let targetHeight = height;

  if (width >= height) {
    targetWidth = MAX_LONG_EDGE;
    targetHeight = Math.round((height * MAX_LONG_EDGE) / width);
    resizeAction.resize = { width: MAX_LONG_EDGE };
  } else {
    targetHeight = MAX_LONG_EDGE;
    targetWidth = Math.round((width * MAX_LONG_EDGE) / height);
    resizeAction.resize = { height: MAX_LONG_EDGE };
  }

  // Execute on-device manipulation using native C++/Android Bitmap pipeline
  const result = await manipulateAsync(
    sourceUri,
    [resizeAction],
    {
      compress: 0.95,
      format: SaveFormat.PNG, // PNG to allow seamless background removal transparency
    }
  );

  return {
    uri: result.uri,
    width: targetWidth,
    height: targetHeight,
    originalWidth,
    originalHeight,
    isResized: true,
  };
}
