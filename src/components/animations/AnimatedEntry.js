import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

/**
 * Reusable component for smooth entry animations
 * Helps achieve a Netflix-like staggered feel
 */
const AnimatedEntry = ({
  children,
  index = 0,
  delay = 50, // Reduced from 100
  duration = 400, // Reduced from 500
  style,
}) => {
  // Use FadeInDown with spring for a premium, staggered entry
  const entering = FadeInDown.delay(Math.min(index * delay, 400))
    .springify()
    .damping(12);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
};

export default AnimatedEntry;
