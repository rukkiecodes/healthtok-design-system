# Design Tokens

Every color, size, radius, border width, and font size in the UI comes from a token.
**Never inline a raw hex, pixel, radius, or width** — reference a token so the whole app
moves together and stays on-language.

Copy-paste-ready source lives in `templates/`. This file is the spec and the rationale.

---

## Color

Semantic names, not raw hues. **One accent** (`primary`); status colors are for state only,
never decoration. Full palette with roles, measured contrast, and pairing guidance is in
**`colors.md`** — read that before choosing a color for anything.

Colors are **theme-dependent** and must be read through the hook:

```ts
import { useTheme } from '@/theme/ThemeProvider';

const { colors, isDark, mode, setMode } = useTheme();
// colors.primary, colors.canvas, colors.hairline, …
```

> **Never** `import { lightColors } from '@/constants/palette'` inside a component. That
> component will not react to a theme change, and it will be wrong in dark mode.

### The one thing that trips people up

`primary` and `primaryFill` are **different tokens**, and in dark mode they are different
colors:

| Token | Light | Dark | Use for |
|---|---|---|---|
| `primary` | `#052093` | `#7A9CFF` | Interactive **text and icons** — links, back chevron, active tab label, "See all" |
| `primaryFill` | `#052093` | `#3560E6` | Filled **surfaces** — primary button background, filled status badge, progress fill |

Light mode collapses them; dark mode cannot. The brand blue is only **1.40:1** against the
dark canvas — a button filled with it is invisible. Use the right one and you never think
about it again; **components must never branch on `isDark`.**

---

## Spacing

8pt-ish base with a couple of sub-steps for tight typographic adjustment. Structural
layout snaps to `sm` / `base` / `lg` / `xl`.

| Token | Value | Typical use |
|---|---:|---|
| `xxs` | 2 | Badge padding, hairline nudges |
| `xs` | 4 | Label→control gap, chip gaps, icon padding |
| `sm` | 8 | Intra-component gaps, header bar padding |
| `md` | 12 | Input vertical padding, button vertical padding |
| `base` | 16 | Compact tile padding, input horizontal padding |
| `lg` | 20 | Card interior padding, stacked form-field gap |
| `xl` | 24 | **The screen gutter.** Section separation. |
| `xxl` | 32 | Major section separation |
| `xxxl` | 48 | Scroll content bottom padding |
| `huge` | 64 | Empty-state vertical padding |

**Gutter rule:** screen content sits inside `spacing.xl` horizontal padding. Lists and
cards never touch the device edge — except deliberately full-bleed rows (chat,
notifications), where the large title still keeps the gutter.

---

## Radius

```ts
radius = { sm: 6, md: 10, lg: 14, xl: 20, pill: 999 }
```

**Grammar — don't invent in-between values:**

| Token | Use |
|---|---|
| `sm` | Inline / compact chrome, progress tracks |
| `md` | Inputs, OTP cells, small tiles |
| `lg` | **The workhorse** — cards, dialogs, sheets, chat bubbles, toasts |
| `xl` | Large hero surfaces |
| `pill` | Anything that reads as an **action** — CTAs, search, filter chips, badges, avatars |

Always pair a radius with **`borderCurve: 'continuous'`** (the iOS squircle). It is part of
the house style; a plain rounded rect reads visibly cheaper next to a continuous one.

---

## Border widths

An explicit token set. The reference apps hardcoded `1` everywhere, which meant separators
couldn't be tuned globally and "selected" states drifted apart. There are exactly four
values and **nothing is ever thicker than `thick`.**

| Token | Value | Use |
|---|---|---|
| `none` | 0 | No border |
| `hairline` | `StyleSheet.hairlineWidth` | True 1-physical-px separators — list rows, header underline, divider Views |
| `thin` | 1 | **Default edge** — cards, inputs, chips, outline buttons |
| `thick` | 2 | **Selected state ONLY** — the chosen account type, the picked appointment slot. The only 2px in the system. |

Border **color** carries state; border **width** does not — except for selection:

| State | Width | Color |
|---|---|---|
| Default | `thin` | `hairline` |
| Focused input | `thin` | `primary` |
| Error input | `thin` | `danger` |
| **Selected** card/option | `thick` | `primaryFocus` |

An input is never "selected", so an input border never becomes 2px. Focus changes the
color only — a width change on focus makes the field visibly jump.

---

## Margins & padding conventions

Prefer **`gap` on a flex container** over per-child margins — it keeps rhythm even and
survives conditional children. Reserve `marginTop`/`marginBottom` for one-off nudges.

| Context | Value |
|---|---|
| Screen gutter (horizontal) | `spacing.xl` |
| Screen top padding | Scaffold handles it (`insets.top + BAR_HEIGHT + spacing.sm`) |
| Card / dialog interior padding | `spacing.lg` |
| Compact tile / field padding | `spacing.base` |
| Text-input vertical padding | `spacing.md` |
| Chip / badge padding | `spacing.sm` × `spacing.xxs` |
| Gap between stacked form fields | `spacing.lg` |
| Gap between a label and its control | `spacing.xs` |
| Gap between chips in a row | `spacing.xs` |
| Between major sections | `spacing.xl` → `spacing.xxl` |
| Empty-state vertical padding | `spacing.huge` |
| Bottom padding on a tab screen | Enough to clear the curved tab bar — see `tab-bar.md` |

