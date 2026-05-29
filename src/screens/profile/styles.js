import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';
import { scale, verticalScale, fontSize } from '../../utils/responsive/fonts';

export default StyleSheet.create({
  center: {
    width: '94%',
    alignSelf: 'center',
  },
  profileView: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: scale(12),
    paddingHorizontal: scale(15),
    height: verticalScale(75),
    borderRadius: scale(15),
    backgroundColor: COLORS.lightBlack,
  },
  profileImg: {
    width: scale(50),
    height: scale(50),
    backgroundColor: COLORS.gray300,
    borderRadius: scale(25),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  crown: {
    width: scale(20),
    height: scale(20),
    resizeMode: 'contain',
  },
  name: {
    color: COLORS.white,
    fontFamily: FONTS.Bold,
    fontSize: fontSize(18),
    letterSpacing: 0.2,
  },
  premium: {
    color: COLORS.gray400,
    fontFamily: FONTS.Medium,
    fontSize: fontSize(13),
  },
  toggle: {
    marginLeft: scale(10),
    width: scale(100),
    height: verticalScale(35),
    backgroundColor: COLORS.black,
    borderRadius: scale(20),
    borderWidth: 1.5,
    borderColor: COLORS.separator,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  toggleText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: fontSize(14),
  },
  toggle01: {
    width: scale(38),
    height: scale(36),
    backgroundColor: COLORS.black,
    borderRadius: scale(20),
    borderWidth: 1.5,
    borderColor: COLORS.separator,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    color: COLORS.white,
    fontFamily: FONTS.Bold,
    fontSize: fontSize(20),
    marginTop: verticalScale(20),
    marginBottom: verticalScale(8),
  },
  screen: {
    borderRadius: scale(16),
    backgroundColor: COLORS.lightBlack,
    paddingHorizontal: scale(15),
    marginBottom: verticalScale(10),
  },
  box: {
    height: verticalScale(55),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.lightBlack,
  },
  seprate: {
    height: 1,
    backgroundColor: '#333333',
  },
  icon: {
    width: scale(22),
    height: scale(22),
    resizeMode: 'contain',
  },
  title: {
    color: COLORS.white,
    fontFamily: FONTS.Medium,
    fontSize: fontSize(16),
  },
  arrow: {
    width: scale(16),
    height: scale(16),
    resizeMode: 'contain',
  },
  scrollView: {
    paddingBottom: verticalScale(100),
  },
});
