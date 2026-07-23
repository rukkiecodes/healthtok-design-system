/**
 * DatePicker — JS-only date & time picker. Replaces react-native-paper-dates'
 * DatePickerModal / TimePickerModal so PaperProvider (and react-native-paper) can
 * leave the app entirely. No native module.
 *
 * A bottom sheet of snap-scrolling wheel columns:
 *   mode="date" → Month · Day · Year   (Year range defaults to 1920…this year)
 *   mode="time" → Hour · Minute        (24h)
 *
 * onConfirm always returns a Date. For time mode the date is `value`'s day with the
 * chosen hour/minute applied — callers read `d.getHours()` / `d.getMinutes()`.
 *
 *   <DatePicker mode="date" visible={open} value={birth}
 *     onConfirm={(d) => { setBirth(d); setOpen(false) }} onCancel={() => setOpen(false)} />
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, View, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './ThemedText';
import { Button } from './Button';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, radius, borderWidth } from '../../constants/layout';

const ITEM_HEIGHT = 44;
const VISIBLE = 5; // odd → a centred selection row
const PAD = ((VISIBLE - 1) / 2) * ITEM_HEIGHT;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

/** One snap-scrolling column. Controlled by index; reports index on settle. */
function Wheel({
  values, index, onIndexChange, width, format,
}: {
  values: number[];
  index: number;
  onIndexChange: (i: number) => void;
  width: number;
  format?: (v: number) => string;
}) {
  const { colors } = useTheme();
  const ref = useRef<ScrollView>(null);

  // Keep the wheel aligned when the controlled index changes from outside
  // (e.g. day clamped after a month change) without fighting an active drag.
  useEffect(() => {
    ref.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
  }, [index]);

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(values.length - 1, i));
    if (clamped !== index) onIndexChange(clamped);
    ref.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
  };

  return (
    <ScrollView
      ref={ref}
      style={{ width, height: ITEM_HEIGHT * VISIBLE }}
      contentContainerStyle={{ paddingVertical: PAD }}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      onMomentumScrollEnd={settle}
      onScrollEndDrag={settle}
      nestedScrollEnabled
    >
      {values.map((v, i) => (
        <View key={v} style={{ height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
          <ThemedText
            size={i === index ? 'headline' : 'body'}
            weight={i === index ? 'semiBold' : 'regular'}
            color={i === index ? 'ink' : 'inkMuted48'}
          >
            {format ? format(v) : v}
          </ThemedText>
        </View>
      ))}
    </ScrollView>
  );
}

export type DatePickerProps = {
  mode?: 'date' | 'time';
  visible: boolean;
  value?: Date | null;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  title?: string;
  /** date mode only. */
  minYear?: number;
  maxYear?: number;
};

export function DatePicker({
  mode = 'date', visible, value, onConfirm, onCancel, title, minYear = 1920, maxYear,
}: DatePickerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const years = useMemo(() => {
    const end = maxYear ?? new Date().getFullYear();
    return Array.from({ length: end - minYear + 1 }, (_, i) => minYear + i);
  }, [minYear, maxYear]);

  const base = value ?? new Date();
  const [month, setMonth] = useState(base.getMonth());
  const [day, setDay] = useState(base.getDate());
  const [year, setYear] = useState(base.getFullYear());
  const [hour, setHour] = useState(base.getHours());
  const [minute, setMinute] = useState(base.getMinutes());

  // Re-seed the draft each time the sheet opens so it reflects the current value.
  useEffect(() => {
    if (!visible) return;
    const d = value ?? new Date();
    setMonth(d.getMonth()); setDay(d.getDate()); setYear(d.getFullYear());
    setHour(d.getHours()); setMinute(d.getMinutes());
  }, [visible]);

  const dim = daysInMonth(year, month);
  // Clamp the day when the month/year shrinks below it (e.g. Jan 31 → Feb).
  useEffect(() => {
    if (day > dim) setDay(dim);
  }, [dim]);

  const days = useMemo(() => Array.from({ length: dim }, (_, i) => i + 1), [dim]);
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  const confirm = () => {
    if (mode === 'time') {
      const d = new Date(base.getTime());
      d.setHours(hour, minute, 0, 0);
      onConfirm(d);
    } else {
      onConfirm(new Date(year, month, Math.min(day, dim)));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable
        onPress={onCancel}
        style={{ flex: 1, backgroundColor: colors.scrim, justifyContent: 'flex-end' }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: colors.canvas,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            borderCurve: 'continuous',
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
            gap: spacing.md,
          }}
        >
          {title ? (
            <ThemedText weight="semiBold" size="headline" color="ink" style={{ textAlign: 'center' }}>
              {title}
            </ThemedText>
          ) : null}

          <View style={{ position: 'relative', flexDirection: 'row', justifyContent: 'center' }}>
            {/* centred selection band behind the wheels */}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: PAD,
                height: ITEM_HEIGHT,
                left: 0,
                right: 0,
                borderRadius: radius.md,
                backgroundColor: colors.hairline,
                opacity: 0.35,
              }}
            />

            {mode === 'date' ? (
              <>
                <Wheel values={months12} index={month} onIndexChange={setMonth} width={90} format={(m) => MONTHS[m]} />
                <Wheel values={days} index={day - 1} onIndexChange={(i) => setDay(i + 1)} width={70} format={(d) => pad2(d)} />
                <Wheel values={years} index={Math.max(0, years.indexOf(year))} onIndexChange={(i) => setYear(years[i])} width={90} />
              </>
            ) : (
              <>
                <Wheel values={hours} index={hour} onIndexChange={setHour} width={90} format={pad2} />
                <ThemedText weight="semiBold" size="headline" color="ink" style={{ alignSelf: 'center' }}>:</ThemedText>
                <Wheel values={minutes} index={minute} onIndexChange={setMinute} width={90} format={pad2} />
              </>
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button label="Cancel" variant="outline" fullWidth onPress={onCancel} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Done" variant="primary" fullWidth onPress={confirm} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const months12 = Array.from({ length: 12 }, (_, i) => i);
