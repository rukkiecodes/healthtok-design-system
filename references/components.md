# Component Catalog

Every component, with the **exact** tokens it uses. Each encodes the rules in `SKILL.md`.

> Conventions: `spacing.*`, `radius.*`, `borderWidth.*`, `iconSize.*`, `motion.*` are from
> `tokens.md`. Colors are read via `const { colors } = useTheme()`. Weights are
> `regular` (400) / `semiBold` (600) / `bold` (700) — **there is no 500**.

---

## Text — `ThemedText`

The only text primitive. **Never style a raw `<Text>`** — funnel every string through this
so the weight ladder and palette stay honest.

- Props: `weight` (regular/semiBold/bold), `size` (fontSize key), `color` (ColorToken),
  `opacity`, `tightLineHeight`.
- Defaults: `weight="regular"`, `size="body"`, `color="ink"`.
- Passes `maxFontSizeMultiplier={1.4}`. **Never** override with `allowFontScaling={false}`
  on patient-facing copy.
- Does **not** load fonts. Font loading belongs in `app/_layout.tsx`, once, behind the
  splash gate.

```tsx
<ThemedText weight="bold" size="title2">Appointments</ThemedText>
<ThemedText size="caption" color="inkMuted48">Updated 2 min ago</ThemedText>
```

---

## Button — the pill CTA

- **Shape:** `paddingVertical: spacing.md`, `paddingHorizontal: spacing.xl`,
  `minHeight: control.minTarget`, `borderRadius: radius.pill`,
  `borderCurve: 'continuous'`, row layout, `gap: spacing.sm`.
- **Label:** `ThemedText weight="regular" size="body"` in the variant's `fg`. The pill
  radius carries emphasis — **do not bump the weight**.
- **Press:** `scale → motion.pressScale.button` (0.95) via `motion.springPress`; light
  haptic on iOS.
- **Disabled/loading:** `opacity: 0.5`; loading swaps the label for an `ActivityIndicator`
  in `fg`. `fullWidth` → `alignSelf: 'stretch'`.
- **Never** a shadow.

| Variant | `bg` | `fg` | `border` | Use |
|---|---|---|---|---|
| `primary` | `primaryFill` | `onPrimary` | — | The default CTA |
| `outline` | `canvas` | `primary` | 1px `primary` | The second CTA |
| `ghost` | `canvas` | `primary` | — | Tertiary / header actions |
| `danger` | `danger` | `onPrimary` | — | Destructive |

> Note `primary` uses **`primaryFill`** as its background, not `primary`. In dark mode
> those are different colors — see `colors.md`. This is why no component ever branches on
> `isDark`.

---

## Input

- **Wrapper:** `gap: spacing.xs`, `alignSelf: 'stretch'`.
- **Label:** `weight="semiBold" size="callout" color="ink"`.
- **Field box:** row, `borderWidth: borderWidth.thin`, `borderRadius: radius.md`,
  `borderCurve: 'continuous'`, `paddingHorizontal: spacing.base`, `backgroundColor: canvas`,
  `gap: spacing.sm`.
- **TextInput:** `flex: 1`, `paddingVertical: spacing.md`, `typeface.regular`,
  `fontSize.body`, `lineHeight.body`, `color: ink`, placeholder `inkMuted48`.
- **Icons:** optional left/right at `iconSize.sm`, `color: inkMuted48`.
- **Helper line:** error → `caption` `danger`; else hint → `caption` `inkMuted48`.
- **`secure`** renders a password field with a built-in `eye` / `eye.slash` peek toggle.

**The border color is the state channel. The width never changes:**

| State | Border color |
|---|---|
| Default | `hairline` |
| Focused | `primary` |
| Error | `danger` |

An input is never "selected", so it never reaches `borderWidth.thick`. A width change on
focus makes the field visibly jump.

---

## OtpInput

- 6 boxes in a row, `gap: spacing.sm`. Each: `flex: 1`, `aspectRatio: 1`,
  `borderWidth: borderWidth.thin`, `borderRadius: radius.md`,
  `borderCurve: 'continuous'`, `canvas` bg.
