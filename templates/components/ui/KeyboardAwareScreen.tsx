/**
 * Keyboard-avoiding wrapper. There was NO shared keyboard handling — every form
 * and the chat screen rolled its own (or none), so inputs hid behind the
 * keyboard on some screens and not others. This is the one wrapper.
 *
 * The platform split is non-negotiable: iOS uses `padding` (the keyboard slides
 * the content up), Android uses `height` (Android already resizes the window via
 * `windowSoftInputMode`, so `padding` double-shifts and jumps). Getting this
 * wrong is the single most common RN keyboard bug.
 *
 *   <KeyboardAwareScreen>            // a form — content + a pinned footer CTA
 *     <ScrollView>…fields…</ScrollView>
 *     <Button label="Continue" />
 *   </KeyboardAwareScreen>
 *
 * For a scrolling form, wrap the fields in a ScrollView with
 * `keyboardShouldPersistTaps="handled"` so tapping another field doesn't dismiss
 * first. The chat screen passes `offset={headerHeight}` so the composer sits just
 * above the keyboard.
 */
import React from 'react';
import { KeyboardAvoidingView, Platform, type ViewStyle } from 'react-native';

export type KeyboardAwareScreenProps = {
  children: React.ReactNode;
  /** Extra offset above the keyboard — usually the header height on chat. */
  offset?: number;
  style?: ViewStyle;
};

export function KeyboardAwareScreen({ children, offset = 0, style }: KeyboardAwareScreenProps) {
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={offset}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
