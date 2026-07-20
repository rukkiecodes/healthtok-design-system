/**
 * Typography — SF Pro on iOS, Inter on Android.
 *
 * SF Pro is Apple's system font: free and native on iOS via `fontFamily: 'System'`,
 * but Apple's license forbids redistributing it on Android. Inter is the canonical
 * substitute — it was drawn as an SF-alike and its metrics are close enough that
 * the same tokens land correctly on both platforms.
 *
 * WEIGHT LADDER: 400 / 600 / 700. 500 IS BANNED.
 * A medium weight muddies the Apple cadence — emphasis steps straight from
 * regular to semibold. Do not add one, even if the font file ships it.
 */
import { Platform } from 'react-native';
import { normalizeFontSize as f } from '../lib/normalize';

export const fonts = {
  /** 400 — body copy, default, button labels */
  regular: Platform.select({ ios: 'System', default: 'Inter-Regular' }) as string,
  /** 600 — labels, emphasis, inline header title, cancel actions */
  semiBold: Platform.select({ ios: 'System', default: 'Inter-SemiBold' }) as string,
  /** 700 — headlines, the large collapsing title */
  bold: Platform.select({ ios: 'System', default: 'Inter-Bold' }) as string,
} as const;

/**
 * iOS resolves weight via `fontWeight`, not a family name — 'System' is one
 * family. Android picks the weight by family name and IGNORES fontWeight for
 * bundled fonts. Spreading this per weight is the only thing that renders
 * correctly on both.
 *
 *   <Text style={typeface.semiBold}>…</Text>
 */
export const typeface = {
  regular: Platform.select({
    ios: { fontFamily: 'System', fontWeight: '400' as const },
    default: { fontFamily: 'Inter-Regular' },
  }),
  semiBold: Platform.select({
    ios: { fontFamily: 'System', fontWeight: '600' as const },
    default: { fontFamily: 'Inter-SemiBold' },
  }),
  bold: Platform.select({
    ios: { fontFamily: 'System', fontWeight: '700' as const },
    default: { fontFamily: 'Inter-Bold' },
  }),
} as const;

export type FontWeightToken = keyof typeof typeface;

/**
 * TRUE POINT SIZES — declared == rendered on a 375pt-wide device.
 * (The QueenSkilla reference divided these by 1.5; see lib/normalize.ts.)
 */
export const fontSize = {
  heroDisplay: f(52), // splash / onboarding hero only
  title1:      f(40), // auth hero
  title2:      f(28), // ★ the large collapsing screen title
  title3:      f(22), // empty-state title, dashboard name, OTP digits
  headline:    f(20), // card titles, section headers, dialog titles
  body:        f(17), // ★ default paragraph + button labels — Apple's reading pace
  callout:     f(15), // secondary body, input labels
  caption:     f(13), // metadata, chips, hints, error text
  micro:       f(11), // timestamps, badge counts, legal
} as const;

export type FontSizeToken = keyof typeof fontSize;

/**
 * Line heights. The reference app shipped none, which left long-form medical copy
 * (consultation notes, prescriptions, symptom descriptions) cramped. Multipliers
 * are tighter on display sizes and looser on reading sizes.
 */
export const lineHeight: Record<FontSizeToken, number> = {
  heroDisplay: Math.round(fontSize.heroDisplay * 1.05),
  title1:      Math.round(fontSize.title1 * 1.1),
  title2:      Math.round(fontSize.title2 * 1.15),
  title3:      Math.round(fontSize.title3 * 1.25),
  headline:    Math.round(fontSize.headline * 1.3),
  body:        Math.round(fontSize.body * 1.45),
  callout:     Math.round(fontSize.callout * 1.45),
  caption:     Math.round(fontSize.caption * 1.4),
  micro:       Math.round(fontSize.micro * 1.35),
};

/**
 * Negative tracking at display sizes is the "Apple tight" cadence. NEVER apply
 * it to body or smaller — it hurts legibility at reading size.
 */
export const letterSpacing: Partial<Record<FontSizeToken, number>> = {
  heroDisplay: -1.2,
  title1: -0.8,
  title2: -0.5,
  title3: -0.3,
  headline: -0.2,
};

/**
 * Cap for OS font scaling. HealthTok previously set `allowFontScaling={false}`,
 * which hard-blocks the accessibility text-size setting — the wrong call for a
 * patient-facing health app. Allow scaling, but cap it so layouts survive.
 */
export const MAX_FONT_SCALE = 1.4;
