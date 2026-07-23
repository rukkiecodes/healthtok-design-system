/**
 * useAlert() — centered dialog + bottom action sheet. Implements
 * references/components.md §"Alert & action sheet". Replaces paper's Portal/Modal
 * and the old components/apple/Dialog, and BANS react-native's `Alert` /
 * `ActionSheetIOS` (their grey OS chrome breaks the design language).
 *
 * Mount <AlertProvider> once at the root (app/_layout.tsx, inside ThemeProvider).
 * Then anywhere:
 *
 *   const { alert, sheet } = useAlert();
 *
 *   alert({
 *     title: 'Cancel this appointment?',
 *     message: 'Dr. Adeyemi will be notified.',
 *     buttons: [
 *       { text: 'Keep appointment', style: 'cancel' },
 *       { text: 'Cancel appointment', style: 'destructive', onPress: () => cancel(id) },
 *     ],
 *   });
 *
 *   sheet({
 *     title: 'Add a photo',
 *     options: [
 *       { text: 'Take photo', onPress: openCamera },
 *       { text: 'Choose from library', onPress: openLibrary },
 *     ],
 *   }); // a Cancel row is appended automatically — never add your own
 *
 * THE DELAY THAT MATTERS: a pressed handler runs `motion.actionDelay` (240ms)
 * AFTER the modal dismisses, so a follow-up native picker (camera/library/
 * document) presents cleanly. Skipping it is the classic "picker didn't open" bug.
 */
import React, { createContext, useCallback, useContext, useState } from 'react';
import { BackHandler, Modal, Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './ThemedText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, radius, borderWidth, control, motion } from '../../constants/layout';
import { normalizeSize } from '../../lib/normalize';

export type AlertButton = { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void };
export type AlertOptions = { title: string; message?: string; buttons?: AlertButton[] };
export type SheetOption = { text: string; style?: 'default' | 'destructive'; onPress?: () => void };
export type SheetOptions = { title?: string; message?: string; options: SheetOption[] };

type AlertApi = { alert: (o: AlertOptions) => void; sheet: (o: SheetOptions) => void };
const AlertContext = createContext<AlertApi | null>(null);

type Modal_ =
  | { kind: 'alert'; data: AlertOptions }
  | { kind: 'sheet'; data: SheetOptions }
  | null;

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<Modal_>(null);

  const close = useCallback(() => setModal(null), []);

  // Dismiss first, then run the handler after actionDelay (native-picker safe).
  const run = useCallback((fn?: () => void) => {
    setModal(null);
    if (fn) setTimeout(fn, motion.actionDelay);
  }, []);

  const api: AlertApi = {
    alert: (data) => setModal({ kind: 'alert', data }),
    sheet: (data) => setModal({ kind: 'sheet', data }),
  };

  return (
    <AlertContext.Provider value={api}>
      {children}
      {modal?.kind === 'alert' ? <AlertDialog data={modal.data} onClose={close} onRun={run} /> : null}
      {modal?.kind === 'sheet' ? <ActionSheet data={modal.data} onClose={close} onRun={run} /> : null}
    </AlertContext.Provider>
  );
}

