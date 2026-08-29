import React from 'react';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { colors } from '../theme';

interface IconProps {
  size?: number;
  color?: string;
}

// ✦ 4-point sparkle star (as in "✦ Hola, Sofía" & "Luma")
export function SparkleIcon({ size = 20, color = colors.sage }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z"
        fill={color}
      />
    </Svg>
  );
}

// 🍃 Leaf Icon (Bienestar / Mat & Flow) - Rich SVG with transparent background
export function QuickAccessLeaf({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="rnLeafGrad" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#8fa484" />
          <Stop offset="0.6" stopColor="#7a8f6f" />
          <Stop offset="1" stopColor="#5f7454" />
        </LinearGradient>
      </Defs>
      {/* Main Leaf Body */}
      <Path
        d="M38 10C38 10 32 8 21 16C10 24 10 35 16 39C22 43 33 39 38 27C41 19 38 10 38 10Z"
        fill="url(#rnLeafGrad)"
        stroke="#3b4834"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center Stem & Veins */}
      <Path d="M12 42C15 37 20 31 26 24C32 16 37 11 38 10" stroke="#3b4834" strokeWidth="1.6" strokeLinecap="round" />
      <Path d="M21 29C25 30 29 32 32 34" stroke="#3b4834" strokeWidth="1.2" strokeLinecap="round" />
      <Path d="M25 25C29 25 33 26 36 27" stroke="#3b4834" strokeWidth="1.2" strokeLinecap="round" />
      <Path d="M17 34C15 36 14 38 14 40" stroke="#3b4834" strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
  );
}

// 🪷 Lotus Icon (Bacu Fit / Relajación) - Rich SVG with transparent background
export function QuickAccessLotus({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="rnLotusCenter" x1="24" y1="10" x2="24" y2="36" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#e29174" />
          <Stop offset="1" stopColor="#c46849" />
        </LinearGradient>
      </Defs>
      {/* Outer side petals */}
      <Path
        d="M10 32C9 25 12 19 18 18C17 24 19 29 24 33C18 33 13 33 10 32Z"
        fill="#7a8f6f"
        stroke="#4d5c45"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <Path
        d="M38 32C39 25 36 19 30 18C31 24 29 29 24 33C30 33 35 33 38 32Z"
        fill="#7a8f6f"
        stroke="#4d5c45"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Mid Petals */}
      <Path
        d="M15 33C13 24 17 15 24 10C21 18 22 27 24 33C20 33 17 33 15 33Z"
        fill="url(#rnLotusCenter)"
        stroke="#8a422a"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <Path
        d="M33 33C35 24 31 15 24 10C27 18 26 27 24 33C28 33 31 33 33 33Z"
        fill="url(#rnLotusCenter)"
        stroke="#8a422a"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Center Main Petal */}
      <Path
        d="M24 8C19 16 19 27 24 35C29 27 29 16 24 8Z"
        fill="#f3a88e"
        stroke="#8a422a"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Calyx Base */}
      <Path
        d="M15 35C20 38 28 38 33 35C30 37 27 38 24 38C21 38 18 37 15 35Z"
        fill="#7a8f6f"
        stroke="#4d5c45"
        strokeWidth="1.4"
      />
    </Svg>
  );
}

