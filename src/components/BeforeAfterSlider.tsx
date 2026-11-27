import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  clamp,
} from 'react-native-reanimated';
import { ChevronsLeftRight, Sparkles } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface BeforeAfterSliderProps {
  originalUri: string;
  processedUri?: string | null;
  processedComponent?: React.ReactNode;
  isProcessed: boolean;
  backgroundColor?: string;
  width: number;
  height: number;
}

/**
 * Checkerboard pattern component for visualizing transparency cleanly.
 */
const CheckerboardBackground: React.FC<{ width: number; height: number; size?: number }> = ({
  width,
  height,
  size = 14,
}) => {
  const cols = Math.ceil(width / size);
  const rows = Math.ceil(height / size);

  // Generate lightweight checker grid
  const tiles = useMemo(() => {
    const list: { key: string; isEven: boolean }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        list.push({
          key: `${r}-${c}`,
          isEven: (r + c) % 2 === 0,
        });
      }
    }
    return list;
  }, [rows, cols]);

  return (
    <View style={[styles.checkerContainer, { width, height }]}>
      {tiles.map((tile) => (
        <View
          key={tile.key}
          style={{
            width: size,
            height: size,
            backgroundColor: tile.isEven ? COLORS.checkerLight : COLORS.checkerDark,
          }}
        />
      ))}
    </View>
  );
};

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalUri,
  processedUri,
  processedComponent,
  isProcessed,
  backgroundColor = 'transparent',
  width,
  height,
}) => {
  // Divider position shared value (starts at 50% width)
  const dividerX = useSharedValue(width > 0 ? width / 2 : 150);
  const startX = useSharedValue(0);

  // Pan gesture for dragging the divider line
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = dividerX.value;
    })
    .onUpdate((event) => {
      // Clamped within container boundaries with 16px margin
      dividerX.value = clamp(startX.value + event.translationX, 16, width - 16);
    });

  // Animated clip style for the original (Before / Left) image
  const originalClipStyle = useAnimatedStyle(() => ({
    width: dividerX.value,
  }));

  // Animated style for the divider handle position
  const dividerLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dividerX.value }],
  }));

  return (
    <View style={[styles.wrapper, { width, height }]}>
      {/* 1. Base Layer: Checkerboard pattern for transparency */}
      <CheckerboardBackground width={width} height={height} />

      {/* 2. Optional Colored Background (if user selects a color for removed background) */}
      {backgroundColor && backgroundColor !== 'transparent' && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor, width, height },
          ]}
        />
      )}

      {/* 3. Processed (After) Image / Component - Sits in the background */}
      <View style={[StyleSheet.absoluteFillObject, { width, height }]}>
        {processedComponent ? (
          processedComponent
        ) : processedUri ? (
          <Image
            source={{ uri: processedUri }}
            style={{ width, height }}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={{ uri: originalUri }}
            style={{ width, height }}
            resizeMode="contain"
          />
        )}
      </View>

      {/* 4. Original (Before) Image - Clipped to the left of the divider */}
      {isProcessed && (
        <Animated.View style={[styles.originalClippedContainer, { height }, originalClipStyle]}>
          <Image
            source={{ uri: originalUri }}
            style={{ width, height }}
            resizeMode="contain"
          />
        </Animated.View>
      )}

      {/* 5. Interactive Draggable Divider & Badges */}
      {isProcessed && (
        <>
          {/* Top comparison indicator badges */}
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, styles.badgeBefore]}>
              <Text style={styles.badgeText}>ÖNCE</Text>
            </View>
            <View style={[styles.badge, styles.badgeAfter]}>
              <Sparkles size={11} color="#f8fafc" style={{ marginRight: 3 }} />
              <Text style={styles.badgeText}>SONRA</Text>
            </View>
          </View>

          {/* Draggable Divider Line and Center Handle */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.dividerHitArea, { height }, dividerLineStyle]}>
              {/* Vertical line with subtle glow */}
              <View style={styles.verticalLine} />

              {/* Centered circular drag handle */}
              <View style={styles.handleCircle}>
                <ChevronsLeftRight size={18} color="#09090b" strokeWidth={2.5} />
              </View>
            </Animated.View>
          </GestureDetector>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  checkerContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  originalClippedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.4)',
  },
  dividerHitArea: {
    position: 'absolute',
    top: 0,
    left: -20, // centers the 40px hit area over divider position
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  verticalLine: {
    width: 2.5,
    height: '100%',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  handleCircle: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 6,
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    pointerEvents: 'none',
    zIndex: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeBefore: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeAfter: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
