# Color Palette — Light & Dark

A **single-accent** system: one deep blue carries every interactive element; everything
else is text, surface, hairline, or status.

Every value is a **semantic token**. In UI code reference the token name — never a raw hex.
Read them through the hook:

```ts
const { colors } = useTheme();
```

Contrast ratios below are measured (WCAG 2.1 relative luminance) against the surface named.
**Do not substitute a value without re-measuring** — the brand blue is unusually dark and
breaks easily on dark surfaces.

---

## The brand ramp

Every blue in the system is a step on one ladder. Hue stays within ~4° of the brand
(228.6°) at every step, so no step ever reads as a second color.

| Step | Hex | Role |
|---|---|---|
| `brand.50` | `#EEF2FF` | `primarySubtle` in light — tinted active-row fill |
| `brand.100` | `#D9E2FF` | |
| `brand.200` | `#B3C4FF` | `primaryPressed` in dark |
| `brand.300` | `#7A9CFF` | **`primary` in dark** — interactive text/icons |
| `brand.400` | `#5C82EE` | |
| `brand.500` | `#3560E6` | **`primaryFill` in dark** — filled CTA surfaces |
| `brand.600` | `#1E44C8` | `primaryFillPressed` in dark |
| `brand.700` | `#0C2FBF` | `primaryFocus` in light — the 2px selected border |
| `brand.800` | `#052093` | ★ **THE BRAND** — `primary` + `primaryFill` in light |
| `brand.900` | `#03145E` | `primaryPressed` in light |

---

## ⚠️ The accent splits in dark mode — read this once, then never think about it again

`#052093` is a **very dark** blue. That's what makes it excellent on white (12.85:1) and
useless on near-black:

| Pairing | Ratio | Verdict |
|---|---:|---|
| `#052093` on `#FFFFFF` (light canvas) | **12.85:1** | Excellent |
| `#052093` on `#161719` (dark canvas) | **1.40:1** | **Invisible.** A button filled with it vanishes. |

So dark mode splits the accent into two tokens:

| Token | Light | Dark | Dark ratio | Use for |
|---|---|---|---|---|
| `primary` | `#052093` | `#7A9CFF` | 6.86:1 on canvas | Interactive **text and icons** — links, back chevron, active tab label, "See all", focused input border |
| `primaryFill` | `#052093` | `#3560E6` | 3.39:1 shape · 5.29:1 for white text on it | Filled **surfaces** — primary button background, filled status badge, progress fill |

Light mode collapses both to the brand. **Pick the right token by role, not by theme, and
never branch on `isDark` inside a component.**

Rule of thumb: *is the color the thing you read, or the thing you read on top of?*
Read it → `primary`. Read on it → `primaryFill` (with `onPrimary`).

---

## Accent tokens

| Token | Light | Dark | Role |
|---|---|---|---|
| `primary` | `#052093` | `#7A9CFF` | The only interactive color. Links, CTAs (text), active states, focus. |
| `primaryPressed` | `#03145E` | `#B3C4FF` | Pressed state of an interactive text/icon. |
| `primaryFill` | `#052093` | `#3560E6` | Filled interactive **surface**. |
| `primaryFillPressed` | `#03145E` | `#1E44C8` | Pressed state of a filled surface. |
| `primaryFocus` | `#0C2FBF` | `#7A9CFF` | The **2px** border on a selected card / chosen option. |
| `primarySubtle` | `#EEF2FF` | `#7A9CFF` @16% | Tinted fill behind an active or selected row. |
| `onPrimary` | `#FFFFFF` | `#FFFFFF` | Text/icon on a filled `primaryFill` or `danger` surface. |

There is **no second brand color.** If you reach for another accent, you've left the
language.

---

## Text / ink

| Token | Light | Dark | Role |
|---|---|---|---|
| `ink` | `#1D1D1F` (16.83:1) | `#FFFFFF` (17.94:1) | Near-black, never pure black. Every headline and body string. |
| `inkMuted80` | `#3C3C43` | `#EBEBF5` @75% | Softer supporting copy, chip labels. |
| `inkMuted48` | `#6E6E73` (5.07:1) | `#98989F` (6.26:1) | Captions, placeholders, disabled text, muted icons, fine print. |
| `inkOnDark` | `#FFFFFF` | `#FFFFFF` | Text on a dark tile regardless of theme (video overlay, inverse surface). |

`inkMuted48` clears 4.5:1 in **both** themes — it is safe for real content, not just
decoration. Nothing goes below it.

---

## Surfaces

