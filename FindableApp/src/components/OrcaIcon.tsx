import React from 'react';
import Svg, { Path, Circle, G, Ellipse } from 'react-native-svg';

interface OrcaIconProps {
  size?: number;
  style?: any;
}

export const OrcaIcon: React.FC<OrcaIconProps> = ({ size = 32, style }) => {
  const scale = size / 64;

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" style={style}>
      <G transform={`scale(1, 1)`}>
        {/* Body - main black shape */}
        <Path
          d="M12,32 Q12,18 28,14 Q36,12 44,16 Q52,20 54,30 Q56,38 50,44 Q44,50 34,50 Q24,50 18,46 Q12,42 12,32 Z"
          fill="#1A2D4D"
        />
        {/* White belly patch */}
        <Path
          d="M22,34 Q22,28 30,26 Q36,24 40,28 Q44,32 42,38 Q40,44 34,46 Q28,46 24,42 Q22,38 22,34 Z"
          fill="#E8F4FD"
        />
        {/* Eye patch (white) */}
        <Ellipse cx="36" cy="22" rx="5" ry="3.5" fill="#E8F4FD" />
        {/* Eye */}
        <Circle cx="37" cy="22" r="1.8" fill="#0B1426" />
        {/* Eye highlight */}
        <Circle cx="37.8" cy="21.3" r="0.6" fill="#FFFFFF" />
        {/* Dorsal fin */}
        <Path
          d="M32,14 Q34,4 38,8 Q36,12 36,16 Z"
          fill="#1A2D4D"
        />
        {/* Tail fluke */}
        <Path
          d="M14,36 Q8,30 6,34 Q8,38 12,36 Z"
          fill="#1A2D4D"
        />
        <Path
          d="M14,38 Q8,42 6,38 Q8,34 12,38 Z"
          fill="#1A2D4D"
        />
        {/* Pectoral fin */}
        <Path
          d="M34,38 Q38,44 32,48 Q30,44 34,38 Z"
          fill="#162440"
        />
        {/* Subtle smile */}
        <Path
          d="M42,30 Q44,32 42,34"
          fill="none"
          stroke="#0B1426"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
};

export const OrcaAvatar: React.FC<{ size?: number }> = ({ size = 40 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {/* Background circle */}
      <Circle cx="20" cy="20" r="20" fill="#0A84FF" opacity={0.2} />
      <Circle cx="20" cy="20" r="18" fill="#0B1426" />
      {/* Simplified orca face */}
      <G transform="translate(6, 6)">
        {/* Head shape */}
        <Path
          d="M14,4 Q22,4 24,12 Q26,18 22,22 Q18,26 14,26 Q8,26 6,20 Q4,14 6,10 Q8,4 14,4 Z"
          fill="#1A2D4D"
        />
        {/* White belly */}
        <Path
          d="M10,16 Q10,12 14,12 Q18,12 20,16 Q20,22 16,24 Q12,24 10,20 Z"
          fill="#E8F4FD"
        />
        {/* Eye patch */}
        <Ellipse cx="18" cy="10" rx="3.5" ry="2.2" fill="#E8F4FD" />
        {/* Eye */}
        <Circle cx="18.5" cy="10" r="1.2" fill="#0B1426" />
        <Circle cx="19" cy="9.5" r="0.4" fill="#FFFFFF" />
        {/* Dorsal fin */}
        <Path d="M14,4 Q15,0 17,2 Q16,4 16,6 Z" fill="#1A2D4D" />
      </G>
    </Svg>
  );
};
