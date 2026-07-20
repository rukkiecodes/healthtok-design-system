/**
 * Responsive normalizers — the base of every spatial and type token.
 *
 * Baseline device is 375 × 812 (iPhone X-class). A token declared as `16` renders
 * as exactly 16pt on that device and scales proportionally elsewhere.
 *
 * DIVERGENCE FROM THE QUEENSKILLA REFERENCE: its `normalizeFontSize` divides by
 * 1.5, so a declared `body: 17` actually rendered at 11pt. HealthTok is a
 * telemedicine app used by patients who are often older or unwell — 11pt body
 * copy is below accessibility guidance. We dropped the divisor and re-based the
 * declared type scale to true point sizes. Declared == rendered.
 */
import { Dimensions, PixelRatio, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Scale a layout value (padding, margin, radius, icon box, control height) by
 * screen width. Use for anything spatial.
 */
export const normalizeSize = (size: number): number =>
  Math.round(PixelRatio.roundToNearestPixel((SCREEN_WIDTH / BASE_WIDTH) * size));

/**
 * Scale a font size by the smaller screen axis, CLAMPED to [0.9, 1.15].
 *
 * The clamp is deliberate: unclamped scaling makes type comically large on
 * tablets and foldables (a 10" tablet would render body at ~28pt) and cramped on
 * small phones. Layout can stretch; reading size should not.
 */
export const normalizeFontSize = (size: number): number => {
  const raw = Math.min(SCREEN_WIDTH / BASE_WIDTH, SCREEN_HEIGHT / BASE_HEIGHT);
  const scale = Math.min(Math.max(raw, 0.9), 1.15);
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

/**
 * Parse a hex or rgba() string into a normalized `rgba(...)` string, optionally
 * overriding alpha. Every color token goes through this so the palette is one
 * uniform format and alpha variants are derived, never hand-written.
 */
export const normalizeColor = (input: string, alpha?: number): string => {
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 1;

  if (input.startsWith('#')) {
    let hex = input.slice(1);
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    if (hex.length === 6) hex += 'ff';
    if (hex.length !== 8) throw new Error(`Invalid hex color: ${input}`);
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
    a = parseInt(hex.slice(6, 8), 16) / 255;
  } else {
    const m = input.match(/rgba?\(([^)]+)\)/i);
    if (!m) throw new Error(`Unsupported color: ${input}`);
    const parts = m[1].split(',').map((s) => s.trim());
    r = +parts[0];
    g = +parts[1];
    b = +parts[2];
    a = parts[3] !== undefined ? +parts[3] : 1;
  }

  if (alpha !== undefined) a = alpha;
  return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(3))})`;
};

/** True 1-physical-pixel line. Thinner than 1dp on most devices. */
export const HAIRLINE = StyleSheet.hairlineWidth;

export const SCREEN = { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } as const;
