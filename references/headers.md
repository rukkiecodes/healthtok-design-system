# Screen Headers — the collapsing large title

**This is the single most important component in the system.** It alone defines the app's
feel, and it is what replaces `Appbar.Header` from react-native-paper across 47 files.

Source: `templates/components/navigation/ScreenScaffold.tsx`.

---

## The rule

**Every screen sets `headerShown: false`** — in the layout's `screenOptions` and, for
safety, per-screen. There is no native Stack header and no `Appbar.Header` anywhere in the
app. Screens render their own header by wrapping their content in a scaffold.

```tsx
<Stack screenOptions={{ headerShown: false }} />
```

---

## Behavior

- A **pinned absolute bar** (44pt tall: back chevron left, actions right) floats over the
  scroll content on `colors.canvas`.
- The **large title** (`bold` / `title2` / 28pt) lives *inside the scroll content* and
  scrolls away, fading `1 → 0` over the first 44px of scroll.
- The **inline title** (`semiBold` / `body` / 17pt) fades `0 → 1` and slides
  `translateY 10 → 0` between scroll offsets **12 and 44**.
- A **hairline** under the bar fades in on the same 12→44 curve.
- All of it runs on Reanimated worklets on the UI thread — so it behaves identically on
  Android, which is the entire point of doing it in JS rather than relying on the native
  iOS large-title header.

---

## The three variants

| Variant | Body | Use for |
|---|---|---|
| `ScreenScaffold` | `Animated.ScrollView` | Forms, detail pages, settings, profile |
| `ListScreenScaffold<T>` | `Animated.FlatList` | Feeds and lists — appointments, doctors, chats, notifications |
| `FixedHeader` | Plain `View`, non-collapsing | Bodies that can't drive a scroll animation: WebView, **inverted chat list**, video call |

Picking wrong is the most common mistake. If the body is an inverted `FlatList` (chat), a
`WebView`, or a full-bleed video surface, the scroll offset either doesn't exist or runs
backwards — use `FixedHeader`.

---

## Props

```ts
type HeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;    // header actions — NotificationBell, filter, compose
  left?: ReactNode;     // shown INSTEAD of the back button (tab roots)
  showBack?: boolean;   // default true
  onBack?: () => void;  // default router.back()
  sheet?: boolean;      // form-sheet presentation — see below
};
```

`ListScreenScaffold` adds every `FlatList` prop plus:

```ts
padded?: boolean;  // inset rows to the gutter (card rows).
                   // Off = full-bleed rows; the large title keeps the gutter either way.
```

---

## Exact metrics

| Property | Value |
|---|---|
| Bar height | `header.BAR_HEIGHT` = **44** (raw, not normalized — a platform constant) |
| Collapse distance | 44px of scroll |
| Fade start | 12px of scroll |
| Bar horizontal padding | `spacing.sm` |
| Left/right slot min width | `header.SLOT_MIN_WIDTH` = 64 each — keeps the inline title optically centered |
| Slot internal gap | `spacing.xs` |
| Back chevron | SF Symbol `chevron.left`, `iconSize.xl` (26), `colors.primary`, `padding: spacing.xs`, `hitSlop={10}`, pressed → `opacity 0.5` |
| Inline title | `weight="semiBold"` `size="body"` `color="ink"` `numberOfLines={1}` |
| Large title | `weight="bold"` `size="title2"` `color="ink"`, `marginBottom: spacing.lg` |
| Subtitle | `weight="regular"` `size="callout"` `color="inkMuted48"`, `marginTop: spacing.xs` |
| Bar underline | `borderWidth.hairline` in `colors.hairline`, opacity animated 0→1 |
| Content `paddingTop` | `topInset + BAR_HEIGHT + spacing.sm` |
| Content `paddingHorizontal` | `spacing.xl` (ScrollView); FlatList = `spacing.xl` if `padded`, else 0 |
| Content `paddingBottom` | `spacing.xxxl` |
| Sheet-mode `topInset` | `spacing.xs` instead of `insets.top` |
| `scrollEventThrottle` | 16 |

---

## Usage patterns

### Simplest — a settings or detail screen

```tsx
<ScreenScaffold title="Settings" contentContainerStyle={{ gap: spacing.xl }}>
  {/* … */}
</ScreenScaffold>
```

### A tab root — no back button, both slots filled

