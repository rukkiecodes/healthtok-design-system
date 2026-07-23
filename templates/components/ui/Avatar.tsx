/**
 * Avatar / display picture. Implements references/components.md §Avatar. Replaces
 * paper's <Avatar.Image>/<Avatar.Text> and the scattered one-offs (doctorMessages/
 * Avatar, ChatAvatar, …) with ONE circle.
 *
 * Circle: width === height, radius.pill, `canvasParchment` bg, overflow hidden.
 * Image fills cover. Fallback (no image, or it fails to load) is the FIRST
 * initial in semiBold `inkMuted48` — never a broken image or empty grey disc.
 *
 * Sizes are tokens, not raw numbers: inline 20 · list 40 · hero 56 · profile 112.
 *
 *   <Avatar uri={doctor.photo} name={doctor.name} size="hero" />
 *   <Avatar name="Ada Okafor" />          // initial "A"
 *
 * The verified-doctor seal lives BESIDE THE NAME (per the spec), not on the
 * avatar — so this component does not render it.
 */
import React, { useState } from 'react';
import { Image, View } from 'react-native';

import { ThemedText } from './ThemedText';
import { useTheme } from '../../theme/ThemeProvider';
import { radius } from '../../constants/layout';
import { normalizeSize } from '../../lib/normalize';

const SIZES = { inline: 20, list: 40, hero: 56, profile: 112 } as const;
export type AvatarSize = keyof typeof SIZES;

// Initial glyph scales with the circle.
const TEXT_SIZE = { inline: 'caption', list: 'callout', hero: 'title3', profile: 'title1' } as const;

export type AvatarProps = {
  uri?: string | null;
  /** Full name — the first initial is shown when there's no image. */
  name?: string | null;
  size?: AvatarSize;
};

export function Avatar({ uri, name, size = 'list' }: AvatarProps) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  const dim = normalizeSize(SIZES[size]);
  const showImage = uri && !failed;
  const initial = (name ?? '').trim().charAt(0).toUpperCase();

  return (
    <View
      style={{
        width: dim,
        height: dim,
        borderRadius: radius.pill,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.canvasParchment,
      }}
    >
      {showImage ? (
        <Image
          source={{ uri }}
          onError={() => setFailed(true)}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <ThemedText weight="semibold" size={TEXT_SIZE[size]} color="inkMuted48">
          {initial}
        </ThemedText>
      )}
    </View>
  );
}