---

## Elevation

There is **no shadow system.** Depth comes from:

1. **Surface color change** — `canvas` → `canvasParchment` → `surfacePearl`.
2. **Hairlines** between grouped rows and around cards.
3. **A scrim** behind modals, alerts, and sheets (`scrim`, heavier on dark).

Exactly two shadows are sanctioned in the whole app:
- The soft drop under hero / product imagery resting on a surface.
- The curved tab bar's floating active button (see `tab-bar.md`).

Never on a card, button, sheet, input, chip, or text.

---

## Control sizing & hit targets

```ts
control = { minTarget: 44, heightSm: 34, heightMd: 44, heightLg: 52 }
iconSize = { xs: 14, sm: 18, md: 20, lg: 22, xl: 26, hero: 44 }
```

`control.minTarget` (44pt) is Apple's HIG floor and **non-negotiable here** — assume
unsteady hands, tremor, or one-handed use in bed. Where a control must render smaller than
44pt, give it `hitSlop` to reach 44.

---

## Typography

Full rationale in `templates/constants/typography.ts`. The short version:

**Face:** SF Pro on iOS (`fontFamily: 'System'`, free and native), **Inter** bundled on
Android (Apple's license forbids shipping SF Pro there; Inter was drawn as an SF-alike).

**Weight ladder: 400 / 600 / 700. 500 is banned.**

| Weight | Token | Use |
|---|---|---|
| 400 | `regular` | Body, default, **button labels** |
| 600 | `semiBold` | Labels, emphasis, inline header title, card titles |
| 700 | `bold` | Headlines, the large collapsing title |

> iOS resolves weight via `fontWeight` on the one `System` family; Android picks weight by
> **family name** and ignores `fontWeight` for bundled fonts. The `typeface` export handles
> both — spread it (`style={typeface.semiBold}`), don't set `fontFamily` yourself.

**Size ramp — true point sizes.** Declared == rendered on a 375pt-wide device.

| Token | Size | Use |
|---|---:|---|
| `heroDisplay` | 52 | Splash / onboarding hero |
| `title1` | 40 | Auth hero |
| `title2` | 28 | **The large collapsing screen title** |
| `title3` | 22 | Empty-state title, dashboard name, OTP digits |
| `headline` | 20 | Card titles, section headers, dialog titles |
| `body` | 17 | **Default paragraph + button labels** — Apple's reading pace |
| `callout` | 15 | Secondary body, input labels |
| `caption` | 13 | Metadata, chips, hints, error text |
| `micro` | 11 | Timestamps, badge counts, legal |

> **Divergence from the reference app.** QueenSkilla's `normalizeFontSize` divides by 1.5,
> so its declared `body: 17` rendered at **11pt** and captions at 9pt. That is below
> accessibility guidance and wrong for a patient-facing health app. HealthTok dropped the
> divisor and re-based the scale. Ratios are preserved; sizes are legible.

**Line heights** ship as tokens (1.05× at display sizes up to 1.45× at reading sizes) —
the reference had none, which left consultation notes and prescription text cramped.

**Letter spacing** is negative at `headline` and above only. Never at `body` or smaller.

**Text scaling:** `MAX_FONT_SCALE = 1.4`. Components pass `maxFontSizeMultiplier`.
**Never** set `allowFontScaling={false}` on anything a patient reads.

---

## Motion

Quiet and quick. Entrances 150–240ms ease-out cubic; a subtle spring is fine, no bounce.

```ts
motion = {
  fast: 150, base: 200, slow: 240,
  toastDismiss: 3500,
  actionDelay: 240,
  springPress: { damping: 18, stiffness: 320, mass: 0.6 },
  pressScale: { button: 0.95, card: 0.98, chip: 0.96, star: 0.85 },
}
```

`motion.actionDelay` is the gap between dismissing a modal and running the pressed action,
so a follow-up native picker (camera / document / library) presents cleanly. Skipping it is
the classic "the picker didn't open" bug.

---

## Responsive normalizers

Keep tokens visually consistent across device sizes. Baseline is **375 × 812**.

```ts
// scale layout by screen width — unclamped
normalizeSize(size) = round(PixelRatio.roundToNearestPixel((SCREEN_WIDTH / 375) * size))

// scale type by the smaller axis, CLAMPED to [0.9, 1.15]
normalizeFontSize(size) = {
  raw   = min(SCREEN_WIDTH / 375, SCREEN_HEIGHT / 812)
  scale = clamp(raw, 0.9, 1.15)
  return round(PixelRatio.roundToNearestPixel(size * scale))
}
```

**Why type is clamped but layout is not:** layout should stretch to fill a tablet; reading
size should not. Unclamped, a 10" tablet renders body at ~28pt. The clamp also keeps small
phones from dropping below legibility.

`normalizeColor(input, alpha?)` parses hex or `rgba()` and emits a normalized `rgba()`
string, so the palette is one uniform format and alpha variants are derived rather than
hand-written.
