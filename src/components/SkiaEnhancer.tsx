import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import {
  Canvas,
  useCanvasRef,
  useImage,
  Image as SkiaImage,
  ColorMatrix,
  Group,
  rect,
  Fill,
} from '@shopify/react-native-skia';
import * as FileSystem from 'expo-file-system';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { EnhancementMode } from '../types/editor';
import { getColorMatrixForMode } from '../utils/colorMatrices';
import { COLORS } from '../constants/theme';

export interface SkiaEnhancerRef {
  captureSnapshot: () => Promise<string>;
}

interface SkiaEnhancerProps {
  imageUri: string;
  width: number;
  height: number;
  mode: EnhancementMode;
  intensity: number; // 0 to 100
  backgroundColor?: string;
}

export const SkiaEnhancer = forwardRef<SkiaEnhancerRef, SkiaEnhancerProps>(
  ({ imageUri, width, height, mode, intensity, backgroundColor = 'transparent' }, ref) => {
    const canvasRef = useCanvasRef();
    const containerRef = useRef<View>(null);
    const skiaImage = useImage(imageUri);

    // Compute real-time 4x5 color matrix for Skia
    const matrix = useMemo(() => {
      return getColorMatrixForMode(mode, intensity);
    }, [mode, intensity]);

    // Imperative handle for high-res snapshot export
    useImperativeHandle(ref, () => ({
      captureSnapshot: async (): Promise<string> => {
        // Attempt 1: Native Skia GPU Canvas Snapshot
        try {
          if (canvasRef.current) {
            const snapshot = canvasRef.current.makeImageSnapshot();
            if (snapshot) {
              const base64 = snapshot.encodeToBase64();
              const timestamp = Date.now();
              const fileUri = `${FileSystem.cacheDirectory}enhanced_${timestamp}.png`;
              await FileSystem.writeAsStringAsync(fileUri, base64, {
                encoding: FileSystem.EncodingType.Base64,
              });
              return fileUri;
            }
          }
        } catch (e) {
          console.warn('[SkiaEnhancer] makeImageSnapshot fallback:', e);
        }

        // Attempt 2: ViewShot high-fidelity fallback
        try {
          if (containerRef.current) {
            const uri = await captureRef(containerRef, {
              format: 'png',
              quality: 1,
              result: 'tmpfile',
            });
            return uri;
          }
        } catch (vsErr) {
          console.error('[SkiaEnhancer] ViewShot capture failed:', vsErr);
        }

        // Fallback to source URI if snapshots cannot be captured
        return imageUri;
      },
    }));

    if (!skiaImage) {
      return (
        <View style={[styles.loadingContainer, { width, height }]}>
          <ActivityIndicator color={COLORS.accent} size="small" />
        </View>
      );
    }

    return (
      <View ref={containerRef} style={[styles.container, { width, height }]} collapsable={false}>
        <Canvas ref={canvasRef} style={{ width, height }}>
          {/* Optional background fill if set */}
          {backgroundColor && backgroundColor !== 'transparent' && (
            <Fill color={backgroundColor} />
          )}

          <Group>
            {/* ColorMatrix applies real-time GPU color transformations */}
            <ColorMatrix matrix={matrix} />
            <SkiaImage
              image={skiaImage}
              x={0}
              y={0}
              width={width}
              height={height}
              fit="contain"
            />
          </Group>
        </Canvas>
      </View>
    );
  }
);

SkiaEnhancer.displayName = 'SkiaEnhancer';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
