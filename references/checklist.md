# Design Compliance Checklist

Audit UI against this. Report every violation as:

```
file:line — rule broken → fix
```

Severity: **Blocker** (accessibility or clinical safety) · **Should-fix** (breaks the
language) · **Nit** (inconsistent but harmless).

---

## 1. Color

| Do | Don't |
|---|---|
| Read every color from `useTheme().colors` | Import `lightColors`/`darkColors` in a component — it won't react to theme changes |
| Use `primary` for interactive **text/icons** | Use `primary` as a button background — it's `#7A9CFF` on dark and glares |
| Use `primaryFill` for filled **surfaces** | Use `primaryFill` for link text — it's under-contrast on dark |
| Let tokens handle the theme | Branch on `isDark` inside a component |
| Keep one accent | Introduce a second brand color |
| Use status colors for **state** | Use `success`/`warning`/`danger` decoratively |

- [ ] No raw hex in components — `grep -rn "#[0-9a-fA-F]\{3,8\}" app/ components/` should only hit `constants/palette.ts`
- [ ] No `isDark ?` ternaries picking colors — `grep -rn "isDark ?" app/ components/`
- [ ] Every new color pairing measured: **4.5:1** for text, **3:1** for UI shapes

**Blocker:** any patient-readable text below 4.5:1.

## 2. Dark mode

- [ ] Every screen opened in **both** themes before it ships
- [ ] No hardcoded `'#fff'` / `'#000'` / `'white'` / `'black'`
- [ ] Hairlines on dark are alpha-white tokens, not a fixed gray
- [ ] Scrim uses the token (heavier on dark) — a 45% scrim over a dark canvas is invisible
- [ ] Contents of always-dark surfaces (video, tab bar) use `inkOnDark` / `onDark60`, never `ink`
- [ ] The Appearance setting (System / Light / Dark) actually drives `useTheme().setMode`

## 3. Typography

| Do | Don't |
|---|---|
| `<ThemedText>` for every string | A raw `<Text>` |
| `weight="regular"\|"semiBold"\|"bold"` | **Any 500 / "medium" weight** |
| `size` tokens | An inline `fontSize` number |
| Spread `typeface.*` | Set `fontFamily` + `fontWeight` by hand (Android ignores `fontWeight` on bundled families) |
| Let `maxFontSizeMultiplier` cap scaling | `allowFontScaling={false}` on patient copy |

- [ ] `grep -rn "<Text" app/ components/` → only inside design-system primitives
- [ ] `grep -rn "fontWeight: '500'\|Medium" ` → no results
- [ ] `grep -rn "allowFontScaling={false}" ` → no results on patient-facing screens
- [ ] Negative `letterSpacing` only at `headline` and above
- [ ] Nothing a patient must read is below `caption` (13pt)

**Blocker:** `allowFontScaling={false}` on clinical content; body copy below 13pt.

## 4. Spacing & layout

- [ ] All spacing from `spacing.*` — no magic numbers
- [ ] `gap` on flex containers rather than per-child margins
- [ ] Screen content respects the `spacing.xl` gutter; nothing touches the device edge
- [ ] Tab screens reserve bottom padding to clear the curved tab bar
- [ ] Pinned CTAs clear both the tab bar and `insets.bottom`

## 5. Radius & borders

- [ ] Radii from the scale — no in-between values
- [ ] **`borderCurve: 'continuous'` on every rounded surface** — `grep -rn "borderRadius" ` and check each site
- [ ] Widths from `borderWidth.*` — no literal `borderWidth: 1`
- [ ] `borderWidth.thick` (2px) appears **only** on a selected card/option
- [ ] Input focus changes border **color**, never width

## 6. Elevation

| Do | Don't |
|---|---|
| Depth via surface change + hairline + scrim | A shadow on a card, button, sheet, input, chip, or text |
| Alternate `canvas` → `canvasParchment` → `surfacePearl` | `elevation` on Android surfaces |

- [ ] `grep -rn "shadowColor\|shadowOpacity\|elevation:" app/ components/` → **only** the
      curved tab bar's floating button and hero imagery

**Should-fix:** any other shadow.

## 7. Components

