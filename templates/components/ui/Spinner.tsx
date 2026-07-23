/**
 * Loading indicator. Replaces react-native-paper's <ActivityIndicator> (14 sites)
 * with the platform one, tinted to the brand — so there is ONE loading treatment
 * app-wide instead of paper's Material ring.
 *
 * Three uses:
 *   <Spinner />                        inline, in a button or a row
 *   <Spinner label="Loading…" />       centered block, e.g. a screen body
 *   <Spinner overlay />                a scrim over the whole screen (blocking)
 *
 * For list/skeleton loading prefer a skeleton placeholder over a spinner — a
 * spinner on a full screen reads as "stuck". See references/components.md.
 */
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from './ThemedText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../constants/layout';

export type SpinnerProps = {
  /** 'small' inline (default), 'large' for a centered block. */
  size?: 'small' | 'large';
  /** Optional caption under a centered spinner. Implies a centered block. */
  label?: string;
  /** Full-screen blocking scrim — use only while an action must not be interrupted. */
  overlay?: boolean;
  /** Override the tint (defaults to the brand accent). */
  color?: string;
};

export function Spinner({ size = 'small', label, overlay, color }: SpinnerProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.primary;
  const spinner = <ActivityIndicator size={label ? 'large' : size} color={overlay ? colors.onPrimary : tint} />;

  if (overlay) {
    return (
      <View style={[StyleSheet.absoluteFillObject, styles.center, { backgroundColor: colors.scrim }]}>
        {spinner}
        {label ? (
          <ThemedText weight="semiBold" size="callout" color="inkOnDark" style={{ marginTop: spacing.sm }}>
            {label}
          </ThemedText>
        ) : null}
      </View>
    );
  }

  if (label) {
    return (
      <View style={[styles.center, { gap: spacing.sm, padding: spacing.lg }]}>
        {spinner}
        <ThemedText size="callout" color="inkMuted48">{label}</ThemedText>
      </View>
    );
  }

  return spinner;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
