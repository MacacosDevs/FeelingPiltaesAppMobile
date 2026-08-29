import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { InstructorRedesSociales } from '@/data/clases';
import { colors } from '@/theme';

type SocialLinksRowProps = {
  redesSociales?: InstructorRedesSociales;
  size?: number;
};

const RED_CONFIG: {
  key: keyof InstructorRedesSociales;
  Icon: (props: { color: string; size: number }) => React.JSX.Element;
}[] = [
  { key: 'instagramUrl', Icon: InstagramIcon },
  { key: 'facebookUrl', Icon: FacebookIcon },
  { key: 'tiktokUrl', Icon: TikTokIcon },
  { key: 'whatsappUrl', Icon: WhatsappIcon },
];

export function SocialLinksRow({ redesSociales, size = 38 }: SocialLinksRowProps) {
  if (!redesSociales) return null;

  const links = RED_CONFIG.filter(({ key }) => !!redesSociales[key]);
  if (links.length === 0) return null;

  return (
    <View style={styles.row}>
      {links.map(({ key, Icon }) => (
        <Pressable
          key={key}
          style={[styles.button, { width: size, height: size, borderRadius: size / 2 }]}
          hitSlop={6}
          onPress={() => Linking.openURL(redesSociales[key] as string)}>
          <Icon color={colors.textPrimary} size={size * 0.5} />
        </Pressable>
      ))}
    </View>
  );
}

function InstagramIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={2.5} y={2.5} width={19} height={19} rx={6} stroke={color} strokeWidth={1.8} />
      <Circle cx={12} cy={12} r={5} stroke={color} strokeWidth={1.8} />
      <Circle cx={17.4} cy={6.6} r={1.1} fill={color} />
    </Svg>
  );
}

function FacebookIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v3.5H8V21h3.5v-7.5h2.7l.5-3.5h-3.2V7.8c0-1 .3-1.7 1.7-1.7H15V3Z"
        fill={color}
      />
    </Svg>
  );
}

function TikTokIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 3v10.6a2.6 2.6 0 1 1-2-2.53"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M14 3c.3 2.3 2 4 4.3 4.2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function WhatsappIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M8.3 8.6c.2-.5.5-.5.7-.5h.5c.2 0 .4 0 .5.4.2.5.6 1.5.6 1.6.1.1.1.3 0 .4-.1.2-.1.3-.3.4-.1.2-.3.3-.4.5-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.5 1.6.3.1.5.1.6-.1.2-.2.7-.8.9-1 .2-.3.4-.2.6-.1l1.5.7c.2.1.4.2.4.3.1.2.1.9-.2 1.4-.3.6-1.4 1.1-2 1.2-.5.1-1.1.1-1.8-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 1-2.3Z"
        fill={color}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chipBackground,
  },
});
