import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

export interface ToastConfig {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastProps {
  config: ToastConfig;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ config, onDismiss }) => {
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (config.visible) {
      translateY.value = withSpring(0, { damping: 14 });
      opacity.value = withTiming(1, { duration: 200 });

      const timer = setTimeout(() => {
        translateY.value = withTiming(-80, { duration: 250 });
        opacity.value = withTiming(0, { duration: 250 }, () => {
          onDismiss();
        });
      }, config.duration || 3200);

      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-80, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [config.visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!config.visible && opacity.value === 0) return null;

  const getIcon = () => {
    switch (config.type) {
      case 'success':
        return <CheckCircle2 size={18} color={COLORS.success} />;
      case 'error':
        return <AlertCircle size={18} color={COLORS.error} />;
      default:
        return <Info size={18} color={COLORS.info} />;
    }
  };

  return (
    <Animated.View style={[styles.toastContainer, animatedStyle]}>
      <View
        style={[
          styles.toastCard,
          config.type === 'error' && styles.toastError,
          config.type === 'success' && styles.toastSuccess,
        ]}
      >
        <View style={styles.iconContainer}>{getIcon()}</View>
        <Text style={styles.messageText}>{config.message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 55,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    maxWidth: '100%',
  },
  toastSuccess: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  toastError: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  iconContainer: {
    marginRight: 10,
  },
  messageText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
});
