/**
 * Toast — app-wide transient feedback. Implements references/components.md §Toast.
 * Replaces `ToastAndroid` (which shows NOTHING on iOS — a real gap for an App
 * Store build) with one cross-platform, themed toast.
 *
 * Mount <ToastProvider> once, at the root (app/_layout.tsx, INSIDE ThemeProvider,
 * above the router). Anywhere below:
 *
 *   const toast = useToast();
 *   toast.success('Appointment booked');
 *   toast.error('Could not connect. Try again.');
 *   toast.info('Your doctor is reviewing your file');
 *
 * Pinned top, centered, maxWidth 92%. The VARIANT colors the whole pill:
 * info → surfaceInverse · error → danger · success → success; text always
 * inkOnDark, regular callout. No shadow, no icon. Fade+slide in, auto-dismiss at
 * motion.toastDismiss (3.5s), tap to dismiss early.
 *
 * Use a toast for confirmations and recoverable errors. Use useAlert().alert()
 * when the user must make a choice.
 */
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './ThemedText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, radius, motion } from '../../constants/layout';

type ToastTone = 'success' | 'error' | 'info';
type ToastState = { message: string; tone: ToastTone } | null;

type ToastApi = {
  show: (message: string, tone?: ToastTone) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, tone: ToastTone = 'info') => {
    if (!message) return;
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, tone });
    timer.current = setTimeout(() => setToast(null), motion.toastDismiss);
  }, []);

  const api = useMemo<ToastApi>(() => ({
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
    info: (m) => show(m, 'info'),
  }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? <ToastView toast={toast} onDismiss={() => setToast(null)} /> : null}
    </ToastContext.Provider>
  );
}

function ToastView({ toast, onDismiss }: { toast: NonNullable<ToastState>; onDismiss: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bg =
    toast.tone === 'success' ? colors.success : toast.tone === 'error' ? colors.danger : colors.surfaceInverse;

  return (
    <Animated.View
      entering={FadeIn.duration(motion.base)}
      exiting={FadeOut.duration(motion.fast)}
      pointerEvents="box-none"
      style={{ position: 'absolute', top: insets.top + spacing.sm, left: 0, right: 0, alignItems: 'center' }}
    >
      <Pressable
        onPress={onDismiss}
        style={{
          maxWidth: '92%',
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.lg,
          borderCurve: 'continuous',
          backgroundColor: bg,
        }}
      >
        <ThemedText size="callout" color="inkOnDark" numberOfLines={2} style={{ textAlign: 'center' }}>
          {toast.message}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>. Mount it in app/_layout.tsx.');
  return ctx;
}