// 🏋️ Dumbbell Icon (Pilates Reformer / Fitness) - Rich SVG with transparent background
export function QuickAccessDumbbell({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="rnDbGrad" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#6e7a68" />
          <Stop offset="1" stopColor="#414a3c" />
        </LinearGradient>
      </Defs>
      {/* Handle */}
      <Rect x="16" y="22" width="16" height="4.5" rx="2.2" transform="rotate(-45 24 24)" fill="#8e8276" stroke="#2b2420" strokeWidth="1.3" />
      {/* Bottom-Left Head */}
      <Path
        d="M10 28L20 38L17 41C15 43 12 43 10 41L7 38C5 36 5 33 7 31L10 28Z"
        fill="url(#rnDbGrad)"
        stroke="#2b2420"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Top-Right Head */}
      <Path
        d="M28 10L38 20L41 17C43 15 43 12 41 10L38 7C36 5 33 5 31 7L28 10Z"
        fill="url(#rnDbGrad)"
        stroke="#2b2420"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// 🎁 Package Box Icon (Paquetes) - Rich SVG with transparent background
export function QuickAccessPackage({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="rnPkgGrad" x1="10" y1="18" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#e8b488" />
          <Stop offset="1" stopColor="#c46849" />
        </LinearGradient>
      </Defs>
      {/* Box Body */}
      <Rect
        x="10"
        y="19"
        width="28"
        height="21"
        rx="4"
        fill="url(#rnPkgGrad)"
        stroke="#8b3c22"
        strokeWidth="1.6"
      />
      {/* Box Lid */}
      <Rect
        x="8"
        y="14"
        width="32"
        height="7"
        rx="2.5"
        fill="#fdfbf7"
        stroke="#8b3c22"
        strokeWidth="1.6"
      />
      {/* Vertical Ribbon */}
      <Path d="M24 14V40" stroke="#fdfbf7" strokeWidth="2.5" strokeLinecap="round" />
      {/* Ribbon Bow */}
      <Path
        d="M17 9.5C17 12 24 14 24 14C24 14 31 12 31 9.5C31 6.5 28 6.5 24 9.5C20 6.5 17 6.5 17 9.5Z"
        fill="#c46849"
        stroke="#8b3c22"
        strokeWidth="1.5"
      />
    </Svg>
  );
}

// 🍎 Apple Icon (Nutrición) - Rich SVG with transparent background
export function QuickAccessApple({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="rnAppleGrad" x1="14" y1="14" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#e8b488" />
          <Stop offset="0.6" stopColor="#d29c6b" />
          <Stop offset="1" stopColor="#b37b46" />
        </LinearGradient>
      </Defs>
      {/* Stem */}
      <Path d="M24 15C24 11 27 8 30 6" stroke="#6e5033" strokeWidth="1.8" strokeLinecap="round" />
      {/* Tiny Leaf on Stem */}
      <Path d="M25 11C29 9 33 10 34 12C32 14 28 13 25 11Z" fill="#7a8f6f" stroke="#4d5c45" strokeWidth="1" />
      {/* Apple Body */}
      <Path
        d="M24 17C20 14 12 14 10 21C9 28 13 39 19 40C22 41 23 39 24 39C25 39 26 41 29 40C35 39 39 28 38 21C36 14 28 14 24 17Z"
        fill="url(#rnAppleGrad)"
        stroke="#6e4624"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// 🎚️ Filter Sliders Icon (Search bar right filter)
export function FilterSlidersIcon({ size = 18, color = colors.textPrimary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6H14M18 6H20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M4 12H8M12 12H20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M4 18H16M20 18H20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Circle cx="16" cy="6" r="2" stroke={color} strokeWidth="1.8" />
      <Circle cx="10" cy="12" r="2" stroke={color} strokeWidth="1.8" />
      <Circle cx="18" cy="18" r="2" stroke={color} strokeWidth="1.8" />
    </Svg>
  );
}

// 🔍 Search Icon
export function SearchMagnifierIcon({ size = 18, color = colors.textMuted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.8" />
      <Path d="M16.5 16.5L21 21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

// → Circular Action Arrow Button (Luma card button)
export function ArrowCircleBtn({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="16" r="15" fill={colors.chipBackground} stroke={colors.border} strokeWidth="1" />
      <Path
        d="M13 16H19M19 16L16.5 13.5M19 16L16.5 18.5"
        stroke={colors.textPrimary}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ==========================================
// ILLUSTRATION 1: Yoga & Mindfulness Scene
// (Meditation posture + Sage organic circle + Potted plant + Arch lines)
// ==========================================
export function YogaSceneIllustration({ width = 160, height = 130 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 160 130" fill="none">
      {/* Sage Organic Circle Backdrop */}
      <Circle cx="108" cy="46" r="32" fill={colors.sageSoft} />
      <Circle cx="40" cy="80" r="22" fill="rgba(210, 156, 107, 0.18)" />

      {/* Arches line art in background */}
      <Path
        d="M90 120 V50 C90 35 125 35 125 50 V120"
        stroke="rgba(122, 143, 111, 0.3)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M96 120 V54 C96 42 119 42 119 54 V120"
        stroke="rgba(122, 143, 111, 0.2)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Mat / Ground line */}
      <Rect x="20" y="116" width="120" height="3" rx="1.5" fill={colors.borderStrong} />

      {/* Potted Plant Left */}
      <G transform="translate(18, 55)">
        <Path d="M12 35 L8 58 H24 L20 35 Z" fill={colors.borderStrong} />
        <Path d="M6 35 H26" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" />
        {/* Leaves */}
        <Path
          d="M16 35 C10 24 5 20 2 12 C10 14 14 22 16 35 Z"
          fill={colors.sageDark}
          stroke={colors.textPrimary}
          strokeWidth="1"
        />
        <Path
          d="M16 35 C18 20 20 12 28 8 C26 18 22 26 16 35 Z"
          fill={colors.sage}
          stroke={colors.textPrimary}
          strokeWidth="1"
        />
        <Path
          d="M16 35 C14 26 13 14 16 0 C18 14 17 26 16 35 Z"
          fill={colors.sageDark}
          stroke={colors.textPrimary}
          strokeWidth="1"
        />
      </G>

      {/* Meditating Person Silhouette (Line art) */}
      <G transform="translate(54, 20)">
        {/* Head & Bun */}
        <Circle cx="26" cy="18" r="8" stroke={colors.textPrimary} strokeWidth="1.8" fill={colors.surface} />
        <Circle cx="26" cy="8" r="4.5" stroke={colors.textPrimary} strokeWidth="1.6" fill={colors.textPrimary} />
        {/* Neck */}
        <Path d="M23 26 V30 H29 V26" stroke={colors.textPrimary} strokeWidth="1.8" />
        {/* Top/Chest */}
        <Path
          d="M16 32 C20 31 32 31 36 32 L38 52 H14 L16 32 Z"
          fill={colors.sageDark}
          stroke={colors.textPrimary}
          strokeWidth="1.8"
        />
        {/* Torso */}
        <Path d="M18 52 L17 64 H35 L34 52" stroke={colors.textPrimary} strokeWidth="1.8" />
        {/* Arms in mudra pose */}
        <Path
          d="M16 34 L6 55 L-2 70 C-2 74 4 75 8 72 L18 64"
          stroke={colors.textPrimary}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M36 34 L46 55 L54 70 C54 74 48 75 44 72 L34 64"
          stroke={colors.textPrimary}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Crossed Legs (Lotus) */}
        <Path
          d="M8 72 C4 82 12 90 26 90 C40 90 48 82 44 72 C38 78 30 80 26 80 C22 80 14 78 8 72 Z"
          fill={colors.sageDark}
          stroke={colors.textPrimary}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

// ==========================================
// ILLUSTRATION 2: Massage / Spa Candle Scene
// (Terracotta arch + Candle with flame + Potted plant + Table)
// ==========================================
export function SpaSceneIllustration({ width = 160, height = 130 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 160 130" fill="none">
      {/* Terracotta Arch Backdrop */}
      <Path
        d="M60 120 V44 C60 18 115 18 115 44 V120 Z"
        fill="rgba(196, 104, 73, 0.18)"
      />
      <Circle cx="44" cy="50" r="26" fill="rgba(210, 156, 107, 0.16)" />

      {/* Hanging Lamp from ceiling */}
      <Path d="M88 0 V24" stroke={colors.textPrimary} strokeWidth="1.2" />
      <Path d="M78 28 C78 24 98 24 98 28 L94 32 H82 Z" fill={colors.sageDark} stroke={colors.textPrimary} strokeWidth="1.2" />

      {/* Massage / Reformer Table */}
      <G transform="translate(18, 56)">
        {/* Headrest */}
        <Rect x="0" y="8" width="16" height="14" rx="7" fill={colors.sageDark} stroke={colors.textPrimary} strokeWidth="1.6" />
        {/* Bed Top Cushion */}
        <Rect x="12" y="10" width="96" height="12" rx="4" fill={colors.surface} stroke={colors.textPrimary} strokeWidth="1.8" />
        {/* Wooden Bed Base */}
        <Rect x="14" y="22" width="92" height="6" fill={colors.goldDark} stroke={colors.textPrimary} strokeWidth="1.4" />
        {/* Legs */}
        <Path d="M22 28 V56 M42 28 V56 M80 28 V56 M100 28 V56" stroke={colors.textPrimary} strokeWidth="2" strokeLinecap="round" />
        <Path d="M22 48 H42 M80 48 H100" stroke={colors.textPrimary} strokeWidth="1.5" />
      </G>

      {/* Potted Plant Right */}
      <G transform="translate(122, 60)">
        <Path d="M8 32 L4 52 H18 L14 32 Z" fill={colors.borderStrong} stroke={colors.textPrimary} strokeWidth="1.2" />
        {/* Stems & Flower */}
        <Path d="M11 32 V12" stroke={colors.textPrimary} strokeWidth="1.4" />
        <Path d="M11 20 C6 18 4 12 6 8 C10 12 11 16 11 20 Z" fill={colors.sageDark} />
        <Path d="M11 24 C16 22 18 16 16 12 C12 16 11 20 11 24 Z" fill={colors.sage} />
        {/* Flower bud on top */}
        <Path d="M11 12 C8 8 9 2 11 0 C13 2 14 8 11 12 Z" fill={colors.accent} stroke={colors.textPrimary} strokeWidth="1" />
      </G>
    </Svg>
  );
}

// ==========================================
// ILLUSTRATION 3: Welcome Organic Shapes (Screen 1)
// ==========================================
export function WelcomeScreenArt({ width = 340, height = 360 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 340 360" fill="none">
      {/* Top Left Terracotta Circle */}
      <Circle cx="60" cy="70" r="32" fill={colors.accent} opacity={0.88} />

      {/* Line Art Arches Left */}
      <G transform="translate(10, 90)">
        <Path d="M0 160 V50 C0 22 48 22 48 50 V160" stroke="rgba(210, 156, 107, 0.4)" strokeWidth="1.6" />
        <Path d="M8 160 V54 C8 32 40 32 40 54 V160" stroke="rgba(210, 156, 107, 0.3)" strokeWidth="1.4" />
        <Path d="M16 160 V58 C16 42 32 42 32 58 V160" stroke="rgba(210, 156, 107, 0.2)" strokeWidth="1.2" />
      </G>

      {/* Top Right Sage Organic Blob */}
      <Path
        d="M220 0 C270 0 340 40 340 120 C340 160 300 170 260 160 C210 150 200 80 200 40 C200 10 210 0 220 0 Z"
        fill="rgba(122, 143, 111, 0.22)"
      />

      {/* Delicate Leaves Branch on Left */}
      <G transform="translate(0, 190)">
        <Path d="M-10 100 C15 70 30 50 40 10" stroke={colors.sageDark} strokeWidth="2" strokeLinecap="round" />
        {/* Leaves */}
        <Path d="M30 35 C20 25 15 15 22 8 C32 10 32 25 30 35 Z" fill={colors.sageDark} stroke={colors.sageDark} strokeWidth="1" />
        <Path d="M38 15 C45 5 55 5 58 14 C52 22 42 20 38 15 Z" fill={colors.sage} stroke={colors.sageDark} strokeWidth="1" />
        <Path d="M18 60 C8 50 2 45 10 38 C20 42 19 55 18 60 Z" fill={colors.sage} stroke={colors.sageDark} strokeWidth="1" />
        <Path d="M26 48 C36 40 45 42 46 50 C40 58 30 54 26 48 Z" fill={colors.sageDark} stroke={colors.sageDark} strokeWidth="1" />
      </G>

      {/* Bottom Right Terracotta Organic Arch/Blob */}
      <Path
        d="M210 360 C190 280 270 230 340 230 V360 Z"
        fill="rgba(196, 104, 73, 0.7)"
      />
    </Svg>
  );
}
