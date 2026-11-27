import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { BgRemovalResult } from '../types/editor';

/**
 * Removes background using on-device Google ML Kit Subject Segmentation
 * via @six33/react-native-bg-removal.
 * 
 * Runs completely locally on the device with zero cloud API and zero costs.
 */
export async function removeBackground(
  imageUri: string,
  onProgress?: (message: string) => void
): Promise<BgRemovalResult> {
  try {
    onProgress?.('Yapay zeka modeli hazırlanıyor...');

    // Dynamic import to handle environments safely
    let bgRemovalModule: any;
    try {
      bgRemovalModule = require('@six33/react-native-bg-removal');
    } catch (importErr) {
      console.warn('Native bg-removal module import issue:', importErr);
      return {
        success: false,
        error:
          'Google ML Kit Arka Plan Silici native modülü bulunamadı. Lütfen "npx expo run:android" ile çalıştırdığınızdan emin olun.',
      };
    }

    const removeFn =
      bgRemovalModule.removeBackground ||
      bgRemovalModule.default?.removeBackground ||
      bgRemovalModule.default;

    if (typeof removeFn !== 'function') {
      return {
        success: false,
        error:
          '@six33/react-native-bg-removal kütüphanesinde removeBackground fonksiyonu bulunamadı.',
      };
    }

    onProgress?.('Google ML Kit nesne tespiti çalışıyor...');

    // Normalize URI for native Android layer
    let normalizedUri = imageUri;
    if (Platform.OS === 'android' && !normalizedUri.startsWith('file://') && !normalizedUri.startsWith('content://')) {
      normalizedUri = `file://${normalizedUri}`;
    }

    const rawResult = await removeFn(normalizedUri);

    let outputUri: string | null = null;

    if (typeof rawResult === 'string') {
      if (rawResult.startsWith('data:image')) {
        // Base64 returned: write to local cache file
        const filename = `bg_removed_${Date.now()}.png`;
        const localPath = `${FileSystem.cacheDirectory}${filename}`;
        const base64Data = rawResult.split(',')[1] || rawResult;
        await FileSystem.writeAsStringAsync(localPath, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        outputUri = localPath;
      } else if (rawResult.startsWith('file://') || rawResult.startsWith('/')) {
        outputUri = rawResult.startsWith('/') ? `file://${rawResult}` : rawResult;
      } else {
        // Raw base64 string
        const filename = `bg_removed_${Date.now()}.png`;
        const localPath = `${FileSystem.cacheDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(localPath, rawResult, {
          encoding: FileSystem.EncodingType.Base64,
        });
        outputUri = localPath;
      }
    } else if (rawResult && typeof rawResult === 'object' && rawResult.uri) {
      outputUri = rawResult.uri;
    }

    if (!outputUri) {
      throw new Error('Arka plan silme çıktısı alınamadı.');
    }

    onProgress?.('Arka plan başarıyla kaldırıldı!');
    return {
      success: true,
      uri: outputUri,
    };
  } catch (error: any) {
    console.error('[BgRemovalService] Error:', error);

    let friendlyMessage = 'Arka plan silinirken bir hata oluştu.';
    const errStr = error?.message || String(error);

    if (errStr.includes('download') || errStr.includes('model') || errStr.includes('DEPENDENCIES')) {
      friendlyMessage =
        'Google ML Kit Subject Segmentation modeli cihazınıza ilk kez indiriliyor. Lütfen internet bağlantınızı kontrol edip birkaç saniye sonra tekrar deneyin.';
    } else if (errStr.includes('null') || errStr.includes('unsupported') || errStr.includes('Out of Memory')) {
      friendlyMessage =
        'Fotoğraf işlenemedi. Boyut çok büyük veya format desteklenmiyor olabilir.';
    } else {
      friendlyMessage = `Hata: ${errStr}`;
    }

    return {
      success: false,
      error: friendlyMessage,
    };
  }
}
