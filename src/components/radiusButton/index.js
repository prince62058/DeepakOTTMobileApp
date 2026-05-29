import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONTS, SIZES } from '../../constants';

const RadiusButton = ({ title, active, onPress, buttonStyle, buttonText }) => {
  const gradientColors = [COLORS.p1, COLORS.p2];

  return (
    <View>
      {active ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.button, buttonStyle]}
        >
          <TouchableOpacity onPress={onPress} style={styles.touchable}>
            <Text style={[styles.buttonText, buttonText, { color: COLORS.white }]}>
              {title}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      ) : (
        <TouchableOpacity
          onPress={onPress}
          style={[styles.button, buttonStyle, styles.transparentBorder]}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, buttonText, { color: COLORS.gray400 }]}>
            {title}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    borderRadius: 100,
    height: SIZES.height * 0.055,
    overflow: 'hidden',
  },
  transparentBorder: {
    borderWidth: 1,
    borderColor: COLORS.gray400,
    backgroundColor: 'transparent',
  },
  touchable: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: SIZES.w4,
  },
  buttonText: {
    marginTop: SIZES.height * 0.003,
    fontFamily: FONTS.PoppinsMedium,
    fontSize: SIZES.w6,
    textAlign: 'center',
  },
});

export default RadiusButton;