- Border: `hairline` → `primary` on the active slot → `danger` on error.
- Digit: `weight="semiBold"`, `size="title3"`, `color="ink"`.
- A single transparent `TextInput` (opacity 0) overlays the row, with
  `textContentType="oneTimeCode"` and `autoComplete="sms-otp"` for autofill.
- **Error = horizontal shake:** reanimated sequence `-8, 8, -6, 6, 0` at 50ms each.

---

## Controls — `Switch` / `Checkbox` / `Radio`

Replace react-native-paper's `Switch` / `Checkbox` / `RadioButton`. All three are
**single controls** — the caller owns any group/mutual-exclusion state (matches how
the app already drives its option lists). One accent, no Material palette.

| Control | Props | Selected look | Unselected look |
|---|---|---|---|
| `Switch` | `value`, `onValueChange`, `disabled` | track `primary` | track `hairline` |
| `Checkbox` | `checked`, `onChange(next)`, `disabled`, `size?=24` | `primary` fill + `checkmark` glyph `onPrimary` | `borderWidth.thin` `hairline` box, transparent |
| `Radio` | `selected`, `onSelect`, `disabled`, `size?=22` | `borderWidth.thick` `primary` ring + centre dot (50% dia) `primary` | `borderWidth.thin` `hairline` ring |

- `Switch` is a themed wrapper over RN's own `Switch` (iOS keeps a white thumb; Android
  uses the accent thumb when on). The colour props are owned by the system — callers
  never pass `color`/`trackColor`/`thumbColor`.
- `Checkbox`/`Radio` are `Pressable`; `hitSlop: 8`, `opacity 0.6` while pressed,
  `0.4` when disabled. Border WIDTH never changes on press — only `thin`→`thick` for a
  selected Radio (the one place `thick` appears, per the borderWidth contract).
- Migration: Paper `status={x ? 'checked':'unchecked'}` + `onPress` → `checked={x}` +
  `onChange` (Checkbox) / `selected={x}` + `onSelect` (Radio). Drop `color`.

---

## Card & containers

- `borderRadius: radius.lg`, `borderCurve: 'continuous'`,
  `borderWidth: borderWidth.thin`, `borderColor: hairline`, `backgroundColor: canvas`,
  `padding: spacing.lg`, `gap: spacing.sm`. **No shadow.**
- **Press:** `scale → motion.pressScale.card` (0.98).
- **Variants:** `outlined` (default) · `filled` (`canvasParchment`, no border) · `plain`
  (no border, no fill).
- **`selected`:** border upgrades to `borderWidth.thick` in `primaryFocus`. Nothing else
  changes — no glow, no shadow, no fill swap. **This is the only 2px border in the system.**
- **Grouped rows** (settings lists): `surfacePearl` fill, `radius.lg`,
  `overflow: 'hidden'`, rows separated by a `borderWidth.hairline` top border in
  `dividerSoft` (skip on row 0).
- Title `weight="semiBold" size="headline"`; supporting copy `regular` `callout`/`caption`
  in `inkMuted48`/`inkMuted80`; footer row `justifyContent: 'space-between'`.

---

## Chips & badges

| Type | Spec |
|---|---|
| **Tag chip** | `paddingHorizontal: spacing.sm`, `paddingVertical: spacing.xxs`, `radius.pill`, bg `canvasParchment`, text `regular` `caption` `inkMuted80`. Cap visible at 3, overflow as a `+N` chip. |
| **Filter chip** | Pill. Inactive `canvasParchment`/`ink`; active `primaryFill`/`onPrimary`. Press `scale → motion.pressScale.chip`. |
| **Status badge** | Pill, `paddingHorizontal: spacing.sm`, `paddingVertical: spacing.xxs`, colored by a status palette below. **Always carries a word.** |

### Status palettes — the telemedicine heart

Type these as `Record<Status, { bg; fg; label }>` so a new API status forces every screen
to handle it.

**Rule:** active / live / held states get a **filled** badge (`bg: primaryFill`,
`fg: onPrimary`); every terminal or neutral state gets a `canvasParchment` badge with a
semantic `fg`.

