/**
 * The pill CTA. Replaces react-native-paper's <Button>.
 *
 * The PILL RADIUS is the "this is an action" signal — do not bump the label
 * weight to add emphasis, and never add a shadow.
 *
 *   <Button label="Book appointment" onPress={…} fullWidth />
 *   <Button label="Cancel" variant="outline" onPress={…} />
 *   <Button label="Cancel appointment" variant="danger" onPress={…} />
 */
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ThemedText } from './ThemedText';
import { useTheme } from '../../theme/ThemeProvider';
import type { ColorToken } from '../../constants/palette';
import { spacing, radius, borderWidth, control, motion } from '../../constants/layout';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';

type Props = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
};

type VariantStyle = { bg: ColorToken; fg: ColorToken; border?: ColorToken };

/**
 * `primaryFill` (not `primary`) is the fill token. In dark mode the accent used
 * for TEXT is too light to fill with, and the accent used to FILL is too dark to
 * read as text — so they are separate tokens. See constants/palette.ts.
 */
const VARIANTS: Record<ButtonVariant, VariantStyle> = {
  primary: { bg: 'primaryFill', fg: 'onPrimary' },
  outline: { bg: 'canvas', fg: 'primary', border: 'primary' },
  ghost:   { bg: 'canvas', fg: 'primary' },
  danger:  { bg: 'danger', fg: 'onPrimary' },
};

export function Button({
  label, variant = 'primary', loading, disabled, fullWidth, leftIcon, onPress, ...rest
}: Props) {
  const { colors } = useTheme();
  const v = VARIANTS[variant];
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ alignSelf: fullWidth ? 'stretch' : 'auto' }, animatedStyle]}>
      <Pressable
        {...rest}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
        onPressIn={() => {
          if (!isDisabled) scale.value = withSpring(motion.pressScale.button, motion.springPress);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, motion.springPress);
        }}
        onPress={(e) => {
          if (process.env.EXPO_OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }
          onPress?.(e);
        }}
        style={{
          backgroundColor: colors[v.bg],
          borderColor: v.border ? colors[v.border] : 'transparent',
          borderWidth: v.border ? borderWidth.thin : borderWidth.none,
          minHeight: control.minTarget,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          borderRadius: radius.pill,
          borderCurve: 'continuous',
          opacity: isDisabled ? 0.5 : 1,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: spacing.sm,
        }}
      >
        {loading ? (
          <ActivityIndicator color={colors[v.fg]} />
        ) : (
          <>
            {leftIcon ? <View>{leftIcon}</View> : null}
            {/* regular weight — the pill carries the emphasis, not the type */}
            <ThemedText weight="regular" size="body" color={v.fg} tightLineHeight>
              {label}
            </ThemedText>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}
