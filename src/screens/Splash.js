// SplashScreen.js
import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants';

const { width, height } = Dimensions.get('window');

// Compute the scale so the circle covers the entire screen
function computeMaxScale(baseDiameter) {
  const rNeeded = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
  const baseRadius = baseDiameter / 2;
  const s = rNeeded / baseRadius;
  return s * 1.1; // overscale to avoid edge artifacts
}

const Splash = ({ onAnimationComplete }) => {
  const { t } = useTranslation();
  // Config
  const CIRCLE_DIAMETER = Math.min(width, height) * 0.35; // initial circle
  const EXPAND_DURATION = 2000; // ms
  const HOLD_DURATION = 100; // ms
  // Total = ~2.1s

  // Animated values
  const scale = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.8)).current;

  const targetScale = useMemo(
    () => computeMaxScale(CIRCLE_DIAMETER),
    [CIRCLE_DIAMETER],
  );

  useEffect(() => {
    // Expand red circle -> then reveal text smoothly
    Animated.sequence([
      Animated.timing(scale, {
        toValue: targetScale,
        duration: EXPAND_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(textScale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Wait a moment after reveal before finishing
      setTimeout(() => {
        if (onAnimationComplete) onAnimationComplete();
      }, 2000); // Increased from 800ms to 2000ms
    });
  }, [
    targetScale,
    EXPAND_DURATION,
    overlayOpacity,
    scale,
    textOpacity,
    textScale,
    onAnimationComplete,
  ]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: textOpacity, transform: [{ scale: textScale }] },
        ]}
      >
        <Text style={styles.name}>{t('common.app_logo_full') || 'Deepak'}</Text>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[styles.overlay, { opacity: overlayOpacity }]}
      >
        <View style={styles.maskContainer}>
          <Animated.View
            style={[
              styles.circle,
              {
                width: CIRCLE_DIAMETER,
                height: CIRCLE_DIAMETER,
                borderRadius: CIRCLE_DIAMETER / 2,
                transform: [{ scale }],
              },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0f14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0d0f14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskContainer: {
    position: 'absolute',
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    backgroundColor: COLORS.primary,
  },
});