```ts
export const APPOINTMENT_STATUS_PALETTE = {
  upcoming:    { bg: 'canvasParchment', fg: 'primary',     label: 'Upcoming' },
  live:        { bg: 'primaryFill',     fg: 'onPrimary',   label: 'In progress' },
  completed:   { bg: 'canvasParchment', fg: 'success',     label: 'Completed' },
  cancelled:   { bg: 'canvasParchment', fg: 'danger',      label: 'Cancelled' },
  no_show:     { bg: 'canvasParchment', fg: 'warning',     label: 'Missed' },
  rescheduled: { bg: 'canvasParchment', fg: 'inkMuted80',  label: 'Rescheduled' },
} as const;

export const CONSULT_STATUS_PALETTE = {
  waiting:             { bg: 'canvasParchment', fg: 'warning',    label: 'Waiting for doctor' },
  in_progress:         { bg: 'primaryFill',     fg: 'onPrimary',  label: 'In progress' },
  ended:               { bg: 'canvasParchment', fg: 'inkMuted80', label: 'Ended' },
  follow_up_required:  { bg: 'canvasParchment', fg: 'warning',    label: 'Follow-up needed' },
} as const;

export const PRESCRIPTION_STATUS_PALETTE = {
  active:    { bg: 'primaryFill',     fg: 'onPrimary',   label: 'Active' },
  dispensed: { bg: 'canvasParchment', fg: 'success',     label: 'Dispensed' },
  expired:   { bg: 'canvasParchment', fg: 'inkMuted48',  label: 'Expired' },
  cancelled: { bg: 'canvasParchment', fg: 'danger',      label: 'Cancelled' },
} as const;

export const DOCTOR_VERIFICATION_PALETTE = {
  pending:      { bg: 'canvasParchment', fg: 'warning',    label: 'Pending' },
  under_review: { bg: 'canvasParchment', fg: 'warning',    label: 'Under review' },
  verified:     { bg: 'canvasParchment', fg: 'success',    label: 'Verified' },
  rejected:     { bg: 'canvasParchment', fg: 'danger',     label: 'Rejected' },
} as const;

export const PAYMENT_STATUS_PALETTE = {
  pending:  { bg: 'canvasParchment', fg: 'warning',    label: 'Pending' },
  paid:     { bg: 'canvasParchment', fg: 'success',    label: 'Paid' },
  failed:   { bg: 'canvasParchment', fg: 'danger',     label: 'Failed' },
  refunded: { bg: 'canvasParchment', fg: 'inkMuted80', label: 'Refunded' },
} as const;
```

> **Clinical rule:** every entry has a `label`. Never render a status as color alone — ~8%
> of men have some color-vision deficiency, and "the red badge" is not a status.

---

## Avatar

- Circle: `width === height`, `borderRadius: radius.pill`, bg `canvasParchment`,
  `overflow: 'hidden'`. Sizes: 20 (inline), 40 (list row), 56 (dashboard hero), 112 (profile).
- Image fills at `contentFit: 'cover'`; **fallback** is the first initial in `semiBold`
  `inkMuted48`.
- Verified doctors get a `checkmark.seal.fill` `primary` glyph at `iconSize.xs` beside the
  name — with an accessible label, never the glyph alone.

---

## EmptyState

The universal empty / error / offline treatment. Every list gets one as
`ListEmptyComponent`.

- Centered; `paddingVertical: spacing.huge`, `paddingHorizontal: spacing.xl`,
  `gap: spacing.base`.
- `Icon` at `iconSize.hero` in `inkMuted48` → title `weight="semiBold" size="title3"`
  `ink` → body `regular` `body` `inkMuted48` centered, `maxWidth: 320` → optional CTA
  (`marginTop: spacing.sm`).

Write the copy for a worried patient. "No appointments yet — book one to get started"
beats "Empty".

---

## Toast

App-wide transient feedback.

- **Position:** pinned top, `top: insets.top + spacing.sm`, centered, `maxWidth: '92%'`.
- **Pill:** `paddingVertical: spacing.md`, `paddingHorizontal: spacing.lg`,
  `borderRadius: radius.lg`, `borderCurve: 'continuous'`. **No shadow.**
- **Variant bg:** `info → surfaceInverse` · `error → danger` · `success → success`.
  Text always `onPrimary`/`inkOnDark`, `regular` `callout`.
- **Motion:** fade `0→1` (180ms) + slide `translateY -12→0` (220ms), ease-out cubic.
  Auto-dismiss at `motion.toastDismiss` (3500ms); tap to dismiss early.

