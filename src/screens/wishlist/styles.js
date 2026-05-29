import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';
import { scale, verticalScale, fontSize } from '../../utils/responsive/fonts';

export default StyleSheet.create({
  Row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderRadius: scale(10),
    width: '100%',
  },
  toggle: {
    marginBottom: verticalScale(15),
    width: '94%',
    alignSelf: 'center',
    height: verticalScale(50),
    backgroundColor: COLORS.lightBlack,
    padding: scale(4),
    borderRadius: scale(14),
    flexDirection: 'row',
    overflow: 'hidden',
  },
  toggleText: {
    fontFamily: FONTS.Regular,
    fontSize: fontSize(16),
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: verticalScale(10),
    borderRadius: scale(12),
    paddingHorizontal: scale(15),
    gap: scale(15),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: scale(20),
  },
  poster: {
    width: scale(100),
    height: verticalScale(150),
    resizeMode: 'cover',
    borderRadius: scale(8),
  },
  textWrapper: {
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: COLORS.white,
    fontFamily: FONTS.Regular,
    fontSize: fontSize(14),
    textAlign: 'center',
  },
  clickableArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: scale(15),
  },
  cardFlexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(5),
  },
  flexRow: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.gray400,
    fontFamily: FONTS.regular,
    fontSize: fontSize(12),
  },
  dot: {
    color: COLORS.primary,
    fontSize: fontSize(12),
  },
  wishlistFill: {
    width: scale(30),
    resizeMode: 'contain',
  },
});
