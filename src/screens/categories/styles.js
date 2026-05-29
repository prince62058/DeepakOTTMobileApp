import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';
import { scale, verticalScale, fontSize } from '../../utils/responsive/fonts';

export default StyleSheet.create({
  toggle: {
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
    color: COLORS.white,
    fontFamily: FONTS.Bold,
    fontSize: fontSize(16),
    marginRight: scale(8),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderRadius: scale(10),
    width: '100%',
    gap: scale(8),
  },
  flexRow: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: scale(22),
    height: scale(22),
    resizeMode: 'contain',
  },
  bottomContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomText: {
    color: COLORS.white,
    fontSize: fontSize(18),
  },
  center: {
    flex: 1,
    width: '90%',
    alignSelf: 'center',
  },
  heading: {
    fontFamily: FONTS.Bold,
    color: COLORS.white,
    fontSize: fontSize(24),
    marginBottom: -6,
    paddingVertical: verticalScale(8),
  },
  listContainer: {
    marginBottom: verticalScale(10),
  },
  cardWrapper: {
    width: '48%',
    height: verticalScale(110),
    margin: scale(4),
    overflow: 'hidden',
    borderRadius: scale(8),
  },
  bgImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  cardTitle: {
    color: COLORS.white,
    fontFamily: FONTS.Bold,
    fontSize: fontSize(16),
    textAlign: 'center',
  },
});
