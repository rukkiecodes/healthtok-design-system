/**
 * OTP / verification-code input — segmented boxes for a 4- or 6-digit code.
 *
 * There is NO react-native-paper or third-party OTP lib. A single hidden
 * TextInput owns the value (so iOS SMS autofill and paste "just work" via
 * `textContentType="oneTimeCode"` / `autoComplete="sms-otp"`); the visible boxes
 * are pure presentation driven off that one string.
 *
 * The BORDER COLOR is the state channel, same rule as <Input>: hairline (empty)
 * → primary (the active box, or any filled box) → danger (error). Border WIDTH
 * never changes — a 2px ring would make the row jump. `onComplete` fires once the
 * last digit lands, so the caller need not watch length.
 *
 *   <OtpInput value={code} onChangeText={setCode} onComplete={verify} />
 *   <OtpInput length={6} value={code} onChangeText={setCode} error={err} />
 */
import React, { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { ThemedText } from './ThemedText';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, borderWidth } from '../../constants/layout';
import { fontSize, typeface } from '../../constants/typography';
import { normalizeSize } from '../../lib/normalize';

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

  // One box is ~56pt tall; the width flexes so 4 and 6 both fill the row evenly.
  const BOX = normalizeSize(length === 6 ? 46 : 60);

  const handle = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '').slice(0, length);
    onChangeText(digits);
    if (digits.length === length) onComplete?.(digits);
  };

  const cells = Array.from({ length }, (_, i) => value[i] ?? '');
  // The "active" box is the first empty one (or the last, once full).
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <View style={{ gap: normalizeSize(8), alignSelf: 'stretch' }}>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={{ flexDirection: 'row', justifyContent: 'space-between' }}
      >
        {cells.map((digit, i) => {
          const isActive = focused && i === activeIndex;
          const borderColor = error
            ? colors.danger
            : (digit || isActive)
              ? colors.primary
              : colors.hairline;
          return (
            <View
              key={i}
              style={{
                width: BOX,
                height: normalizeSize(56),
                borderRadius: radius.md,
                borderCurve: 'continuous',
                borderWidth: borderWidth.hairline,
                borderColor,
                backgroundColor: colors.surfacePearl,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ThemedText
                style={{
                  fontFamily: typeface.semibold,
                  fontSize: fontSize.title2,
                  color: colors.ink,
                }}
              >
                {digit}
              </ThemedText>
              {/* Caret hint on the active, empty box. */}
              {isActive && !digit ? (
                <View
                  style={{
                    position: 'absolute',
                    width: normalizeSize(2),
                    height: normalizeSize(22),
                    borderRadius: normalizeSize(1),
                    backgroundColor: colors.primary,
                  }}
                />
              ) : null}
            </View>
          );
        })}
      </Pressable>

      {/* The real input — invisible, off to the side, owns the value + autofill. */}
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
        // Kept in the tree (not display:none) so focus + autofill work; parked
        // off-screen and untouchable so the visible boxes are the only UI.
        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
        caretHidden
      />

      {error ? (
        <ThemedText style={{ fontSize: fontSize.caption, color: colors.danger }}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}
