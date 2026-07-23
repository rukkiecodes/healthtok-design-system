/**
 * Checkbox. Replaces react-native-paper's <Checkbox>.
 *
 * Square, continuous-corner box. Unchecked = hairline border on canvas; checked =
 * filled with the one accent and an SF checkmark. Border WIDTH never carries the
 * state — the fill + glyph do.
 *
 *   <Checkbox checked={agree} onChange={setAgree} />
 */
import React from 'react';
import { Pressable } from 'react-native';

import { Icon } from './Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, borderWidth } from '../../constants/layout';

export type CheckboxProps = {
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  /** Box edge length, px. Default 24. */
  size?: number;
};

export function Checkbox({ checked, onChange, disabled, size = 24 }: CheckboxProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={disabled ? undefined : () => onChange?.(!checked)}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: radius.sm,
        borderCurve: 'continuous',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: checked ? colors.primary : 'transparent',
        borderWidth: checked ? borderWidth.none : borderWidth.thin,
        borderColor: colors.hairline,
        opacity: disabled ? 0.4 : pressed ? 0.6 : 1,
      })}
    >
      {checked ? <Icon name="checkmark" color={colors.onPrimary} size={Math.round(size * 0.6)} /> : null}
    </Pressable>
  );
}
