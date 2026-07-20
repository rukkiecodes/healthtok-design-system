# Removing react-native-paper

The playbook for `client/healthTok-Mobilev2`. Every number here is measured from the
codebase, not estimated.

---

## Why

- Paper implements **Material Design 3**. This system is Apple HIG. Every Paper surface
  fights the language — elevation shadows, ripple, filled/outlined text fields with
  floating labels, MD3 radii.
- It is **never even themed**. `grep` for `PaperProvider theme=`, `MD3LightTheme`,
  `MD3DarkTheme`, `useTheme()` returns **zero hits**. The app pays Paper's full weight for
  its default look.
- Paper + `react-native-paper-dates` pull a large dependency tree for what amounts to a
  transparent header row, a spinner, and a text field.

---

## The inventory

**74 files** import from `react-native-paper` / `react-native-paper-dates`
(`^5.15.1` / `^0.23.6`).

| Component | Files | Note |
|---|---:|---|
| `PaperProvider` | 62 | never configured with a theme |
| `Appbar` (only `Appbar.Header`; 94 JSX sites) | 47 | `.BackAction` / `.Content` / `.Action` never used |
| `ActivityIndicator` | 14 | |
| `TextInput` | 11 | +1 imports `TextInputProps` |
| `RadioButton` | 8 | |
| `DatePickerModal` | 8 | paper-dates |
| `registerTranslation` + `enGB` | 6 | paper-dates |
| `Portal` | 4 | always paired with `Modal` |
| `Modal` | 4 | |
| `Divider` | 4 | |
| `Switch` | 3 | |
| `TimePickerModal` | 3 | paper-dates |
| `Checkbox` | 1 | |

**Not used at all:** Button, Card, Dialog, Menu, Chip, Avatar, Snackbar, FAB, List,
Searchbar, Badge, Banner, ProgressBar, SegmentedButtons, Tooltip, IconButton, Surface, Text.

### The two facts that make this cheap

1. **No Paper theme exists**, and there is no `PaperProvider` in `app/_layout.tsx` —
   instead 62 individual screens each wrap their own tree in a bare `<PaperProvider>`. So
   **62 files are a pure wrapper deletion with zero visual change.**
2. **`Appbar.Header` is used only as a transparent flex row** holding the app's own
   `BackButton` + `ThemedText`. All 47 sites collapse into the new scaffold mechanically.

## Sizing

| Bucket | Count | Effort |
|---|---:|---|
| Delete a `<PaperProvider>` wrapper, nothing else | ~40 files | Trivial, mechanical |
| `Appbar.Header` → scaffold | 47 files | Mechanical, but it's the big visual win |
| Real component swaps (screens) | ~24 screens | Moderate |
| Real component swaps (shared components) | 10 components | Moderate, high blast radius |
| Date/time pickers | 11 sites | **The only genuine replacement decision** |

---

## The swap table

| Paper | Replacement |
|---|---|
| `PaperProvider` | **Delete.** No wrapper needed. |
| `Appbar.Header` | `ScreenScaffold` / `ListScreenScaffold` / `FixedHeader` |
| `ActivityIndicator` | React Native's, `color={colors.primary}` |
| `TextInput` | `Input` |
| `RadioButton` | `Card selected` option list, or `sheet()` |
| `Checkbox` | Custom row: `checkmark` icon in a `radius.sm` box |
| `Switch` | React Native's `Switch` with token `trackColor`/`thumbColor` |
| `Portal` + `Modal` | RN `Modal`, or `alert()` / `sheet()` from `useAlert()` |
| `Divider` | `<View style={{ height: borderWidth.hairline, backgroundColor: colors.hairline }} />` |
| `DatePickerModal` / `TimePickerModal` | See the decision below |

### `PaperProvider` — delete

```tsx
// BEFORE
<PaperProvider>
  <View style={{ flex: 1 }}>…</View>
</PaperProvider>

// AFTER
<View style={{ flex: 1 }}>…</View>
```

### `Appbar.Header` → scaffold

