import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Sparkles, SunMedium, UserRound } from 'lucide-react-native';
import { EnhancementMode } from '../types/editor';
import { COLORS, ENHANCEMENT_MODES } from '../constants/theme';

interface ModeSelectorProps {
  currentMode: EnhancementMode;
  onSelectMode: (mode: EnhancementMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onSelectMode }) => {
  const getIcon = (id: EnhancementMode, isSelected: boolean) => {
    const color = isSelected ? '#ffffff' : COLORS.textSecondary;
    switch (id) {
      case 'sharpen':
        return <Sparkles size={18} color={color} />;
      case 'hdr':
        return <SunMedium size={18} color={color} />;
      case 'portrait':
        return <UserRound size={18} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerLabel}>Netleştirme Modu Seçin</Text>
      <View style={styles.cardsRow}>
        {ENHANCEMENT_MODES.map((mode) => {
          const isSelected = currentMode === mode.id;
          return (
            <TouchableOpacity
              key={mode.id}
              activeOpacity={0.8}
              onPress={() => onSelectMode(mode.id)}
              style={[
                styles.modeCard,
                isSelected && styles.modeCardSelected,
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  isSelected && styles.iconWrapSelected,
                ]}
              >
                {getIcon(mode.id, isSelected)}
              </View>
              <Text
                style={[
                  styles.modeTitle,
                  isSelected && styles.modeTitleSelected,
                ]}
                numberOfLines={1}
              >
                {mode.title}
              </Text>
              <View
                style={[
                  styles.badge,
                  isSelected && styles.badgeSelected,
                ]}
              >
                <Text style={styles.badgeText}>{mode.badge}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeCard: {
    flex: 1,
    backgroundColor: COLORS.bgTertiary,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  modeCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentLight,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconWrapSelected: {
    backgroundColor: COLORS.accent,
  },
  modeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  modeTitleSelected: {
    color: '#ffffff',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: COLORS.bgElevated,
  },
  badgeSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
  badgeText: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
