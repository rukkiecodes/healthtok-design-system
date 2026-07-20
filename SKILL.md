---
name: healthtok-design-system
description: >-
  HealthTok's UI/UX design language — an Apple Human-Interface-inspired system for a
  telemedicine app. Use when building, restyling, or reviewing ANY HealthTok mobile UI —
  screens, components, buttons, headers, alerts, sheets, cards, forms, typography, color,
  spacing, or dark mode — so the result is calm, sharp, and easy on the eyes for patients.
  One deep-blue accent (#052093), SF Pro / Inter, pill CTAs, no chrome shadows, a strict
  400/600/700 weight ladder, a collapsing large-title header, and the signature curved
  bottom tab bar. Trigger on "design a screen", "style this component", "build the UI",
  "remove react-native-paper", "make it look Apple", or "review my UI for consistency".
metadata:
  author: rukkiecodes
  version: "1.0.0"
  derived-from: rukkiecodes/claude-apple-design-system
  origin: getdesign.md/apple
  reference-platform: react-native-expo
  product: HealthTok (telemedicine)
license: MIT
---

# HealthTok Design System

An Apple-inspired design language for HealthTok, distilled from the canonical
[getdesign.md/apple](https://getdesign.md/apple/design-md) spec via
[claude-apple-design-system](https://github.com/rukkiecodes/claude-apple-design-system),
then adapted for a **telemedicine product** that must work for patients who may be
older, unwell, anxious, or on a bad connection.

Use it so every screen reads as one quiet system — not a pile of one-off styles.

## What makes this different from the parent skill

The Apple source is a light-mode, single-blue, marketing-surface language. HealthTok is
a dark-capable, patient-facing clinical app. Five deliberate divergences:

| # | Divergence | Why |
|---|---|---|
| 1 | Accent is **HealthTok Deep Blue `#052093`**, not Action Blue `#0066cc` | It's the brand. |
| 2 | **Full dark theme** — the parent has none | Patients use this in bed, at night, in waiting rooms. |
| 3 | **True point sizes** — the reference divided its type scale by 1.5, rendering body at 11pt | 11pt body is unreadable for a large share of patients. Declared == rendered. |
| 4 | **Explicit `borderWidth` tokens** — the reference hardcoded `1` everywhere | Separators and selection states need to move together. |
| 5 | **The curved bottom tab bar is preserved** — the parent prescribes native tabs | It's HealthTok's signature. See `references/tab-bar.md`. |

## The 9 non-negotiable rules

Read these first. Breaking one is the fastest way to look off-system.

1. **One accent, ever.** Every interactive element — links, primary CTAs, focus, active
   tab — is HealthTok Deep Blue `#052093` (`primary`). There is no second brand color.
   Semantic colors (danger/success/warning) exist only for **status**, never for style.
2. **The accent splits in dark mode.** `#052093` is only 1.40:1 against the dark canvas —
   as a filled shape it's invisible. Dark mode uses `primary` `#7A9CFF` for interactive
   **text/icons** and `primaryFill` `#3560E6` for filled **surfaces**. Always use
   `primaryFill` for a button background and `primary` for a link. Never branch on `isDark`
   in a component — the tokens already did it for you.
3. **Pill CTAs.** The primary button is a full pill (`radius.pill`). The pill radius *is*
   the "this is an action" signal. Search inputs and filter chips are pills too.
4. **No chrome shadows.** Never put a shadow on a card, button, sheet, input, chip, or
   text. Elevation comes from surface-color change and hairlines. Two sanctioned
   exceptions only: the soft drop under hero/product imagery, and the curved tab bar's
   floating button.
5. **Weight ladder = 400 / 600 / 700. 500 is banned.** Body is 400 (`regular`),
   emphasis/labels are 600 (`semiBold`), headlines are 700 (`bold`). A medium weight
   muddies the Apple cadence.
6. **Hairlines, not borders.** `borderWidth.hairline` for separators, `borderWidth.thin`
   (1px) as the default edge. `borderWidth.thick` (2px) appears in exactly one situation:
   a **selected** card or option. Nothing is ever thicker.
7. **Continuous corners.** Every rounded surface sets `borderCurve: 'continuous'` (the iOS
   squircle). Radii come from the scale — don't invent in-between values.
8. **Air is the pedestal.** Generous whitespace; a large title that collapses on scroll;
   content never touches the screen edge (respect the `spacing.xl` gutter).
9. **Every screen uses the scaffold.** `headerShown: false` everywhere; screens render
   `ScreenScaffold` / `ListScreenScaffold` / `FixedHeader`. Never a Paper `Appbar.Header`,
   never a native Stack header. See `references/headers.md`.

## Telemedicine-specific duties

This is a health product. These are not style preferences — treat them as requirements.

- **Legibility beats density.** When a layout is tight, cut content or add a screen. Never
  shrink below `fontSize.caption` (13pt) for anything a patient must read.
- **Respect OS text scaling.** Components pass `maxFontSizeMultiplier` (capped at 1.4).
  Never set `allowFontScaling={false}` on patient-facing copy.
- **Hit targets ≥ 44pt.** Assume unsteady hands, tremor, or one-handed use in bed.
- **Never encode clinical meaning in color alone.** A status is always a **word** plus a
  color. ~8% of men have some color-vision deficiency.
- **Destructive and clinical actions confirm.** Cancelling an appointment, deleting a
  record, or ending a live consult goes through `alert()` with a `destructive` button.
- **Every async state is designed.** Loading, empty, error, and offline each get a real
  treatment — a spinner on a blank screen is not a state. Patients on poor connections
  will see these more than they see the happy path.
- **Never render raw clinical data.** Doses, dates, and vitals get explicit units and
  formatting. An ambiguous "10" on a prescription screen is a safety issue, not a UI nit.

## References — load what the task needs

```
references/
  apple-design-source.md   The canonical getdesign.md/apple DESIGN.md (verbatim). The "why".
  tokens.md                Color, spacing, radius, BORDER WIDTHS, type, motion + the
                           responsive normalizers. Copy-paste-ready. START HERE.
  colors.md                The full LIGHT + DARK palette by role, with measured contrast
                           ratios and a foreground-on-background pairing guide.
  headers.md               The collapsing large-title header — the single most important
                           component. Full spec + metrics + every usage pattern.
  tab-bar.md               The curved bottom tab bar: preserved, themed, and its
                           sanctioned exceptions to the rules above.
  components.md            Exact spec for every component: Button, Input, OTP, Card, chips,
                           status badges, EmptyState, Toast, Alert, Sheet, Avatar, and the
                           telemedicine set (appointment, doctor, prescription, vitals).
  screens.md               Whole-screen blueprints: auth/onboarding, patient home, doctor
                           home, booking, consultation chat, video call, records, profile.
  migration.md             The react-native-paper removal playbook — every affected file,
                           per-component swaps, and the recommended order.
  checklist.md             The full Do / Don't compliance list to review UI against.

templates/                 Drop-in source. Copy into the app and adjust import paths.
  lib/normalize.ts                       size / font-size / color normalizers
  constants/palette.ts                   light + dark palettes, brand ramp
  constants/typography.ts                SF Pro + Inter, weight ladder, type scale
  constants/layout.ts                    spacing, radius, borderWidth, control, motion
  theme/ThemeProvider.tsx                system|light|dark, persisted
  components/ui/ThemedText.tsx           the only text primitive
  components/ui/Icon.tsx                 SF Symbols → Material Community mapping
  components/ui/Button.tsx               the pill CTA
  components/ui/Input.tsx                text field
  components/ui/Card.tsx                 the universal card
  components/navigation/ScreenScaffold.tsx   collapsing header ×3 variants
```

- **Building a new screen?** `screens.md` for the skeleton, `headers.md` for the frame,
  `components.md` for the parts, `tokens.md` for the values.
- **Building or restyling one component?** Its entry in `components.md` — every padding,
  border width, radius, weight, and color token is spelled out.
- **Removing react-native-paper?** `migration.md`.
- **Reviewing existing UI?** `checklist.md`. Report violations as
  `file:line — rule broken → fix`.
- **Unsure why a rule exists?** `references/apple-design-source.md`.

## Golden rule

When you reach for emphasis, **change the surface or the weight before you add chrome.**
Canvas → parchment → pearl is the Apple way to divide and elevate. A shadow or a second
color almost always means you've left the language.

And the HealthTok corollary: **when in doubt, make it calmer and make it bigger.** This
app is used by people who are worried about their health. Nothing on screen should add to
that.