```tsx
// BEFORE
<PaperProvider>
  <Appbar.Header style={{ paddingHorizontal: normalizeSize(10), backgroundColor: transparent, gap: normalizeSize(10) }}>
    <BackButton onPress={router.back} />
    <ThemedText type='subtitle' font='Poppins-Bold'>Upcoming</ThemedText>
  </Appbar.Header>
  <FlashList data={items} renderItem={renderItem} />
</PaperProvider>

// AFTER
<ListScreenScaffold
  title="Upcoming"
  padded
  data={items}
  renderItem={renderItem}
  keyExtractor={(i) => i.id}
  ListEmptyComponent={<EmptyState … />}
/>
```

> `ListScreenScaffold` wraps `Animated.FlatList`, not `FlashList`. For long lists where
> FlashList's recycling matters (chat history, large doctor lists), either keep FlashList
> inside a `FixedHeader`, or add a `FlashList` variant of the scaffold. Don't silently
> downgrade a virtualized list.

### `ActivityIndicator`

```tsx
// BEFORE
import { ActivityIndicator } from 'react-native-paper';
<ActivityIndicator />

// AFTER
import { ActivityIndicator } from 'react-native';
const { colors } = useTheme();
<ActivityIndicator color={colors.primary} />
```

### `TextInput` → `Input`

```tsx
// BEFORE
<TextInput mode="outlined" label="Email" value={email} onChangeText={setEmail}
  left={<TextInput.Icon icon="email" />} />

// AFTER
<Input label="Email" value={email} onChangeText={setEmail}
  leftIcon="envelope" keyboardType="email-address" autoCapitalize="none" />
```

### `RadioButton` → selectable cards

Paper's radio dot is MD3. The system's equivalent is a `Card` whose border upgrades to
`borderWidth.thick` `primaryFocus` when selected.

```tsx
// AFTER
{BLOOD_GROUPS.map((g) => (
  <Card key={g} selected={value === g} onPress={() => setValue(g)}
        accessibilityLabel={`Blood group ${g}`}>
    <ThemedText weight={value === g ? 'semiBold' : 'regular'}>{g}</ThemedText>
  </Card>
))}
```

For a long list (10+ options), use `sheet()` instead — a wall of cards is worse than a
picker.

### `Switch`

```tsx
// AFTER
import { Switch } from 'react-native';
<Switch
  value={enabled}
  onValueChange={setEnabled}
  trackColor={{ false: colors.hairline, true: colors.primaryFill }}
  thumbColor={colors.canvas}
/>
```

### `Divider`

```tsx
// AFTER
<View style={{ height: borderWidth.hairline, backgroundColor: colors.hairline }} />
```

---

## The date/time picker decision

**The only place with no in-house replacement** — 8 `DatePickerModal` + 3 `TimePickerModal`
sites, plus 6 files calling `registerTranslation(enGB)`.

| Option | Pros | Cons |
|---|---|---|
| **(a) `@react-native-community/datetimepicker`** | Native wheel/dialog on both platforms; tiny; familiar; accessible for free; no design debt | Barely styleable — it will look like the OS, not like the app |
| **(b) Build a token-styled date sheet** on the existing `@gorhom/bottom-sheet` | Full control; perfectly on-language | Real work: calendar grid, month paging, locale, a11y, edge cases |
| **(c) Keep `react-native-paper-dates`** as the last Paper dep | Zero migration work | Keeps the MD3 look *and* the whole Paper dependency tree — defeats the purpose |

**Recommendation: (a)** for dates of birth and any free date/time entry. A native picker
looking native is acceptable and honest; it is also the accessible default.

**And a separate point:** appointment **slot selection should not be a time picker at all.**
A patient picks from the doctor's available slots — that's a chip grid of concrete times,
not a freeform wheel. Replacing `TimePickerModal` on the booking screen with a slot grid is
a UX improvement, not just a migration. `TimePickerModal` on the *doctor's* schedule-setup
screens (where they define availability windows) is genuine free time entry — (a) fits
there.

---

## Recommended order

Each phase is independently shippable and verifiable.

### Phase 0 — Foundations
Copy `templates/` in. Add `constants/palette.ts`, `constants/typography.ts`,
`constants/layout.ts`, `lib/normalize.ts`, `theme/ThemeProvider.tsx`. Mount `ThemeProvider`
in `app/_layout.tsx`. Bundle Inter for Android.

