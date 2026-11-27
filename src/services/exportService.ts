import * as MediaLibrary from 'expo-media-library';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export interface SaveResult {
  success: boolean;
  uri?: string;
  error?: string;
}

/**
 * Saves the edited photo to the device gallery using expo-media-library.
 * Formats transparent images as PNG, and opaque images as high-quality JPEG.
 */
export async function savePhotoToGallery(
  imageUri: string,
  isTransparent: boolean = false
): Promise<SaveResult> {
  try {
    // 1. Request MediaLibrary permissions
    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();

    if (status !== 'granted') {
      return {
        success: false,
        error: canAskAgain
          ? 'Galeriye kaydetmek için lütfen depolama izni verin.'
          : 'Galeri izni reddedildi. Lütfen cihaz ayarlarından izinleri etkinleştirin.',
      };
    }

    // 2. Prepare high quality export file
    let finalUri = imageUri;

    // Normalize format
    const format = isTransparent ? SaveFormat.PNG : SaveFormat.JPEG;
    const compression = isTransparent ? 1.0 : 0.98;

    const manipulated = await manipulateAsync(
      imageUri,
      [],
      {
        compress: compression,
        format,
      }
    );
    finalUri = manipulated.uri;

    // 3. Save to Media Library
    const asset = await MediaLibrary.createAssetAsync(finalUri);

    // 4. Save to custom album "AI Photo Editor"
    try {
      const album = await MediaLibrary.getAlbumAsync('AI Photo Editor');
      if (!album) {
        await MediaLibrary.createAlbumAsync('AI Photo Editor', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
    } catch (albumErr) {
      // Album creation may fail on some scoped-storage devices, but asset is already saved to DCIM
      console.log('[ExportService] Album assignment note:', albumErr);
    }

    return {
      success: true,
      uri: asset.uri,
    };
  } catch (error: any) {
    console.error('[ExportService] Error saving photo:', error);
    return {
      success: false,
      error: error?.message || 'Fotoğraf kaydedilirken bir hata oluştu.',
    };
  }
}