```tsx
<ListScreenScaffold<Doctor>
  title="Find a doctor"
  padded
  showBack={false}
  left={<HeaderSettingsButton />}
  right={<NotificationBell />}
  data={doctors}
  keyExtractor={(d) => d.id}
  contentContainerStyle={{ gap: spacing.base, flexGrow: 1 }}
  ListHeaderComponent={
    <View style={{ gap: spacing.sm }}>
      <Input leftIcon="magnifyingglass" placeholder="Search doctors" … />
      {/* horizontal specialty chips */}
    </View>
  }
  renderItem={({ item }) => <DoctorCard doctor={item} onPress={…} />}
  ListEmptyComponent={<EmptyState … />}
/>
```

### A full-bleed list with a header action

```tsx
<ListScreenScaffold<Notification>
  title="Notifications"
  right={hasUnread ? <Button label="Mark all read" variant="ghost" onPress={onMarkAll} /> : undefined}
  data={notifications}
  ItemSeparatorComponent={() => (
    <View style={{
      height: borderWidth.hairline,
      backgroundColor: colors.dividerSoft,
      marginLeft: spacing.lg + 40 + spacing.base,  // inset past the 40pt avatar
    }} />
  )}
  refreshControl={<RefreshControl refreshing={…} onRefresh={…} tintColor={colors.primary} />}
/>
```

### A form-sheet screen

Paired with `presentation: 'formSheet'` in the router:

```tsx
<ScreenScaffold sheet title="Filters">…</ScreenScaffold>
```

`sheet` drops the safe-area top inset. A sheet is already inset from the top of the
window, so without this the header floats down with a dead gap above it.

### An inverted chat — `FixedHeader` + keyboard offset

```tsx
<FixedHeader title={doctorName}>
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + BAR_HEIGHT : 0}
    style={{ flex: 1, backgroundColor: colors.canvas }}
  >
    <FlatList inverted data={messages} … />
    <ChatComposer onSend={…} />
  </KeyboardAvoidingView>
</FixedHeader>
```

`behavior="padding"` is an **iOS-only no-op on Android** — the composer hides behind the
keyboard. Use `height` on Android. The KAV is the **outer** wrapper; the scaffold goes
inside it (or, as here, wraps the scaffold's children).

---

## The dashboard exception

Home / dashboard screens use a **fixed, non-collapsing** greeting hero instead of a
collapsing title — it should not scroll away, because it carries the patient's identity
and the notification bell.

```tsx
<View style={{
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.base,
  paddingTop: insets.top + spacing.sm,
  paddingHorizontal: spacing.xl,
  paddingBottom: spacing.md,
}}>
  {/* 56pt avatar, radius.pill, canvasParchment fallback with initial in title3 */}
  <View style={{ flex: 1, gap: spacing.xxs }}>
    <ThemedText size="callout" color="inkMuted48">Good morning</ThemedText>
    <ThemedText weight="semiBold" size="title3" color="ink" numberOfLines={1}>
      {patient.firstName}
    </ThemedText>
  </View>
  <HeaderSettingsButton />
  <NotificationBell />
</View>
```

This is the **only** sanctioned bespoke header. Everything else uses a scaffold.

---

## Header action buttons

| Component | Icon | Spec |
|---|---|---|
| `HeaderSettingsButton` | `gearshape` | `iconSize.lg` (22), `colors.primary`, `paddingHorizontal: spacing.sm`, `hitSlop={8}`, pressed → `opacity 0.6` |
| `HeaderComposeButton` | `square.and.pencil` | Same shape |
| `NotificationBell` | `bell` | `iconSize.lg` + a `danger` count badge pinned `top: -4, right: -8`: `minWidth 16`, `height 16`, `radius.pill`, `micro` `onPrimary`, capped at `99+` |

---

## Accessibility

- The large title carries `accessibilityRole="header"` so screen readers announce the
  screen name.
- The back button has `accessibilityRole="button"` and `accessibilityLabel="Go back"`.
- Icon-only header actions **must** carry an `accessibilityLabel` — an unlabeled bell is
  announced as nothing.
- The 44pt bar height *is* the hit target. Actions smaller than that get `hitSlop`.

---

## Migrating from `Appbar.Header`

The old pattern was `Appbar.Header` used purely as a transparent flex row:

```tsx
// BEFORE
<PaperProvider>
  <Appbar.Header style={{ paddingHorizontal: normalizeSize(10), backgroundColor: transparent, gap: normalizeSize(10) }}>
    <BackButton onPress={router.back} />
    <ThemedText type='subtitle' font='Poppins-Bold'>Upcoming</ThemedText>
  </Appbar.Header>
  <FlashList data={…} … />
</PaperProvider>
```

```tsx
// AFTER
<ListScreenScaffold
  title="Upcoming"
  padded
  data={…}
  renderItem={…}
/>
```

The `PaperProvider` wrapper, the `Appbar.Header`, the manual `BackButton`, and the manual
title all disappear. See `migration.md` for the full sweep.
