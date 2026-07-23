/**
 * OTP / verification-code input — segmented boxes for a 4- or 6-digit code.
 * Implements references/components.md §OtpInput.
 *
 * A single transparent TextInput (opacity 0) overlays the row so iOS SMS autofill
 * and paste "just work" via `textContentType="oneTimeCode"` / `autoComplete="sms-otp"`;
 * the visible boxes are pure presentation. Each box: flex:1, aspectRatio:1,
 * borderWidth.thin, radius.md, continuous curve, canvas bg. Border COLOR is the
 * state channel: hairline → primary on the active slot → danger on error. Width
 * never changes. On error the row does a horizontal shake (-8,8,-6,6,0 @ 50ms).
 *
 *   <OtpInput value={code} onChangeText={setCode} onComplete={verify} />
 *   <OtpInput length={6} value={code} onChangeText={setCode} error={err} />
 */
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { ThemedText } from './ThemedText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, radius, borderWidth } from '../../constants/layout';

export type OtpInputProps = {
  value: string;
  onChangeText: (v: string) => void;
  /** Number of digits. 4 and 6 are the only sizes the design supports. */
  length?: 4 | 6;
  /** Fires with the full code the moment the last digit is entered. */
  onComplete?: (code: string) => void;
  error?: string;
  autoFocus?: boolean;
};

export function OtpInput({
  value, onChangeText, length = 4, onComplete, error, autoFocus = true,
}: OtpInputProps) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const shakeX = useSharedValue(0);

  // Horizontal shake when an error appears — the spec's error treatment.
  useEffect(() => {
    if (error) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }), withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }), withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [error, shakeX]);
  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  const handle = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '').slice(0, length);
    onChangeText(digits);
    if (digits.length === length) onComplete?.(digits);
  };

  const cells = Array.from({ length }, (_, i) => value[i] ?? '');
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <View style={{ gap: spacing.xs, alignSelf: 'stretch' }}>
      <Pressable onPress={() => inputRef.current?.focus()}>
        <Animated.View style={[{ flexDirection: 'row', gap: spacing.sm }, rowStyle]}>
          {cells.map((digit, i) => {
            const isActive = focused && i === activeIndex;
            const borderColor = error
              ? colors.danger
              : (digit || isActive) ? colors.primary : colors.hairline;
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  borderRadius: radius.md,
                  borderCurve: 'continuous',
                  borderWidth: borderWidth.thin,
                  borderColor,
                  backgroundColor: colors.canvas,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ThemedText weight="semiBold" size="title3" color="ink">{digit}</ThemedText>
              </View>
            );
          })}
        </Animated.View>
      </Pressable>

      {/* The real input — transparent, overlays the row, owns the value + autofill. */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handle}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        autoFocus={autoFocus}
        style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%' }}
        caretHidden
      />

      {error ? <ThemedText size="caption" color="danger">{error}</ThemedText> : null}
    </View>
  );
}
