/**
 * Radio button. Replaces react-native-paper's <RadioButton>.
 *
 * A ring that fills its centre with the one accent when selected. Unlike a group
 * component, this is a single control — the caller owns the group state and calls
 * `onSelect` (mutual exclusivity lives in the screen, matching how the app already
 * drives its lists).
 *
 *   <Radio selected={value === opt} onSelect={() => setValue(opt)} />
 */
import React from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { borderWidth } from '../../constants/layout';

export type RadioProps = {
  selected: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  /** Outer diameter, px. Default 22. */
  size?: number;
};

export function Radio({ selected, onSelect, disabled, size = 22 }: RadioProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={disabled ? undefined : onSelect}
      hitSlop={8}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: selected ? borderWidth.thick : borderWidth.thin,
        borderColor: selected ? colors.primary : colors.hairline,
        opacity: disabled ? 0.4 : pressed ? 0.6 : 1,
      })}
    >
      {selected ? (
        <View
          style={{
            width: size * 0.5,
            height: size * 0.5,
            borderRadius: (size * 0.5) / 2,
            backgroundColor: colors.primary,
          }}
        />
      ) : null}
    </Pressable>
  );
}
