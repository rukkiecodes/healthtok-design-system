/**
 * Spacing, radius, border widths, and control sizing.
 *
 * Every spatial value in the UI comes from here. Never inline a raw number.
 */
import { normalizeSize as s, HAIRLINE } from '../lib/normalize';

/** 8pt-ish base with sub-steps for tight typographic adjustment. */
export const spacing = {
  xxs:  s(2),
  xs:   s(4),
  sm:   s(8),
  md:   s(12),
  base: s(16),
  lg:   s(20),
  xl:   s(24),  // ← the screen gutter
  xxl:  s(32),
  xxxl: s(48),
  huge: s(64),
} as const;

export type SpacingToken = keyof typeof spacing;

/**
 * Radius grammar — don't invent in-between values:
 *   sm   inline / compact chrome
 *   md   inputs, OTP cells, small tiles
 *   lg   cards, dialogs, sheets, chat bubbles   ← the workhorse
 *   xl   large hero surfaces
 *   pill anything that reads as an ACTION
 *
 * Always pair a radius with `borderCurve: 'continuous'` (the iOS squircle).
 */
export const radius = {
  sm:   s(6),
  md:   s(10),
  lg:   s(14),
  xl:   s(20),
  pill: 999, // deliberately un-normalized
} as const;

export type RadiusToken = keyof typeof radius;

/**
 * BORDER WIDTHS — an explicit token set.
 *
 * The reference apps had no border-width token; every border was a literal
 * `borderWidth: 1`, which meant separators could not be tuned globally and
 * "selected" states were inconsistent. There are exactly four values, and
 * NOTHING is ever thicker than `thick`.
 *
 *   none     0                       no border
 *   hairline StyleSheet.hairlineWidth true 1-physical-px separators, list rows
 *   thin     1                       DEFAULT — cards, inputs, chips
 *   thick    2                       SELECTED state ONLY — the only place 2px appears
 */
export const borderWidth = {
  none: 0,
  hairline: HAIRLINE,
  thin: 1,
  thick: 2,
} as const;

export type BorderWidthToken = keyof typeof borderWidth;

/**
 * Minimum hit targets. 44 is Apple's HIG floor and non-negotiable for a
 * patient-facing app — assume unsteady hands.
 */
export const control = {
  minTarget: 44,
  heightSm: s(34),
  heightMd: s(44),
  heightLg: s(52),
} as const;

/** Collapsing-header metrics. Raw, NOT normalized — 44 is a platform constant. */
export const header = {
  BAR_HEIGHT: 44,
  COLLAPSE_DISTANCE: 44,
  FADE_START: 12,
  /** Keeps the inline title optically centered against back/action slots. */
  SLOT_MIN_WIDTH: 64,
} as const;

/** Icon sizing ladder. */
export const iconSize = {
  xs: s(14),
  sm: s(18),
  md: s(20), // default
  lg: s(22), // header actions
  xl: s(26), // back chevron
  hero: s(44), // empty states
} as const;

/**
 * Motion. Quiet and quick — entrances 150–240ms ease-out, no bounce.
 */
export const motion = {
  fast: 150,
  base: 200,
  slow: 240,
  toastDismiss: 3500,
  /**
   * Delay between dismissing a modal and running the pressed action, so a
   * follow-up native picker (camera / document / library) presents cleanly.
   */
  actionDelay: 240,
  springPress: { damping: 18, stiffness: 320, mass: 0.6 },
  pressScale: {
    button: 0.95,
    card: 0.98,
    chip: 0.96,
    star: 0.85,
  },
} as const;
