import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const WaveBackground: React.FC = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg
        width={SCREEN_WIDTH}
        height={200}
        viewBox={`0 0 ${SCREEN_WIDTH} 200`}
        style={styles.wave}
      >
        <Defs>
          <LinearGradient id="waveGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.08" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="waveGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.teal} stopOpacity="0.05" />
            <Stop offset="100%" stopColor={colors.teal} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path
          d={`M0,80 C${SCREEN_WIDTH * 0.25},40 ${SCREEN_WIDTH * 0.5},120 ${SCREEN_WIDTH},60 L${SCREEN_WIDTH},200 L0,200 Z`}
          fill="url(#waveGrad1)"
        />
        <Path
          d={`M0,120 C${SCREEN_WIDTH * 0.3},80 ${SCREEN_WIDTH * 0.6},140 ${SCREEN_WIDTH},100 L${SCREEN_WIDTH},200 L0,200 Z`}
          fill="url(#waveGrad2)"
        />
      </Svg>
    </View>
  );
};

export const SubtleWaves: React.FC<{ top?: number }> = ({ top = 0 }) => {
  return (
    <View style={[styles.subtleContainer, { top }]} pointerEvents="none">
      <Svg
        width={SCREEN_WIDTH}
        height={100}
        viewBox={`0 0 ${SCREEN_WIDTH} 100`}
      >
        <Defs>
          <LinearGradient id="subtleWave" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.04" />
            <Stop offset="50%" stopColor={colors.teal} stopOpacity="0.06" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.04" />
          </LinearGradient>
        </Defs>
        <Path
          d={`M0,50 Q${SCREEN_WIDTH * 0.25},20 ${SCREEN_WIDTH * 0.5},50 T${SCREEN_WIDTH},50 L${SCREEN_WIDTH},100 L0,100 Z`}
          fill="url(#subtleWave)"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
  },
  subtleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
