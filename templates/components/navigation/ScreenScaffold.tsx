/**
 * Collapsing large-title screen scaffold — HealthTok's replacement for the
 * default expo-router Stack header AND for `Appbar.Header` from react-native-paper.
 *
 * This is the QueenSkilla header pattern, made theme-aware. It is the single
 * highest-value component in the system: it alone defines the app's feel.
 *
 * A pinned bar (back + actions) sits over the scrollable content. The large title
 * lives at the TOP OF THAT CONTENT and scrolls away; as it passes under the bar
 * the small inline title fades in and a hairline appears — the iOS large-title
 * behaviour, implemented in JS so it renders identically on Android.
 *
 * Every screen sets `headerShown: false`.
 *
 * Three variants share one header:
 *   ScreenScaffold      — Animated.ScrollView  (forms, detail pages)
 *   ListScreenScaffold  — Animated.FlatList    (feeds, lists)
 *   FixedHeader         — non-collapsing       (WebView, inverted chat, video)
 */
import { useRouter } from 'expo-router';
import type { ComponentType, ReactElement, ReactNode } from 'react';
import {
  Pressable, View,
  type FlatListProps, type RefreshControlProps, type StyleProp, type ViewStyle,
} from 'react-native';
import Animated, {
  Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle,
  useSharedValue, type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '../ui/ThemedText';
import { Icon } from '../ui/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, header, borderWidth, iconSize } from '../../constants/layout';

export const BAR_HEIGHT = header.BAR_HEIGHT;
const { COLLAPSE_DISTANCE, FADE_START, SLOT_MIN_WIDTH } = header;

type HeaderProps = {
  title: string;
  subtitle?: string;
  /** Right-aligned header actions (notification bell, filter, compose). */
  right?: ReactNode;
  /** Left-aligned element shown when there's no back button (tab roots). */
  left?: ReactNode;
  /** Defaults to true; set false on root tab screens. */
  showBack?: boolean;
  onBack?: () => void;
  /**
   * Set on screens presented as a form sheet. A sheet is already inset from the
   * top of the window, so the safe-area top padding must be dropped or the
   * header floats down with a dead gap above it.
   */
  sheet?: boolean;
};

function useScrollY() {
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  return { scrollY, onScroll };
}

function HeaderBar({
  title, right, left, showBack = true, onBack, scrollY, topInset,
}: HeaderProps & { scrollY: SharedValue<number>; topInset: number }) {
  const router = useRouter();
  const { colors } = useTheme();

  const inlineTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [FADE_START, COLLAPSE_DISTANCE], [0, 1], Extrapolation.CLAMP),
    transform: [{
      translateY: interpolate(scrollY.value, [FADE_START, COLLAPSE_DISTANCE], [10, 0], Extrapolation.CLAMP),
    }],
  }));

  const hairlineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [FADE_START, COLLAPSE_DISTANCE], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: 10,
        paddingTop: topInset,
        backgroundColor: colors.canvas,
      }}
    >
      <View
        style={{
          height: BAR_HEIGHT,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.sm,
        }}
      >
        <View style={{ minWidth: SLOT_MIN_WIDTH, flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          {showBack ? (
            <Pressable
              onPress={onBack ?? (() => router.back())}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: spacing.xs })}
            >
              <Icon name="chevron.left" color={colors.primary} size={iconSize.xl} />
            </Pressable>
          ) : (
            left
          )}
        </View>

        <Animated.View
          style={[{ flex: 1, alignItems: 'center', paddingHorizontal: spacing.xs }, inlineTitleStyle]}
        >
          <ThemedText weight="semiBold" size="body" color="ink" numberOfLines={1}>
            {title}
          </ThemedText>
        </Animated.View>

        <View
          style={{
            minWidth: SLOT_MIN_WIDTH,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: spacing.xs,
          }}
        >
          {right}
        </View>
      </View>
      <Animated.View
        style={[{ height: borderWidth.hairline, backgroundColor: colors.hairline }, hairlineStyle]}
      />
    </View>
  );
}

