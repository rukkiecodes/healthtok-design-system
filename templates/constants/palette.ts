/**
 * HealthTok palette — light + dark.
 *
 * ONE accent: HealthTok Deep Blue #052093. There is no second brand color.
 *
 * Every contrast ratio in the comments below was measured against the surface it
 * sits on (WCAG 2.1 relative luminance). Do not substitute a value without
 * re-measuring — the deep blue is unusually dark and breaks easily on dark
 * surfaces.
 */
import { normalizeColor as n } from '../lib/normalize';

/* ------------------------------------------------------------------ *
 * Brand ramp — every blue in the system is a step on this one ladder.
 * Hue stays within ~4° of the brand (228.6°) at every step.
 * ------------------------------------------------------------------ */
export const brand = {
  50:  '#EEF2FF',
  100: '#D9E2FF',
  200: '#B3C4FF',
  300: '#7A9CFF', // dark-mode interactive text — 6.86:1 on #161719
  400: '#5C82EE',
  500: '#3560E6', // dark-mode filled CTA — 3.39:1 shape, 5.29:1 white-on
  600: '#1E44C8',
  700: '#0C2FBF',
  800: '#052093', // ★ THE BRAND — light-mode primary. 12.85:1 on white
  900: '#03145E', // pressed / deepest
} as const;

/* ================================================================== *
 * LIGHT
 * ================================================================== */
export const lightColors = {
  // — Accent: the ONLY interactive color —
  primary:         n(brand[800]), // links, CTAs, active tab, focus. 12.85:1 on canvas
  primaryPressed:  n(brand[900]),
  primaryFocus:    n(brand[700]), // the 2px border on a SELECTED card/option
  primarySubtle:   n(brand[50]),  // tinted fill behind an active/selected row
  onPrimary:       n('#FFFFFF'),  // 12.85:1 on primary

  // — Text —
  ink:             n('#1D1D1F'), // near-black, never pure black. 16.83:1
  inkMuted80:      n('#3C3C43'), // supporting copy
  inkMuted48:      n('#6E6E73'), // captions, placeholders, disabled. 5.07:1
  inkOnDark:       n('#FFFFFF'),

  // — Surfaces —
  canvas:          n('#FFFFFF'), // dominant background
  canvasParchment: n('#F5F5F7'), // alternating tiles, filled fields, pressed
  surfacePearl:    n('#FAFAFC'), // grouped-row / ghost-button fill
  surfaceInverse:  n('#1D1D1F'), // dark tile on a light screen, info toast
  surfaceBlack:    n('#000000'), // video, true void only

  // — Hairlines —
  dividerSoft:     n('#F0F0F0'),
  hairline:        n('#E0E0E0'),

  // — Overlays —
  scrim:           n('#000000', 0.45), // behind sheets, alerts, modals
  onDark60:        n('#FFFFFF', 0.6),

  // — Status: state ONLY, never decoration —
  danger:          n('#FF3B30'),
  dangerSubtle:    n('#FFEBEA'),
  success:         n('#34C759'),
  successSubtle:   n('#E7F8EC'),
  warning:         n('#FF9500'),
  warningSubtle:   n('#FFF4E5'),
  info:            n(brand[800]),
  infoSubtle:      n(brand[50]),
} as const;

/* ================================================================== *
 * DARK
 *
 * The brand blue #052093 is only 1.40:1 against the dark canvas — as a filled
 * shape it is effectively invisible. Dark mode therefore lifts the accent:
 *   · interactive TEXT / icons → brand[300] #7A9CFF  (6.86:1)
 *   · filled CTA surfaces      → brand[500] #3560E6  (3.39:1 shape)
 * This is the single most important difference between the two themes.
 * ================================================================== */
export const darkColors = {
  primary:         n(brand[300]), // text, links, icons, active tab
  primaryPressed:  n(brand[200]),
  primaryFocus:    n(brand[300]),
  primarySubtle:   n(brand[300], 0.16),
  onPrimary:       n('#FFFFFF'),

  /**
   * Filled-CTA surface. Distinct from `primary` because a button's FILL and its
   * text need different luminance on dark. Light mode collapses these two — dark
   * mode cannot. Always: background primaryFill + text onPrimary.
   */
  primaryFill:     n(brand[500]),
  primaryFillPressed: n(brand[600]),

  ink:             n('#FFFFFF'),       // 17.94:1
  inkMuted80:      n('#EBEBF5', 0.75),
  inkMuted48:      n('#98989F'),       // 6.26:1
  inkOnDark:       n('#FFFFFF'),

  canvas:          n('#161719'), // HealthTok's existing appDark — kept for continuity
  canvasParchment: n('#1F2023'), // elevated one step
  surfacePearl:    n('#26282D'), // elevated two steps
  surfaceInverse:  n('#F5F5F7'),
  surfaceBlack:    n('#000000'),

  dividerSoft:     n('#FFFFFF', 0.07),
  hairline:        n('#FFFFFF', 0.14),

  scrim:           n('#000000', 0.6), // heavier — a 45% scrim is invisible on dark
  onDark60:        n('#FFFFFF', 0.6),

  // Apple's dark-mode status variants — the light hues are too dense on dark
  danger:          n('#FF453A'), // 5.27:1
  dangerSubtle:    n('#FF453A', 0.18),
  success:         n('#30D158'), // 8.87:1
  successSubtle:   n('#30D158', 0.18),
  warning:         n('#FF9F0A'), // 8.73:1
  warningSubtle:   n('#FF9F0A', 0.18),
  info:            n(brand[300]),
  infoSubtle:      n(brand[300], 0.16),
} as const;

/**
 * Light mode has no separate `primaryFill` — the accent is dark enough to fill
 * with directly. Aliasing it keeps `colors.primaryFill` valid in both themes so
 * components never branch on `isDark`.
 */
const lightWithFill = {
  ...lightColors,
  primaryFill: lightColors.primary,
  primaryFillPressed: lightColors.primaryPressed,
} as const;

export const palettes = { light: lightWithFill, dark: darkColors } as const;

export type ColorToken = keyof typeof lightWithFill & keyof typeof darkColors;
export type Palette = Record<ColorToken, string>;
