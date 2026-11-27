import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Check, Grid } from 'lucide-react-native';
import { COLOR_PALETTE_OPTIONS, COLORS } from '../constants/theme';
import { ColorOption } from '../types/editor';

interface ColorPalettePickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
  disabled?: boolean;
}

export const ColorPalettePicker: React.FC<ColorPalettePickerProps> = ({
  selectedColor,
  onSelectColor,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Arka Plan Rengi</Text>
        <Text style={styles.subtitle}>
          {COLOR_PALETTE_OPTIONS.find((c) => c.color === selectedColor)?.name || 'Özel'}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {COLOR_PALETTE_OPTIONS.map((item: ColorOption) => {
          const isSelected = selectedColor === item.color;
          return (
            <TouchableOpacity
              key={item.id}
              disabled={disabled}
              onPress={() => onSelectColor(item.color)}
              activeOpacity={0.7}
              style={[
                styles.colorButton,
                isSelected && styles.colorButtonSelected,
                disabled && styles.disabled,
              ]}
            >
              {item.isTransparent ? (
                <View style={styles.transparentInner}>
                  <Grid size={16} color={COLORS.textSecondary} />
                </View>
              ) : (
                <View style={[styles.colorInner, { backgroundColor: item.color }]}>
                  {isSelected && (
                    <Check
                      size={14}
                      color={item.color === '#FFFFFF' || item.color === '#EAB308' ? '#09090b' : '#ffffff'}
                      strokeWidth={3}
                    />
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '500',
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  colorButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: COLORS.accent,
    transform: [{ scale: 1.08 }],
  },
  colorInner: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  transparentInner: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabled: {
    opacity: 0.4,
  },
});
