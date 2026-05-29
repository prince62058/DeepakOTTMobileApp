import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

export default StyleSheet.create({
  secondHalf: {
    flex: 1,
    width: SIZES.width * 0.9,
    alignSelf: 'center',
    marginTop: SIZES.height * 0.0106,
  },
  Container: {
    width: SIZES.width * 1.02,
    height: SIZES.height * 0.54,
  },
  label: {
    fontFamily: FONTS.regular,
    color: COLORS.white,
    fontSize: SIZES.w8,
    marginBottom: SIZES.height * 0.008,
    marginTop: SIZES.height * 0.075,
  },
  customHeading: {
    marginBottom: -SIZES.height * 0.02,
    fontSize: SIZES.w16,
  },
  subText: {
    textAlign: 'center',
    fontFamily: FONTS.medium,
    fontSize: SIZES.w4,
    color: COLORS.separator,
    marginHorizontal: SIZES.w4,
  },
  centerText: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginVertical: SIZES.height * 0.0226,
  },
  separator: {
    flex: 1,
    height: SIZES.height * 0.001,
    backgroundColor: COLORS.separator,
  },
  buttonRow: {
    flexDirection: 'row',
    width: SIZES.width * 0.9,
    alignItems: 'center',
    gap: SIZES.width * 0.0425,
    marginBottom: SIZES.lgHeight,
  },
  buttonText: {
    fontSize: SIZES.w6,
  },
  buttonStyle: {
    width: SIZES.width * 0.425,
  },
});