- [ ] Buttons use the four variants; primary is a full pill
- [ ] Button labels stay `regular` weight — the pill carries emphasis
- [ ] `useAlert()` everywhere — `grep -rn "Alert.alert\|ActionSheetIOS" ` → **no results**
- [ ] `sheet()` instead of dropdowns and pickers
- [ ] Toast for confirmations; alert only when a choice is required
- [ ] Every list has an `EmptyState` as `ListEmptyComponent`
- [ ] Status badges come from a typed palette and **always render a word**
- [ ] `Icon` for every icon — `grep -rn "source=\"sf:" ` → no results outside `Icon.tsx`
- [ ] New SF Symbol names added to `ANDROID_GLYPH` in the same commit

## 8. Headers & navigation

- [ ] `headerShown: false` on every screen — no native Stack header
- [ ] `grep -rn "Appbar" ` → no results
- [ ] Tab roots pass `showBack={false}` and fill `left`/`right`
- [ ] Form-sheet screens pass `sheet`
- [ ] Inverted chat lists, WebViews, and video use `FixedHeader`, not a collapsing scaffold
- [ ] The dashboard greeting hero is the only bespoke header

## 9. Motion

- [ ] Entrances 150–240ms ease-out; no bounce
- [ ] Press scales match the ladder (button .95 / card .98 / chip .96 / star .85)
- [ ] `motion.actionDelay` before any follow-up native picker
- [ ] No animation on a shadow

## 10. Accessibility — **Blocker-level**

- [ ] Every `Pressable` has `accessibilityRole` and, if icon-only, `accessibilityLabel`
- [ ] Screen titles carry `accessibilityRole="header"`
- [ ] Hit targets ≥ 44pt, or `hitSlop` making up the difference
- [ ] Text 4.5:1, UI shapes 3:1 — in **both** themes
- [ ] Layouts survive 1.4× text scaling
- [ ] Selected/disabled states expose `accessibilityState`
- [ ] **Nothing conveys meaning by color alone**

## 11. Telemedicine safety — **Blocker-level**

- [ ] **Every dose carries an explicit unit** — `500 mg`, never `500`
- [ ] Vitals carry units and, where relevant, a reference range
- [ ] Appointment times render a **timezone**
- [ ] Every status shows a word alongside its color
- [ ] Destructive and clinical actions (cancel appointment, delete record, end consult)
      confirm via `alert()` with a `destructive` button
- [ ] AI symptom output is never styled to look like a clinical verdict; it carries a
      persistent disclaimer and a visible escalate-to-a-doctor path
- [ ] Loading, empty, error, offline, and permission-denied states are all designed —
      a spinner on a blank screen is not a state
- [ ] Out-of-range or urgent values are labeled, not just colored

## 12. React Native hygiene

- [ ] No `react-native-paper` imports
- [ ] `KeyboardAvoidingView` uses `behavior="height"` on Android (`"padding"` is an iOS-only no-op)
- [ ] Fonts load **once** in `app/_layout.tsx`, never inside a component
- [ ] No imports from `hooks/useColorScheme.web` on native
- [ ] No hooks called inside `.map()` — see the curved tab bar's known issue in `tab-bar.md`
- [ ] Long lists stay virtualized — don't downgrade a `FlashList` to a `ScrollView` during migration

---

## Review output format

```
app/(app)/(patient)/(schedule)/upcoming.tsx:372 — Paper Appbar.Header used as a header
  → replace with ListScreenScaffold title="Upcoming" padded   [Should-fix]

components/AppointmentCard.tsx:88 — dose rendered without a unit ("{dose}")
  → render `${dose} ${unit}`; a bare number on a prescription is a safety defect   [Blocker]

components/messages/MessageBubble.tsx:41 — hardcoded '#fff' for bubble text
  → colors.onPrimary   [Should-fix]

components/home/QuickAccess.tsx:23 — shadowOpacity on a card
  → remove; use canvasParchment + hairline for separation   [Should-fix]
```

## Severity guide

| Severity | Criteria |
|---|---|
| **Blocker** | Accessibility failure (contrast, scaling, unlabeled control) or clinical-safety defect (missing unit, unconfirmed destructive action, color-only status, AI output styled as a verdict) |
| **Should-fix** | Breaks the design language — shadow, second accent, wrong weight, raw hex, missing `borderCurve`, Paper import |
| **Nit** | Inconsistent token choice with no visual or functional impact |