/* ── Centered dialog ─────────────────────────────────────────────────────── */
function AlertDialog({ data, onClose, onRun }: { data: AlertOptions; onClose: () => void; onRun: (fn?: () => void) => void }) {
  const { colors } = useTheme();
  const buttons = data.buttons?.length ? data.buttons : [{ text: 'OK', style: 'default' as const }];
  // Android back = the cancel button (or a plain dismiss).
  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const cancel = buttons.find((b) => b.style === 'cancel');
      onRun(cancel?.onPress); return true;
    });
    return () => sub.remove();
  }, [buttons, onRun]);

  const sideBySide = buttons.length === 2;

  const color = (b: AlertButton) =>
    b.style === 'destructive' ? colors.danger : colors.primary;

  return (
    <Modal transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(motion.fast)} exiting={FadeOut.duration(motion.fast)} style={{ flex: 1 }}>
        <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: colors.scrim, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
          <Pressable onPress={() => {}}>
            <Animated.View
              entering={FadeInDown.springify().damping(18).stiffness(320)}
              style={{ width: normalizeSize(280), maxWidth: '100%', backgroundColor: colors.canvas, borderRadius: radius.lg, borderCurve: 'continuous', overflow: 'hidden' }}
            >
              <View style={{ padding: spacing.lg, gap: spacing.xs, alignItems: 'center' }}>
                <ThemedText weight="semiBold" size="headline" color="ink" style={{ textAlign: 'center' }}>{data.title}</ThemedText>
                {data.message ? (
                  <ThemedText size="callout" color="inkMuted80" style={{ textAlign: 'center' }}>{data.message}</ThemedText>
                ) : null}
              </View>
              <View style={{ height: borderWidth.hairline, backgroundColor: colors.hairline }} />
              <View style={{ flexDirection: sideBySide ? 'row' : 'column' }}>
                {buttons.map((b, i) => (
                  <React.Fragment key={i}>
                    {i > 0 ? (
                      <View style={{ [sideBySide ? 'width' : 'height']: borderWidth.hairline, backgroundColor: colors.hairline }} />
                    ) : null}
                    <Pressable
                      onPress={() => onRun(b.onPress)}
                      style={({ pressed }) => ({ flex: 1, minHeight: control.heightMd, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? colors.canvasParchment : 'transparent' })}
                    >
                      <ThemedText weight={b.style === 'cancel' ? 'semiBold' : 'regular'} size="body" style={{ color: color(b) }}>
                        {b.text}
                      </ThemedText>
                    </Pressable>
                  </React.Fragment>
                ))}
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

/* ── Bottom action sheet ─────────────────────────────────────────────────── */
function ActionSheet({ data, onClose, onRun }: { data: SheetOptions; onClose: () => void; onRun: (fn?: () => void) => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(motion.fast)} exiting={FadeOut.duration(motion.fast)} style={{ flex: 1 }}>
        <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: colors.scrim, justifyContent: 'flex-end', padding: spacing.md, paddingBottom: insets.bottom + spacing.md }}>
          <Pressable onPress={() => {}}>
            <Animated.View entering={FadeInDown.duration(motion.slow)} style={{ gap: spacing.sm }}>
              {/* Options card */}
              <View style={{ backgroundColor: colors.canvas, borderRadius: radius.lg, borderCurve: 'continuous', overflow: 'hidden' }}>
                {data.title || data.message ? (
                  <View style={{ padding: spacing.md, alignItems: 'center', gap: 2 }}>
                    {data.title ? <ThemedText size="caption" color="inkMuted48" style={{ textAlign: 'center' }}>{data.title}</ThemedText> : null}
                    {data.message ? <ThemedText size="caption" color="inkMuted48" style={{ textAlign: 'center' }}>{data.message}</ThemedText> : null}
                  </View>
                ) : null}
                {data.options.map((o, i) => (
                  <React.Fragment key={i}>
                    {(i > 0 || data.title || data.message) ? <View style={{ height: borderWidth.hairline, backgroundColor: colors.hairline }} /> : null}
                    <Pressable
                      onPress={() => onRun(o.onPress)}
                      style={({ pressed }) => ({ minHeight: normalizeSize(52), alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? colors.canvasParchment : 'transparent' })}
                    >
                      <ThemedText size="body" style={{ color: o.style === 'destructive' ? colors.danger : colors.primary }}>{o.text}</ThemedText>
                    </Pressable>
                  </React.Fragment>
                ))}
              </View>
              {/* Cancel card — appended automatically. */}
              <Pressable
                onPress={onClose}
                style={({ pressed }) => ({ backgroundColor: pressed ? colors.canvasParchment : colors.canvas, borderRadius: radius.lg, borderCurve: 'continuous', minHeight: normalizeSize(52), alignItems: 'center', justifyContent: 'center' })}
              >
                <ThemedText weight="semiBold" size="body" color="primary">Cancel</ThemedText>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

export function useAlert(): AlertApi {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used inside <AlertProvider>. Mount it in app/_layout.tsx.');
  return ctx;
}
