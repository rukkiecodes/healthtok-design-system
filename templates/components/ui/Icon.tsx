/**
 * Cross-platform icon — SF Symbols on iOS, Material Community on Android.
 *
 * The whole app names icons with Apple SF Symbol strings (e.g. "chevron.right").
 * Those render natively on iOS through expo-image's `sf:` scheme, but are BLANK
 * on Android — SF Symbols don't exist there. So on Android we map each SF name to
 * the closest MaterialCommunityIcons glyph.
 *
 * This is the ONE place icons are rendered. Never write `<Image source="sf:…">`
 * inline, or the icon silently vanishes on Android.
 *
 * Adding an icon? Add it to ANDROID_GLYPH in the same commit. An unmapped name
 * renders a fallback glyph and logs in __DEV__ — it will not crash, but it will
 * look broken on half your users' devices.
 */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { Platform, type StyleProp, type TextStyle, type ImageStyle } from 'react-native';

import { iconSize } from '../../constants/layout';

const ANDROID_GLYPH: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  // navigation
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'chevron.down': 'chevron-down',
  'chevron.up': 'chevron-up',
  xmark: 'close',
  'arrow.left': 'arrow-left',
  'line.3.horizontal.decrease': 'tune-variant',
  ellipsis: 'dots-horizontal',
  plus: 'plus',

  // chrome
  bell: 'bell-outline',
  'bell.fill': 'bell',
  gearshape: 'cog-outline',
  magnifyingglass: 'magnify',
  'square.and.pencil': 'square-edit-outline',
  trash: 'trash-can-outline',
  'square.and.arrow.up': 'export-variant',
  'checkmark.seal.fill': 'check-decagram',
  checkmark: 'check',
  'checkmark.circle.fill': 'check-circle',   // Toast success
  'exclamationmark.triangle': 'alert-outline',
  'exclamationmark.triangle.fill': 'alert',  // Toast error
  'info.circle': 'information-outline',
  'info.circle.fill': 'information',          // Toast info
  'questionmark.circle': 'help-circle-outline',
  'lock.fill': 'lock',
  eye: 'eye-outline',
  'eye.slash': 'eye-off-outline',

  // health / telemedicine
  'heart.text.square': 'clipboard-pulse-outline',
  'cross.case': 'medical-bag',
  pills: 'pill',
  'stethoscope': 'stethoscope',
  'waveform.path.ecg': 'heart-pulse',
  'bandage': 'bandage',
  'drop.fill': 'water',
  'figure.walk': 'walk',
  'brain.head.profile': 'brain',
  'allergens': 'flower-outline',
  'syringe': 'needle',
  'thermometer': 'thermometer',
  'doc.text': 'file-document-outline',
  'doc.text.magnifyingglass': 'file-search-outline',
  'list.clipboard': 'clipboard-list-outline',

  // scheduling / comms
  calendar: 'calendar-blank-outline',
  'calendar.badge.plus': 'calendar-plus',
  clock: 'clock-outline',
  message: 'message-outline',
  'message.fill': 'message',
  'bubble.left.and.bubble.right': 'forum-outline',
  phone: 'phone-outline',
  'phone.down.fill': 'phone-hangup',
  video: 'video-outline',
  'video.slash': 'video-off-outline',
  mic: 'microphone-outline',
  'mic.slash': 'microphone-off',
  paperclip: 'paperclip',
  'paperplane.fill': 'send',

  // people / account
  person: 'account-outline',
  'person.fill': 'account',
  'person.2': 'account-multiple-outline',
  'person.crop.circle': 'account-circle-outline',
  'rectangle.portrait.and.arrow.right': 'logout',

  // money
  creditcard: 'credit-card-outline',
  wallet: 'wallet-outline',
  banknote: 'cash',
  'chart.bar': 'chart-bar',

  // misc
  house: 'home-outline',
  'house.fill': 'home',
  star: 'star-outline',
  'star.fill': 'star',
  photo: 'image-outline',
  camera: 'camera-outline',
  'mappin.and.ellipse': 'map-marker-outline',
  'tray': 'tray',
};

const FALLBACK: keyof typeof MaterialCommunityIcons.glyphMap = 'help-circle-outline';

export type IconProps = {
  /** An SF Symbol name, e.g. "chevron.left". */
  name: string;
  size?: number;
  color: string;
  style?: StyleProp<TextStyle | ImageStyle>;
};

export function Icon({ name, size = iconSize.md, color, style }: IconProps) {
  if (Platform.OS === 'ios') {
    return (
      <Image
        source={`sf:${name}`}
        tintColor={color}
        style={[{ width: size, height: size }, style as StyleProp<ImageStyle>]}
        contentFit="contain"
      />
    );
  }

  const glyph = ANDROID_GLYPH[name];
  if (__DEV__ && !glyph) {
    console.warn(`[Icon] No Android glyph mapped for SF Symbol "${name}". Add it to ANDROID_GLYPH.`);
  }

  return (
    <MaterialCommunityIcons
      name={glyph ?? FALLBACK}
      size={size}
      color={color}
      style={style as StyleProp<TextStyle>}
    />
  );
}
