# HealthTok Design System

An Apple-inspired UI/UX design language for **HealthTok**, a telemedicine app built with
Expo / React Native.

Derived from [claude-apple-design-system](https://github.com/rukkiecodes/claude-apple-design-system),
which distils [getdesign.md/apple](https://getdesign.md/apple/design-md) — then adapted for
a dark-capable, patient-facing clinical product.

---

## What this is

A **Claude Code skill** plus drop-in source. Point an agent at it and it will build UI that
matches the system instead of inventing one per screen.

- One accent: **HealthTok Deep Blue `#052093`**
- **SF Pro** on iOS, **Inter** on Android
- Full **light + dark** themes, contrast-measured
- Pill CTAs, no chrome shadows, a strict **400 / 600 / 700** weight ladder
- A **collapsing large-title header** on every screen
- HealthTok's signature **curved bottom tab bar**, preserved

## Why it exists

HealthTok's UI runs on react-native-paper, which implements Material Design 3 — it makes
the app feel heavy and fights the intended language. This system replaces it with a
lighter, sharper, hand-built set of primitives. See `references/migration.md` for the
removal playbook.

---

## Install as a skill

```bash
git clone https://github.com/rukkiecodes/healthtok-design-system.git \
  ~/.claude/skills/healthtok-design-system
```

Or, per-project, into `.claude/skills/`. Claude picks it up from the frontmatter in
`SKILL.md` whenever a task involves building, restyling, or reviewing HealthTok UI.

## Use the templates

`templates/` holds real, working source — not pseudocode. Copy it into the app and adjust
import paths:

```
templates/
  lib/normalize.ts                          size / font-size / color normalizers
  constants/palette.ts                      light + dark palettes, brand ramp
  constants/typography.ts                   SF Pro + Inter, weight ladder, type scale
  constants/layout.ts                       spacing, radius, borderWidth, control, motion
  theme/ThemeProvider.tsx                   system | light | dark, persisted
  components/ui/ThemedText.tsx              the only text primitive
  components/ui/Icon.tsx                    SF Symbols → MaterialCommunityIcons
  components/ui/Button.tsx                  the pill CTA
  components/ui/Input.tsx                   text field
  components/ui/Card.tsx                    the universal card
  components/navigation/ScreenScaffold.tsx  collapsing header, 3 variants
```

Then mount the provider once:

```tsx
// app/_layout.tsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

Peer dependencies: `expo-image`, `expo-haptics`, `expo-router`,
`react-native-reanimated`, `react-native-safe-area-context`,
`@react-native-async-storage/async-storage`, `@expo/vector-icons`.

Android also needs Inter bundled (`Inter-Regular`, `Inter-SemiBold`, `Inter-Bold`) and
loaded once in `app/_layout.tsx`.

---

## Documentation

| File | What's in it |
|---|---|
| `SKILL.md` | The 9 non-negotiable rules + telemedicine duties. **Start here.** |
| `references/tokens.md` | Every token: color, spacing, radius, border width, type, motion, normalizers |
| `references/colors.md` | Full light + dark palette by role, with measured contrast and pairing guidance |
| `references/headers.md` | The collapsing large-title header — the most important component |
| `references/tab-bar.md` | The curved bottom tab bar: preserved, themed, its sanctioned exceptions |
| `references/components.md` | Exact spec for every component, incl. the telemedicine set |
| `references/screens.md` | Whole-screen blueprints for both roles |
| `references/migration.md` | The react-native-paper removal playbook |
| `references/checklist.md` | Do / Don't audit list with severities |
| `references/apple-design-source.md` | The canonical Apple spec, verbatim — the "why" |

---

## The one thing to know

`#052093` is a very dark blue. It's excellent on white (12.85:1) and **invisible on dark**
(1.40:1). So the accent splits by theme:

| Token | Light | Dark | Use for |
|---|---|---|---|
| `primary` | `#052093` | `#7A9CFF` | Interactive **text and icons** |
| `primaryFill` | `#052093` | `#3560E6` | Filled **surfaces** (button backgrounds) |

Pick by role, not by theme — and **never branch on `isDark` inside a component.**

---

## License

MIT
