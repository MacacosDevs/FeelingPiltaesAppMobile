import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

interface NavIconProps {
  active?: boolean;
  color?: string;
  size?: number;
}

// 1. INICIO / HOME
export function NavHomeIcon({ active = false, color, size = 22 }: NavIconProps) {
  const strokeColor = color ?? (active ? colors.accent : colors.navInactive);
  const fillColor = active ? colors.accent : 'none';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {active ? (
        <Path
          d="M12 2.5L3 9.5V20.5C3 21.0523 3.44772 21.5 4 21.5H9.5V15.5C9.5 14.9477 9.94772 14.5 10.5 14.5H13.5C14.0523 14.5 14.5 14.9477 14.5 15.5V21.5H20C20.5523 21.5 21 21.0523 21 20.5V9.5L12 2.5Z"
          fill={fillColor}
        />
      ) : (
        <Path
          d="M12 3L3.5 9.8V20.5C3.5 21.0523 3.94772 21.5 4.5 21.5H9.5V15C9.5 14.4477 9.94772 14 10.5 14H13.5C14.0523 14 14.5 14.4477 14.5 15V21.5H19.5C20.0523 21.5 20.5 21.0523 20.5 20.5V9.8L12 3Z"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}

// 2. HORARIO / CALENDAR
export function NavCalendarIcon({ active = false, color, size = 22 }: NavIconProps) {
  const strokeColor = color ?? (active ? colors.accent : colors.navInactive);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="4.5"
        width="18"
        height="16.5"
        rx="4"
        stroke={strokeColor}
        strokeWidth="1.8"
        fill={active ? colors.accentSoft : 'none'}
      />
      <Path d="M3 9.5H21" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
      {/* Binder pins */}
      <Path d="M8 2.5V5.5" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M16 2.5V5.5" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
      {/* Date dots */}
      <Circle cx="8" cy="14" r="1.2" fill={strokeColor} />
      <Circle cx="12" cy="14" r="1.2" fill={strokeColor} />
      <Circle cx="16" cy="14" r="1.2" fill={strokeColor} />
      <Circle cx="8" cy="17.5" r="1.2" fill={strokeColor} />
      <Circle cx="12" cy="17.5" r="1.2" fill={strokeColor} />
      <Circle cx="16" cy="17.5" r="1.2" fill={strokeColor} />
    </Svg>
  );
}

// 3. PAQUETES / PACKAGE BOX
export function NavPackageIcon({ active = false, color, size = 22 }: NavIconProps) {
  const strokeColor = color ?? (active ? colors.accent : colors.navInactive);
  const fillColor = active ? colors.accent : 'none';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Box base */}
      <Rect
        x="3.5"
        y="8.5"
        width="17"
        height="12.5"
        rx="2.5"
        stroke={strokeColor}
        strokeWidth="1.8"
        fill={active ? colors.accentSoft : 'none'}
      />
      {/* Box lid */}
      <Rect
        x="2.5"
        y="5.5"
        width="19"
        height="4"
        rx="1.5"
        stroke={strokeColor}
        strokeWidth="1.8"
        fill={active ? fillColor : 'none'}
      />
      {/* Vertical Ribbon */}
      <Path
        d="M12 5.5V21"
        stroke={active ? colors.accent : strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Ribbon bow loop on top */}
      <Path
        d="M8.5 3.2C8.5 4.5 12 5.5 12 5.5C12 5.5 15.5 4.5 15.5 3.2C15.5 1.8 13.5 1.8 12 3.2C10.5 1.8 8.5 1.8 8.5 3.2Z"
        stroke={active ? colors.accent : strokeColor}
        strokeWidth="1.5"
        fill={active ? colors.accent : 'none'}
      />
    </Svg>
  );
}

// 4. EVENTOS / TICKETS
export function NavTicketIcon({ active = false, color, size = 22 }: NavIconProps) {
  const strokeColor = color ?? (active ? colors.accent : colors.navInactive);
  const fillColor = active ? colors.accentSoft : 'none';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 8.5C4.5 8.5 5.5 7.5 5.5 6V4.5C5.5 3.94772 5.94772 3.5 6.5 3.5H17.5C18.0523 3.5 18.5 3.94772 18.5 4.5V6C18.5 7.5 19.5 8.5 21 8.5V15.5C19.5 15.5 18.5 16.5 18.5 18V19.5C18.5 20.0523 18.0523 20.5 17.5 20.5H6.5C5.94772 20.5 5.5 20.0523 5.5 19.5V18C5.5 16.5 4.5 15.5 3 15.5V8.5Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Center Star / Sparkle */}
      <Path
        d="M12 9.5L12.8 11.2L14.5 12L12.8 12.8L12 14.5L11.2 12.8L9.5 12L11.2 11.2L12 9.5Z"
        fill={strokeColor}
      />
    </Svg>
  );
}

// 5. PERFIL / USER
export function NavUserIcon({ active = false, color, size = 22 }: NavIconProps) {
  const strokeColor = color ?? (active ? colors.accent : colors.navInactive);
  const fillColor = active ? colors.accent : 'none';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {active ? (
        <>
          <Circle cx="12" cy="7.5" r="4.2" fill={fillColor} />
          <Path
            d="M4.5 19.8C4.5 15.8 7.8 13.5 12 13.5C16.2 13.5 19.5 15.8 19.5 19.8C19.5 20.5 18.9 21 18.2 21H5.8C5.1 21 4.5 20.5 4.5 19.8Z"
            fill={fillColor}
          />
        </>
      ) : (
        <>
          <Circle cx="12" cy="7.5" r="4" stroke={strokeColor} strokeWidth="1.8" />
          <Path
            d="M4.5 20.5C4.5 16.5 7.8 14 12 14C16.2 14 19.5 16.5 19.5 20.5"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      )}
    </Svg>
  );
}
