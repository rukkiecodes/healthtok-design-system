/**
 * Toggle switch. Replaces react-native-paper's <Switch>.
 *
 * Thin themed wrapper over React Native's own Switch so the track/thumb colours
 * come from the one accent instead of Paper's Material palette. Same API as RN
 * Switch (`value`, `onValueChange`, `disabled`) minus the colour props, which the
 * design system owns.
 *
 *   <Switch value={on} onValueChange={setOn} />
 */
import React from 'react';
import { Platform, Switch as RNSwitch, type SwitchProps as RNSwitchProps } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';

export type SwitchProps = Omit<RNSwitchProps, 'trackColor' | 'thumbColor' | 'ios_backgroundColor'>;

export function Switch({ value, disabled, ...rest }: SwitchProps) {
  const { colors } = useTheme();

  return (
    <RNSwitch
      value={value}
      disabled={disabled}
      trackColor={{ false: colors.hairline, true: colors.primary }}
      // iOS keeps a white thumb regardless; Android uses the accent thumb when on.
      thumbColor={Platform.OS === 'android' ? (value ? colors.primary : colors.canvas) : undefined}
      ios_backgroundColor={colors.hairline}
      style={{ opacity: disabled ? 0.4 : 1 }}
      {...rest}
    />
  );
}
