/**
 * Divider — a 1-physical-px hairline separator. Replaces react-native-paper's
 * <Divider>. Colour is `hairline`; callers pass margins via `style`.
 *
 *   <Divider style={{ marginVertical: spacing.lg }} />
 */
import React from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { borderWidth } from '../../constants/layout';

export type DividerProps = { style?: StyleProp<ViewStyle> };

export function Divider({ style }: DividerProps) {
  const { colors } = useTheme();
  return <View style={[{ height: borderWidth.hairline, backgroundColor: colors.hairline }, style]} />;
}