**Also fix here — these are pre-existing bugs, not migration work:**
- **Move font loading out of `components/ThemedText.tsx`.** It currently calls `useFonts()`
  with 18 Poppins families *inside the component body* and returns `null` until they
  resolve — so every text node in the app flashes empty on first render. Load fonts once in
  `app/_layout.tsx` behind the splash gate.
- **Fix the `useColorScheme.web` imports on native.** Several files (e.g.
  `components/BackButton.tsx`, `app/(app)/(patient)/(schedule)/upcoming.tsx`) import from
  `'@/hooks/useColorScheme.web'`, whose hydration guard returns `'light'` on first render —
  a dark-mode flash on native.
- **Converge the three token systems.** `constants/Colors.ts` is dead Expo boilerplate
  (teal `#0a7ea4`, used only by `useThemeColor` → `ThemedText`/`ThemedView`);
  `utils/colors.ts` is the real palette; `components/home/editorial/tokens.ts` is siloed to
  the patient home screen. Point everything at `constants/palette.ts`.
- **Decide the fate of `components/apple/`.** It already has `Button`, `TextField`,
  `SelectField`, `Chip`, `Dialog`/`DialogHost`, `LiquidGlass`, `tokens.ts`,
  `useAppleTheme.ts`. The new system supersedes `useAppleTheme` with
  `ThemeProvider`/`useTheme`. Promote what's good, retire the rest — don't run both.

### Phase 1 — `components/auth/Input.tsx`
**The single highest-leverage file.** It's a Paper `TextInput mode="outlined"` wrapper with
a left icon and a password peek. Swapping it to the new `Input` removes Paper from the
entire auth flow in one edit.

### Phase 2 — The header sweep
`Appbar.Header` → scaffold across 47 files. The biggest visual change in the whole project
and the moment the app starts feeling like the new system. Do it in batches by route group
so review stays tractable.

### Phase 3 — Trivial `PaperProvider` deletions
~40 files, mechanical, zero visual change. Safe to do in one pass.

### Phase 4 — Remaining component swaps
`ActivityIndicator`, `RadioButton`, `Checkbox`, `Switch`, `Portal`/`Modal`, `Divider`, and
the remaining `TextInput` sites. Start with the three heaviest screens:
`(patient)/(patientSetup)/home.tsx`, `(patient)/patientSetup.tsx`,
`(doctor)/(chats)/addPresriptions.tsx`.

### Phase 5 — Pickers
Per the decision above. Also drop the 6 `registerTranslation(enGB)` calls.

### Phase 6 — Remove and clean up
- `yarn remove react-native-paper react-native-paper-dates`
- **Delete dead routes.** There is real duplication: `(patient)/(patientSetup)/*` (old,
  Paper-based) vs `(patient)/(setup)/*` (new, Apple-based) both contain `allergies`,
  `bloodGroup`, `genotype`, `familyDiseases`/`family`, `familyGiagnostic`; plus loose copies
  at `(patient)/allergies.tsx`, `(patient)/bloodGroup.tsx`, `(patient)/genotype.tsx`,
  `(patient)/patientSetup.tsx`. **Confirm which are live before migrating** — do not spend a
  day restyling a screen nothing routes to.
- Delete `components/doctorHome/TopBlogs copy.tsx` (stray duplicate).
- Remove the now-unused `constants/Colors.ts` and `hooks/useThemeColor.ts` if nothing
  references them.

---

## Verification per phase

After every phase:

- [ ] `yarn tsc --noEmit` clean
- [ ] App builds and boots on **both** iOS and Android
- [ ] Touched screens checked in **light AND dark**
- [ ] Text scaling at 1.4× doesn't break the touched layouts
- [ ] No new `console.warn` from `Icon` about unmapped SF Symbols
- [ ] Navigation still works — back, deep links, tab switching

After the header sweep specifically: confirm the collapse animation on a **physical Android
device**, not just the simulator.

---

## Definition of done

- [ ] `grep -rn "react-native-paper" app/ components/ hooks/ utils/` → **no results**
- [ ] Neither package in `package.json`; lockfile regenerated
- [ ] No `Appbar` anywhere
- [ ] Every screen sets `headerShown: false` and renders a scaffold
- [ ] One token system — no imports from `constants/Colors.ts` or `utils/colors.ts`
- [ ] Fonts load once in `app/_layout.tsx`
- [ ] Light **and** dark verified across every route group
- [ ] Dead duplicate routes deleted