function LargeTitle({
  title, subtitle, scrollY, paddingHorizontal = 0,
}: {
  title: string;
  subtitle?: string;
  scrollY: SharedValue<number>;
  paddingHorizontal?: number;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE_DISTANCE], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View
      style={[{ alignSelf: 'stretch', marginBottom: spacing.lg, paddingHorizontal }, style]}
    >
      {/* accessibilityRole="header" so screen readers announce the screen name */}
      <ThemedText weight="bold" size="title2" color="ink" accessibilityRole="header">
        {title}
      </ThemedText>
      {subtitle ? (
        <ThemedText
          weight="regular" size="callout" color="inkMuted48"
          style={{ marginTop: spacing.xs }}
        >
          {subtitle}
        </ThemedText>
      ) : null}
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */

export type ScreenScaffoldProps = HeaderProps & {
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: ReactElement<RefreshControlProps>;
  children: ReactNode;
};

export function ScreenScaffold({
  title, subtitle, right, left, showBack, onBack,
  contentContainerStyle, refreshControl, sheet, children,
}: ScreenScaffoldProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { scrollY, onScroll } = useScrollY();
  const topInset = sheet ? spacing.xs : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <HeaderBar
        title={title} right={right} left={left}
        showBack={showBack} onBack={onBack}
        scrollY={scrollY} topInset={topInset}
      />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
        contentContainerStyle={[
          {
            paddingTop: topInset + BAR_HEIGHT + spacing.sm,
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing.xxxl,
          },
          contentContainerStyle,
        ]}
      >
        <LargeTitle title={title} subtitle={subtitle} scrollY={scrollY} />
        {children}
      </Animated.ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */

export type ListScreenScaffoldProps<T> = HeaderProps &
  Omit<FlatListProps<T>, 'onScroll'> & {
    /**
     * Inset rows by the screen gutter. Use for card-style rows. Off by default,
     * which keeps rows full-bleed for edge-to-edge lists (chat, notifications).
     * Either way the large title stays aligned to the same gutter.
     */
    padded?: boolean;
  };

export function ListScreenScaffold<T>({
  title, subtitle, right, showBack, onBack,
  contentContainerStyle, ListHeaderComponent, left, sheet, padded, ...listProps
}: ListScreenScaffoldProps<T>) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { scrollY, onScroll } = useScrollY();
  const topInset = sheet ? spacing.xs : insets.top;
  const rowPad = padded ? spacing.xl : 0;
  const titlePad = padded ? 0 : spacing.xl;

  // Reanimated's typed FlatList clashes with FlatListProps
  // (CellRendererComponent null vs undefined); cast to accept our props cleanly.
  const AnimatedFlatList = Animated.FlatList as unknown as ComponentType<
    FlatListProps<T> & { onScroll?: unknown; scrollEventThrottle?: number }
  >;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <HeaderBar
        title={title} right={right} left={left}
        showBack={showBack} onBack={onBack}
        scrollY={scrollY} topInset={topInset}
      />
      <AnimatedFlatList
        {...listProps}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <LargeTitle
              title={title} subtitle={subtitle}
              scrollY={scrollY} paddingHorizontal={titlePad}
            />
            {typeof ListHeaderComponent === 'function'
              ? <ListHeaderComponent />
              : ListHeaderComponent}
          </>
        }
        contentContainerStyle={[
          {
            paddingTop: topInset + BAR_HEIGHT + spacing.sm,
            paddingBottom: spacing.xxxl,
            paddingHorizontal: rowPad,
          },
          contentContainerStyle,
        ]}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */

export type FixedHeaderProps = HeaderProps & { children: ReactNode };

/**
 * Non-collapsing header for screens whose body can't drive a scroll animation —
 * a WebView, or a chat with an inverted message list. The title stays visible and
 * the hairline is permanent; `children` fill the space beneath the bar.
 */
export function FixedHeader({ title, right, left, showBack, onBack, children }: FixedHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={{ paddingTop: insets.top, backgroundColor: colors.canvas }}>
        <View
          style={{
            height: BAR_HEIGHT,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.sm,
          }}
        >
          <View style={{ minWidth: SLOT_MIN_WIDTH, flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            {showBack !== false ? (
              <Pressable
                onPress={onBack ?? (() => router.back())}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: spacing.xs })}
              >
                <Icon name="chevron.left" color={colors.primary} size={iconSize.xl} />
              </Pressable>
            ) : (
              left
            )}
          </View>
          <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: spacing.xs }}>
            <ThemedText weight="semiBold" size="body" color="ink" numberOfLines={1} accessibilityRole="header">
              {title}
            </ThemedText>
          </View>
          <View
            style={{
              minWidth: SLOT_MIN_WIDTH, flexDirection: 'row', alignItems: 'center',
              justifyContent: 'flex-end', gap: spacing.xs,
            }}
          >
            {right}
          </View>
        </View>
        <View style={{ height: borderWidth.hairline, backgroundColor: colors.hairline }} />
      </View>
      {children}
    </View>
  );
}
