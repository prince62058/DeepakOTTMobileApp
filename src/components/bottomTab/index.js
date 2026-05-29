import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  Animated,
  Keyboard,
} from 'react-native';
import { COLORS, FONTS, icons, SIZES } from '../../constants';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const CustomBottomTab = ({ state, navigation }) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);

   const scales  = useRef(state.routes.map((_, i) => new Animated.Value(state.index === i ? 1.1 : 1))).current;
  const opacities = useRef(state.routes.map((_, i) => new Animated.Value(state.index === i ? 1 : 0.9))).current;

  useEffect(() => {
    state.routes.forEach((_, i) => {
      const focused = state.index === i;
      Animated.parallel([
        Animated.spring(scales[i], {
          toValue: focused ? 1.1 : 1,
          friction: 4,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(opacities[i], {
          toValue: focused ? 1 : 0.9,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [state.index]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setVisible(false));
    const hide = Keyboard.addListener('keyboardDidHide', () => setVisible(true));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (!visible) return null;

  const iconsList = [
    { name: t('common.home') || 'Home', active: icons.homeFill, inactive: icons.home },
    { name: t('common.categories') || 'Categories', active: icons.categoriesFill, inactive: icons.categories },
    { name: t('common.wishlist') || 'Wishlist', active: icons.wishlistFill, inactive: icons.wishlist },
    { name: t('common.profile') || 'Profile', active: icons.profileeFill, inactive: icons.profilee },
  ];

    return (
    <Animated.View style={styles.container}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          if (!isFocused) navigation.navigate(route.name);
        };

        const iconSource = isFocused
          ? iconsList[index].active
          : iconsList[index].inactive;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
          >
            <Animated.View
              style={{
                transform: [{ scale: scales[index] }],
                opacity: opacities[index],
                alignItems: 'center',
              }}
            >
              <Image source={iconSource} style={styles.icon} resizeMode="contain" />
              <Text style={[styles.text, { color: isFocused ? COLORS.primary : COLORS.white }]}>
                {iconsList[index].name}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
};

export default CustomBottomTab;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: SIZES.height * 0.08,
    backgroundColor: COLORS.black,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: SIZES.w15,
    height: SIZES.w15,
  },
  text: {
    color: COLORS.white,
    fontFamily: FONTS.regular,
    fontSize: SIZES.w2,
    marginTop: SIZES.height * 0.0035,
    textAlign: 'center',
  },
});
