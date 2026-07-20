# The Curved Bottom Tab Bar

HealthTok's signature navigation. **It is preserved as-is** and is the one place this
system deliberately departs from the Apple source language.

Lives at `components/reacticx/base/curved-bottom-tabs/` — `index.tsx`, `helper.ts`,
`types.ts`. It has **zero react-native-paper dependency** (only `react-native-svg`,
`react-native-reanimated`, `react-native-safe-area-context`,
`@react-navigation/bottom-tabs`), so the Paper migration does not touch it.

---

## What it does

- An SVG bar with an animated **notch** that slides to sit under the active tab.
- The active tab lifts out of the bar into a **floating circular button** (spring
  `translateY: -VIEWPORT_HEIGHT * 4.2`), filled with a gradient.
- Inactive tabs render icon + label inside the bar.
- The notch animates on tab change with a spring (`damping 12, stiffness 120, mass 0.5`).
- Optional numeric badges, capped at `99+`.
- Respects `insets.bottom` with a matching filler View beneath.

Both roles use **5 tabs**:

| Role | Tabs |
|---|---|
| Patient | Home · Chats · Schedule · Health Plan · Profile |
| Doctor | Home · Chats · Schedule · Earnings · Profile |

---

## Sanctioned exceptions to the design rules

The tab bar breaks two rules on purpose. These are the **only** places they may be broken.

| Rule | Exception | Why it stands |
|---|---|---|
| **No chrome shadows** | The floating active button carries `shadowOpacity 0.2, shadowRadius 20, elevation 8` | The button physically floats above the bar; without a shadow it reads as a flat sticker rather than a raised control. This is the *one* UI shadow in the app besides hero imagery. |
| **Pill radius = action** | The bar is a full-width SVG shape, not a pill | It's a surface, not a control. The floating button *is* a circle, which is consistent. |

Nothing else in the app inherits these exceptions. Do not cite the tab bar as precedent
for adding a shadow to a card.

---

## Theming

Today both layouts pass `gradients={[accent, accent]}` — i.e. a **flat** `#052093` bar, no
actual gradient. Keep that; a decorative gradient would violate the language.

Under the new theme system the bar must resolve through tokens:

```tsx
const { colors } = useTheme();

<CurvedBottomTabs
  gradients={[colors.primaryFill, colors.primaryFill]}
  barHeight={7}
  activeColor={colors.onPrimary}
  inactiveColor={colors.onDark60}
  labelColor={colors.onDark60}
/>
```

**Use `primaryFill`, not `primary`.** The bar is a filled surface. In dark mode `primary`
is `#7A9CFF` — a bar that color would be a glaring light slab across the bottom of a dark
screen. `primaryFill` (`#3560E6`) keeps it a deep, calm band in both themes.

| Slot | Token | Note |
|---|---|---|
| Bar fill | `primaryFill` | Flat — pass the same color twice |
| Active icon | `onPrimary` | |
| Inactive icon | `onDark60` | Translucent white — the bar is always a dark surface |
| Label | `onDark60` | |
| Badge | `danger` bg, `onPrimary` text | |

The bar is a **dark surface in both themes**, so its contents always use the on-dark
tokens — never `ink`.

---

## Screen bottom padding

The bar floats over content. Every screen inside a tab must reserve room or its last row
sits under the bar.

| Role | Current value |
|---|---|
| Patient tabs | `sceneStyle.paddingBottom: normalizeSize(40)` |
| Doctor tabs | `paddingBottom: normalizeSize(50)` (larger `barHeight`) |

When a screen uses a scaffold, that padding is *in addition to* the scaffold's
`spacing.xxxl` content bottom padding. A screen with a pinned CTA above the tab bar needs
the CTA's own bottom offset to clear both.

The doctor layout also floats a "Report Issue" button at `bottom: normalizeSize(90)` —
anything else pinned above the bar should use a comparable offset, not a hand-picked one.

---

## ⚠️ Two latent bugs — do not refactor around them carelessly

Both are in `CurvedBottomTabsCore` and both are React hook-rules violations that happen to
work today only because **the tab count is a stable 5**:

1. `useSharedValue` is called inside a `.map()` inside `useRef(...)` — hooks in a loop.
2. `useAnimatedStyle` is called inside the `tabs.map()` render loop.

**Consequences:** if the tab count ever changes at runtime — conditionally hiding a tab by
role, feature-flagging one, rendering a different set while loading — the hook order
changes between renders and React will throw or silently corrupt animation state.

**Rules:**
- Never make the tab list dynamic. Render all 5 always; disable rather than remove.
- If you *must* make it dynamic, fix the hooks first: hoist a fixed-size array of shared
  values (sized to a `MAX_TABS` constant) and move the per-tab animated style into a child
  component so each gets its own hook scope.

---

## Icons

Tab icons are currently remote Cloudinary PNGs tinted via `tintColor` (except the doctor
Earnings tab, which uses `lucide-react-native`'s `Wallet`).

**Recommended during the overhaul:** move tab icons onto the system `Icon` component (SF
Symbols → MaterialCommunityIcons) so they match every other icon in the app and stop
depending on a network fetch for primary navigation. Remote icons mean the tab bar renders
empty on a cold start with no connectivity — a bad look for the first screen a patient
sees.

Suggested mapping:

| Tab | SF Symbol |
|---|---|
| Home | `house.fill` |
| Chats | `message.fill` |
| Schedule | `calendar` |
| Health Plan | `heart.text.square` |
| Earnings | `wallet` |
| Profile | `person.fill` |

---

## Android navigation bar

From `app/_layout.tsx`:

> *"The Android system navigation bar is intentionally left in its default state. Forcing
> it (and the window background) to the accent blue caused the whole app to flash dark blue
> during transitions."*

Leave it alone. If you revisit edge-to-edge handling, verify transitions on a physical
Android device before shipping — this is a known regression path.
