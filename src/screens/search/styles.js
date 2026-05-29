import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

export default StyleSheet.create({
  center: {
    flex: 1,
    width: SIZES.width * 0.9,
    alignSelf: 'center',
  },
  customStyle: {
    marginTop: SIZES.height * 0.01,
  },
  heading: {
    fontFamily: FONTS.Bold,
    color: COLORS.white,
    fontSize: SIZES.w16,
    marginTop: SIZES.height * 0.02,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.h5,
    paddingVertical: SIZES.height * 0.01,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightBlack,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.w2,
  },
  title: {
    fontFamily: FONTS.regular,
    color: COLORS.white,
    fontSize: SIZES.w8,
  },
  iconStyle: {
    width: SIZES.w13,
    height: SIZES.w13,
    resizeMode: 'contain',
  },
  posterStyle: {
    width: SIZES.width * 0.24,
    height: SIZES.width * 0.2,
    resizeMode: 'contain',
    borderRadius: SIZES.w2,
  },
  View: {
    marginTop: SIZES.height * 0.064,
    width: '100%',
    alignSelf: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.w2,
  },
  actionIcon: {
    padding: SIZES.w2,
  },
  swipeDeleteButton: {
    backgroundColor: COLORS.p2,
    justifyContent: 'center',
    alignItems: 'center',
    width: SIZES.width * 0.2,
    height: '100%',
    borderRadius: SIZES.w2,
    marginLeft: SIZES.w2,
  },
  swipeActionText: {
    color: COLORS.white,
    fontFamily: FONTS.Bold,
    fontSize: SIZES.w8,
    marginTop: 4,
  },
  list: {
    height: SIZES.height * 0.76,
  },
});
