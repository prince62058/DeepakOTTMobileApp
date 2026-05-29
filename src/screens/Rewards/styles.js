import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

export default StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.width * 0.035,
    borderWidth: 2,
    borderRadius: 6,
    marginTop: SIZES.height * 0.08,
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.lightBlack,
    paddingVertical: SIZES.height * 0.02,
    paddingHorizontal: SIZES.width * 0.03,
    marginHorizontal: SIZES.width * 0.03,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.width * 0.08,
  },
  referImage: {
    width: SIZES.width * 0.2,
    height: SIZES.height * 0.12,
    resizeMode: 'contain',
  },
  text: {
    color: COLORS.white,
    fontFamily: FONTS.Regular,
    fontSize: SIZES.w6,
    textAlign: 'center',
  },
  dashedBorder: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.white,
    borderRadius: 6,
  },
  innerBox: {
    backgroundColor: '#FFB347',
    borderRadius: 3,
    paddingVertical: SIZES.height * 0.006,
    paddingHorizontal: SIZES.width * 0.078,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.width * 0.02,
  },

  referViewText: {
    color: COLORS.black,
    fontFamily: FONTS.Bold,
    fontSize: SIZES.w8,
  },

  copyIcon: {
    fontSize: SIZES.w6,
    marginLeft: SIZES.width * 0.01,
  },
  view: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.w6,
    borderRadius: SIZES.w0,
    marginTop: SIZES.height * 0.02,
    backgroundColor: COLORS.lightBlack,
    paddingVertical: SIZES.height * 0.014,
    paddingHorizontal: SIZES.width * 0.16,
    marginHorizontal: SIZES.width * 0.03,
  },
  viewText: {
    color: COLORS.white,
    fontFamily: FONTS.Regular,
    fontSize: SIZES.w8,
    lineHeight: SIZES.h0,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent:'center',
    gap: SIZES.w0,
    marginHorizontal: SIZES.width * 0.03,
  },
  coin: {
    width: SIZES.width * 0.04,
    height: SIZES.width * 0.04,
    resizeMode: 'contain',
  },
  heading: {
    color: COLORS.white,
    fontFamily: FONTS.Regular,
    fontSize: SIZES.w6,
    marginTop: SIZES.lgHeight,
    marginHorizontal: SIZES.width * 0.03,
  },
  imageView: {
    borderRadius: SIZES.w0,
    backgroundColor: COLORS.lightBlack,
    paddingVertical: SIZES.height * 0.012,
    paddingHorizontal: SIZES.width * 0.026,
  },
  steps: {
    width: SIZES.width * 0.06,
    height: SIZES.width * 0.06,
    resizeMode: 'contain',
  },
  subText: {
    color: COLORS.gray300,
    fontFamily: FONTS.regular,
    fontSize: SIZES.w6,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  mainStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: SIZES.h1,
    marginHorizontal: SIZES.width * 0.03,
  },
});
