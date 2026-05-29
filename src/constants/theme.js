import { Dimensions } from 'react-native';
import { scale, verticalScale, fontSize } from '../utils/responsive/fonts';

const { width, height } = Dimensions.get('window');

export const SIZES = {
  // Full dimensions
  width, // e.g. 360
  height, // e.g. 800

  // Font sizes (8 - 24 px)
  w0: fontSize(8),
  w1: fontSize(9),
  w2: fontSize(10),
  w3: fontSize(11),
  w4: fontSize(12),
  w5: fontSize(13),
  w6: fontSize(14),
  w7: fontSize(15),
  w8: fontSize(16),
  w9: fontSize(17),
  w10: fontSize(18),
  w11: fontSize(19),
  w12: fontSize(20),
  w13: fontSize(21),
  w14: fontSize(22),
  w15: fontSize(23),
  w16: fontSize(24),

  // Larger sizes
  w17: fontSize(26),
  w18: fontSize(32),

  lgHeight: verticalScale(24),
  h0: verticalScale(22),
  h1: verticalScale(20),
  h2: verticalScale(18),
  h3: verticalScale(16),
  h4: verticalScale(14),
  h5: verticalScale(12),
  h6: verticalScale(10),

  // Spacing
  separator: verticalScale(8),
};
export const COLORS = {
  theme: 'light',
  barStyle: 'dark-content',
  primary: '#FF3C00',
  separator: '#E0E4E7',

  white: '#FFFFFF',
  black: '#000000',

  lightBlack: '#1E1E1E',
  error: '#F95555',

  // Linear Gradient
  p1: '#FC0000',
  p2: '#F6960E',

  //Border Linear Gradient
  // bp1: '#A787FF',
  // bp2: '#4F1ED8',

  //gray
  gray800: '#33333300',
  gray700: '#222222',
  // gray600: '#666666',
  // gray500: '#344054',
  gray400: '#979797', //gray2
  gray300: '#CCCCCC',
  gray200: '#C5C6CC',
  gray100: '#CECECE',
  gray50: '#C4C4C4',
  // gray25: '#fcfcfc',
  // gray15: '#F4F6F9',

  red: '#FF383C',
  green: '#34C759',
  darkGreen: '#051409',
};
export const FONTS = {
  //Font family Of RedRose
  Bold: 'RedRose-Bold', //700
  SemiBold: 'RedRose-SemiBold', //600
  Medium: 'RedRose-Medium', //500
  Regular: 'RedRose-Regular', //400
  light: 'RedRose-Light', //300

  //Font family Of Roboto
  black: 'Roboto-Black', //900
  exterBold: 'Roboto-ExtraBold', //800
  bold: 'Roboto-Bold', //700
  semiBold: 'Roboto-SemiBold', //600
  medium: 'Roboto-Medium', //500
  regular: 'Roboto-Regular', //400

  //Font family Of Poppins
  PoppinsBold: 'Poppins-Bold', //700
  PoppinsSemiBold: 'Poppins-SemiBold', //600
  PoppinsMedium: 'Poppins-Medium', //500
  PoppinsRegular: 'Poppins-Regular', //400
};
export const CURRENCY = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
};

export const darkTheme = {
  backgroundColor: COLORS.white,
};

export const lightTheme = {
  backgroundColor: COLORS.black,
};
