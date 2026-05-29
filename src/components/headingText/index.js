import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { COLORS, FONTS, SIZES } from '../../constants';

const HeadingText = ({ custom, heading, para, paraStyle, customHeading}) => {
  return (
    <View style={[styles.container, custom]}>
      <Text style={[styles.heading, customHeading]}>{heading}</Text>
     <Text style={[styles.para, paraStyle]}>{para} </Text>
    </View>
  );
};

export default HeadingText;

const styles = StyleSheet.create({
  container: {
    width: SIZES.width * 0.90,
    alignSelf: 'center',
    gap: 5,
    // marginTop: SIZES.height * 0.02,
  },
  heading: {
    fontFamily: FONTS.Bold,
    fontSize: SIZES.width * 0.078,
    color: COLORS.white,
  },
  para: {
    fontFamily: FONTS.regular,
    color: COLORS.white,
    fontSize: SIZES.width * 0.0369,
  },
});
