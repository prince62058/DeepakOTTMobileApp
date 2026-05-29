import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

export default StyleSheet.create({
  inputView: {
    width: SIZES.width * 0.9,
    alignSelf: 'center',
    marginTop: SIZES.height * 0.0246,
    gap: 10,
  },
  dropText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.w8,
    color: COLORS.white,
    height: SIZES.height * 0.04,
  },
  mainStyle: {
    width: SIZES.width * 0.9,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 10,
  },
  inputViewContent: {
    paddingBottom: SIZES.height * 0.1,
  },
  dropdownContainer: {
    backgroundColor: COLORS.lightBlack,
    borderRadius: 8,
    height: SIZES.height * 0.066,
    paddingHorizontal: 12,
  },
  dropdownOption: {
    marginTop: SIZES.height * 0.01,
    backgroundColor: COLORS.lightBlack,
    borderRadius: 8,
    borderWidth: 0,
    paddingVertical: SIZES.height * 0.015,
    paddingHorizontal: SIZES.w6,
  },
  selectTextStyle: {
    color: COLORS.white,
    fontSize: SIZES.w8,
    fontFamily: FONTS.regular,
  },
  placeholder: {
    fontFamily: FONTS.regular,
    color: COLORS.gray400,
    fontSize: SIZES.w8,
  },
  activeText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.w8,
    marginVertical: SIZES.height * 0.012,
  },
  iconStyle: {
    tintColor: COLORS.white,
    width: SIZES.w13,
    height: SIZES.w13,
    resizeMode: 'contain',
  },
});
