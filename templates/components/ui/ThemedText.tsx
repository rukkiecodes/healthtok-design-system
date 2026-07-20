/**
 * The ONLY text primitive. Never style a raw <Text> — funnel every string
 * through this so the weight ladder, type scale, and palette stay honest.
 *
 *   <ThemedText weight="bold" size="title2">Appointments</ThemedText>
 *   <ThemedText size="caption" color="inkMuted48">2 min ago</ThemedText>
 *
 * NOTE: this component does NOT load fonts. Font loading belongs in
 * app/_layout.tsx, once, behind the splash gate. (HealthTok's old ThemedText
 * called useFonts() with 18 families in its own body and returned null until
 * they resolved — which made every single text node flash empty on first
 * render. Don't reintroduce that.)
 */
import React from 'react';
import { Text, type TextProps } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { ColorToken } from '../../constants/palette';
import {
  fontSize, letterSpacing, lineHeight, typeface,
  MAX_FONT_SCALE,
  type FontSizeToken, type FontWeightToken,
} from '../../constants/typography';

export type ThemedTextProps = TextProps & {
  /** 400 | 600 | 700 — there is no 500. */
  weight?: FontWeightToken;
  size?: FontSizeToken;
  color?: ColorToken;
  opacity?: number;
  /** Opt out of the line-height token (e.g. to vertically center in a badge). */
  tightLineHeight?: boolean;
};

export function ThemedText({
  style,
  weight = 'regular',
  size = 'body',
  color = 'ink',
  opacity,
  tightLineHeight,
  maxFontSizeMultiplier = MAX_FONT_SCALE,
  ...rest
}: ThemedTextProps) {
  const { colors } = useTheme();

  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        typeface[weight],
        {
          fontSize: fontSize[size],
          lineHeight: tightLineHeight ? undefined : lineHeight[size],
          letterSpacing: letterSpacing[size],
          color: colors[color],
          opacity,
        },
        style,
      ]}
      {...rest}
    />
  );
}
