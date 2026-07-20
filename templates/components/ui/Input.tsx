/**
 * Text input. Replaces react-native-paper's <TextInput mode="outlined">.
 *
 * The BORDER COLOR is the state channel: hairline → primary (focused) → danger
 * (error). Border WIDTH never changes on focus — only on selection, and inputs
 * are never "selected". No floating label, no filled variant, no underline.
 *
 *   <Input label="Email" value={v} onChangeText={setV} keyboardType="email-address" />
 *   <Input label="Password" secure value={p} onChangeText={setP} error={err} />
 */
import React, { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from './ThemedText';
import { Icon } from './Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, radius, borderWidth, iconSize } from '../../constants/layout';
import { fontSize, lineHeight, typeface, MAX_FONT_SCALE } from '../../constants/typography';

export type InputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  error?: string;
  hint?: string;
  /** SF Symbol name. */
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  /** Renders a password field with a built-in peek toggle. */
  secure?: boolean;
  style?: TextInputProps['style'];
};

export function Input({
  label, error, hint, leftIcon, rightIcon, onRightIconPress, secure, style, ...rest
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const borderColor = error
    ? colors.danger
    : focused
      ? colors.primary
      : colors.hairline;

  const trailingIcon = secure
    ? (revealed ? 'eye.slash' : 'eye')
    : rightIcon;

  const onTrailingPress = secure
    ? () => setRevealed((r) => !r)
    : onRightIconPress;

  return (
    <View style={{ gap: spacing.xs, alignSelf: 'stretch' }}>
      {label ? (
        <ThemedText weight="semiBold" size="callout" color="ink">
          {label}
        </ThemedText>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: borderWidth.thin,
          borderColor,
          borderRadius: radius.md,
          borderCurve: 'continuous',
          paddingHorizontal: spacing.base,
          backgroundColor: colors.canvas,
          gap: spacing.sm,
        }}
      >
        {leftIcon ? <Icon name={leftIcon} color={colors.inkMuted48} size={iconSize.sm} /> : null}

        <TextInput
          {...rest}
          secureTextEntry={secure && !revealed}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          placeholderTextColor={colors.inkMuted48}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          accessibilityLabel={rest.accessibilityLabel ?? label}
          style={[
            typeface.regular,
            {
              flex: 1,
              paddingVertical: spacing.md,
              fontSize: fontSize.body,
              lineHeight: lineHeight.body,
              color: colors.ink,
            },
            style,
          ]}
        />

        {trailingIcon ? (
          onTrailingPress ? (
            <Pressable
              onPress={onTrailingPress}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={secure ? (revealed ? 'Hide password' : 'Show password') : undefined}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <Icon name={trailingIcon} color={colors.inkMuted48} size={iconSize.sm} />
            </Pressable>
          ) : (
            <Icon name={trailingIcon} color={colors.inkMuted48} size={iconSize.sm} />
          )
        ) : null}
      </View>

      {error ? (
        <ThemedText weight="regular" size="caption" color="danger" selectable>
          {error}
        </ThemedText>
      ) : hint ? (
        <ThemedText weight="regular" size="caption" color="inkMuted48">
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}
