import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  clamp,
} from 'react-native-reanimated';
import { Sliders } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface CustomSliderProps {
  value: number; // 0 to 100
  onValueChange: (val: number) => void;
  label?: string;
  min?: number;
  max?: number;
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  onValueChange,
  label = 'Efekt Yoğunluğu',
  min = 0,
  max = 100,
}) => {
  const [trackWidth, setTrackWidth] = React.useState(260);
  const touchOffset = useSharedValue(0);

  // Synchronize internal shared value with external value
  const progressRatio = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const handleUpdate = (ratio: number) => {
    const calculatedValue = Math.round(min + ratio * (max - min));
    onValueChange(calculatedValue);
  };

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      touchOffset.value = clamp(e.x, 0, trackWidth);
      const ratio = touchOffset.value / trackWidth;
      runOnJS(handleUpdate)(ratio);
    })
    .onUpdate((e) => {
      touchOffset.value = clamp(e.x, 0, trackWidth);
      const ratio = touchOffset.value / trackWidth;
      runOnJS(handleUpdate)(ratio);
    });

  const filledTrackWidth = trackWidth * progressRatio;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <View style={styles.titleWithIcon}>
          <Sliders size={14} color={COLORS.accent} />
          <Text style={styles.labelText}>{label}</Text>
        </View>
        <View style={styles.valueBadge}>
          <Text style={styles.valueText}>%{Math.round(value)}</Text>
        </View>
      </View>

      <GestureDetector gesture={panGesture}>
        <View
          style={styles.touchableArea}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w > 0) setTrackWidth(w);
          }}
        >
          {/* Background Track */}
          <View style={styles.trackBackground}>
            {/* Active Filled Track */}
            <View
              style={[
                styles.trackFilled,
                { width: filledTrackWidth },
              ]}
            />
          </View>

          {/* Draggable Thumb */}
          <View
            style={[
              styles.thumb,
              { left: Math.max(0, Math.min(trackWidth - 24, filledTrackWidth - 12)) },
            ]}
          >
            <View style={styles.thumbCenterDot} />
          </View>
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  valueBadge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  valueText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  touchableArea: {
    height: 36,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.bgElevated,
    overflow: 'hidden',
    width: '100%',
  },
  trackFilled: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },
  thumbCenterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
});