Use a toast for **confirmations and recoverable errors**. Use an **alert** only when the
user must make a choice.

---

## Alert & action sheet — `useAlert()`

**Never** import react-native's `Alert` or `ActionSheetIOS` — the gray OS dialogs break the
language. One `AlertProvider` at the root exposes `alert()` and `sheet()`.

### `alert({ title, message?, buttons? })` — centered dialog

- Backdrop `scrim`; card `maxWidth: 280`, `canvas`, `radius.lg`,
  `borderCurve: 'continuous'`, `overflow: 'hidden'`. **No shadow.**
- Title `semiBold` `headline` centered; message `regular` `callout` `inkMuted80` centered.
  A `borderWidth.hairline` divider above the button row.
- Buttons: **2 render side-by-side** (hairline divider between); 1 or 3+ stack. Each
  `minHeight: 48`. `cancel` → `semiBold` `primary`; `destructive` → `danger`; default →
  `primary`. Pressed row flashes `canvasParchment`. Android back maps to cancel.
- Enter: scale `0.94→1` (180ms) + fade.

```tsx
alert({
  title: 'Cancel this appointment?',
  message: 'Dr. Adeyemi will be notified. Cancelling within 2 hours may incur a fee.',
  buttons: [
    { text: 'Keep appointment', style: 'cancel' },
    { text: 'Cancel appointment', style: 'destructive', onPress: () => cancel(id) },
  ],
});
```

### `sheet({ title?, message?, options })` — bottom action sheet

- Two stacked `canvas` `radius.lg` cards over the scrim: the options card, then a separate
  Cancel card. **Cancel is appended automatically — never add your own.**
- Rows `minHeight: 52`, centered `regular` `body` `primary` (destructive → `danger`),
  hairline between rows. `title`/`message` render as a `caption` `inkMuted48` header.
- Enter: slide up `translateY 60→0` (240ms) + fade. Respects `insets.bottom`.

Use `sheet()` **instead of dropdowns and pickers** app-wide.

### The delay that matters

The pressed handler runs **`motion.actionDelay` (240ms) after the modal dismisses**, so a
follow-up native picker (camera / library / document) presents cleanly. Skipping it is the
classic "the picker didn't open" bug.

---

## Icon

Every icon is named with an **SF Symbol string** (`"chevron.left"`). One `Icon` component
renders it — natively on iOS via expo-image's `sf:` scheme, mapped to a
`MaterialCommunityIcons` glyph on Android (SF Symbols are blank there).

**Never** write `<Image source="sf:…">` inline, or the icon silently vanishes on Android.
Adding an icon means adding it to `ANDROID_GLYPH` in the same commit — an unmapped name
warns in `__DEV__` and renders a fallback.

Default size `iconSize.md` (20).

---

## Telemedicine component set

### `AppointmentCard`