| Token | Light | Dark | Role |
|---|---|---|---|
| `canvas` | `#FFFFFF` | `#161719` | The dominant background. Cards, inputs, sheets, most screens. |
| `canvasParchment` | `#F5F5F7` | `#1F2023` | Alternating tiles, filled fields, chips, pressed states. Elevation step 1. |
| `surfacePearl` | `#FAFAFC` | `#26282D` | Grouped-row / ghost-button fill. Elevation step 2. |
| `surfaceInverse` | `#1D1D1F` | `#F5F5F7` | A tile that inverts against the current theme — info toast. |
| `surfaceBlack` | `#000000` | `#000000` | True void only — video call, full-bleed photo. Never theme-flipped. |

Divide sections by **alternating surfaces**, not by borders or shadows — the color change
*is* the divider.

The dark values keep HealthTok's existing `#161719` / `#1F2023` so the migration doesn't
shift the app's established dark background out from under users.

---

## Hairlines & dividers

| Token | Light | Dark | Role |
|---|---|---|---|
| `dividerSoft` | `#F0F0F0` | white @7% | Softest separator — reads as a ring, not a line. Between grouped rows. |
| `hairline` | `#E0E0E0` | white @14% | The default border/separator — card edges, input borders, header underline. |

On dark, hairlines are **alpha white**, not a fixed gray — so they stay correct when
layered over `canvas`, `canvasParchment`, or `surfacePearl` alike.

---

## Overlays

| Token | Light | Dark | Role |
|---|---|---|---|
| `scrim` | black @45% | black @**60%** | The dim behind modals, alerts, sheets. There is no shadow — the scrim *is* the depth. |
| `onDark60` | white @60% | white @60% | Translucent white for controls over photography or video. |

The scrim is **heavier in dark mode on purpose**: a 45% scrim over an already-dark canvas
barely registers, and the sheet stops reading as a layer.

---

## Status — state only, never brand or decoration

| Token | Light | Dark | Role |
|---|---|---|---|
| `danger` | `#FF3B30` | `#FF453A` (5.27:1) | Destructive actions, errors, cancelled states, error borders. |
| `dangerSubtle` | `#FFEBEA` | `#FF453A` @18% | Tinted background of a danger badge or banner. |
| `success` | `#34C759` | `#30D158` (8.87:1) | Completed, verified, paid, positive vitals. |
| `successSubtle` | `#E7F8EC` | `#30D158` @18% | |
| `warning` | `#FF9500` | `#FF9F0A` (8.73:1) | Caution — "under review", "awaiting payment", "expiring soon". |
| `warningSubtle` | `#FFF4E5` | `#FF9F0A` @18% | |
| `info` | `#052093` | `#7A9CFF` | Neutral informational state (tracks the accent). |
| `infoSubtle` | `#EEF2FF` | `#7A9CFF` @16% | |

The dark variants are Apple's own dark-mode system colors — the light hues are too dense
against a dark canvas and read as muddy.

> **Clinical rule:** status colors express **state**, never style. And in a health app,
> **never encode clinical meaning in color alone** — a status badge always carries a
> *word*. Around 8% of men have some color-vision deficiency; "the red one" is not a
> status.

---

## Pairing guide (foreground on background)

| Background | Body text | Muted text | Interactive |
|---|---|---|---|
| `canvas` / `canvasParchment` / `surfacePearl` | `ink` | `inkMuted80` → `inkMuted48` | `primary` |
| filled `primaryFill` or `danger` | `onPrimary` | — | — |
| `surfaceBlack` / video / over photography | `inkOnDark` | `onDark60` | `primary` (dark-mode value) |
| `surfaceInverse` | inverse of `ink` | — | `primary` |

**Status badge coloring:** an *active / live / held* state is a **filled** badge
(`bg: primaryFill`, `fg: onPrimary`); every terminal or neutral state is a
`canvasParchment` badge with a semantic `fg` (`warning` / `danger` / `success` /
`inkMuted48`). Palettes are typed in `components.md`.

---

## Rules recap

- **One accent.** No second brand color anywhere.
- **`primary` for text/icons, `primaryFill` for filled surfaces.** Never branch on `isDark`.
- `ink` is near-black (`#1D1D1F`), *not* pure black. Pure black is reserved for video and
  true void.
- Hairlines on dark are **alpha white**, so they layer correctly.
- The scrim is **heavier on dark**.
- Status hues are for **state only** — and always paired with a word.
- Depth is **surface color + hairline + scrim** — never a shadow.
- Every foreground/background pair a patient must read clears **4.5:1**; UI shapes clear
  **3:1**. If you introduce a color, measure it.
