/**
 * The universal card. NO SHADOW — depth is surface color + hairline.
 *
 *   <Card onPress={…}>…</Card>
 *   <Card selected>…</Card>          // 2px primaryFocus border — the ONLY 2px in the system
 *   <Card variant="filled">…</Card>  // parchment fill, no border
 */
import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { spacing, radius, borderWidth, motion } from '../../constants/layout';

export type CardVariant = 'outlined' | 'filled' | 'plain';

export type CardProps = {
  children: React.ReactNode;
  variant?: CardVariant;
  /** Upgrades the border to 2px primaryFocus. */
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Card({
  children, variant = 'outlined', selected, onPress, style, accessibilityLabel,
}: CardProps) {
  const { colors } = useTheme();

  const base: ViewStyle = {
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: variant === 'filled' ? colors.canvasParchment : colors.canvas,
    borderWidth: selected
      ? borderWidth.thick
      : variant === 'outlined'
        ? borderWidth.thin
        : borderWidth.none,
    borderColor: selected ? colors.primaryFocus : colors.hairline,
  };

  if (!onPress) {
    return <View style={[base, style]}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        base,
        { transform: [{ scale: pressed ? motion.pressScale.card : 1 }] },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