Card (`outlined`). Row: 40pt avatar → column (doctor name `semiBold` `body`; specialty
`caption` `inkMuted48`) → status badge. Then a meta row: `calendar` icon + date, `clock`
icon + time **with timezone**. When status is `live`, a `primary` Button ("Join
consultation") pins to the bottom of the card.

> Always render the timezone. A patient in a different zone from the doctor mis-reading an
> appointment time is a real, common failure.

### `DoctorCard`

Card (`outlined`), pressable. 48pt avatar → column: name `semiBold` `body` + verified seal;
specialty `caption` `inkMuted48`; `RatingStars` (sm) + count `micro`. Footer row: next
available slot `callout` `primary`, consult fee `semiBold` `callout` `ink`.

### `PrescriptionRow`

Grouped row. Drug name `semiBold` `body` `ink`. Second line `callout` `inkMuted80`:
**dose + unit**, frequency, duration — e.g. `500 mg · twice daily · 7 days`. Trailing status
badge.

> **Doses always carry explicit units.** A bare `500` on a prescription screen is a safety
> defect, not a UI nit. Same for vitals.

### `VitalTile`

`Card variant="filled"` (parchment), `radius.lg`, `padding: spacing.base`,
`gap: spacing.xs`. Label `caption` `inkMuted48`; value `semiBold` `title3` `ink` with the
**unit** in `callout` `inkMuted48` beside it; optional trend row (`arrow` icon +
`caption`), colored `success`/`danger`/`inkMuted48` — **always with a word** ("up from
128").

Out-of-range values get a `warning` or `danger` treatment *and* a label — never color alone.

### `SymptomChip`

Filter-chip shape, selectable. Inactive `canvasParchment`/`ink`; selected `primaryFill`/
`onPrimary`. `accessibilityState={{ selected }}`.

### `ConsultBubble`

- `maxWidth: '82%'`, `borderRadius: radius.lg`, `borderCurve: 'continuous'`,
  `padding: spacing.md`.
- **Own message:** bg `primaryFill`, text `onPrimary`.
- **Theirs:** bg `canvasParchment`, text `ink`.
- **Image-only:** drop padding and background so the image sits flush; `radius.lg` with
  `overflow: 'hidden'`.
- **Attachment:** row with a `paperclip` / `doc.text` icon, filename `callout`, size
  `micro` `inkMuted48`.
- Timestamp row `micro` `inkMuted48` with `· Sending…` / `· Seen` affordances.

### `CallControlBar`

Row over `surfaceBlack`, `gap: spacing.lg`, centered, `paddingBottom: insets.bottom + spacing.lg`.
Circular buttons at 56pt, `radius.pill`:

| Control | Idle | Active/muted |
|---|---|---|
| Mic | white @12% bg, `mic` `inkOnDark` | `inkOnDark` bg, `mic.slash` `ink` |
| Video | white @12% bg, `video` `inkOnDark` | `inkOnDark` bg, `video.slash` `ink` |
| **End** | `danger` bg, `phone.down.fill` `onPrimary` | — |

End call is `danger` and always the visually distinct control. Every button needs an
`accessibilityLabel` — they are icon-only.

---

## Small components

- **`RatingStars`** — `star` / `star.fill`, `primary` filled / `inkMuted48` empty. Sizes
  `sm 14 / md 20 / lg 28`. Interactive stars press to `motion.pressScale.star` (0.85).
  Always pair with a numeric label for screen readers.
- **`NotificationBell`** — `bell` at `iconSize.lg` in `primary`; unread → `danger` badge
  (`minWidth 16`, `height 16`, `radius.pill`, `micro` `onPrimary`, capped `99+`) pinned
  `top: -4, right: -8`.
- **`SectionHeader`** — row: title `semiBold` `headline` `ink`, optional trailing text
  action `regular` `callout` `primary` (pressed → `opacity 0.6`).
- **`StatTile`** — `canvasParchment`, `radius.lg`, `padding: spacing.base`,
  `gap: spacing.sm`. Value `semiBold` `headline`, label `caption` `inkMuted48`, then a 6px
  track (`hairline`, `borderRadius: radius.sm`, `overflow: 'hidden'`) with a `primaryFill`
  (or `success`) fill at `${pct * 100}%`. Plain Views, no SVG — survives a JS reload.

---

## Keyboard-avoiding inputs (the Android gotcha)

`behavior="padding"` is an **iOS-only no-op on Android** — inputs hide behind the keyboard.
Use `height` on Android:

```tsx
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + BAR_HEIGHT : 0}
  style={{ flex: 1 }}
>
```

KAV is the **outer** wrapper; the scaffold goes inside. Form-sheet screens keep
`presentation: 'formSheet'` and pass `sheet` to the scaffold.

---

## Motion

Quiet and quick. Entrances 150–240ms ease-out cubic; a subtle spring is fine, no bounce.

| Interaction | Value |
|---|---|
| Button press | `scale 0.95`, `motion.springPress` |
| Card press | `scale 0.98` |
| Chip press | `scale 0.96` |
| Star press | `scale 0.85` |
| Icon button / row press | `opacity 0.5–0.6`, or bg → `canvasParchment` |
| Dialog enter | `scale 0.94 → 1`, 180ms |
| Sheet enter | `translateY 60 → 0`, 240ms |
| Toast enter | fade + `translateY -12 → 0`, 180/220ms |
| OTP error | shake `-8, 8, -6, 6, 0` @ 50ms |

The only drop-shadow in motion or elevation is hero imagery and the tab bar's floating
button. Nothing else.
