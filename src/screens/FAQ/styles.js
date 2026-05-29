import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

export default StyleSheet.create({
  center: {
    marginTop: SIZES.height * 0.08,
  },
  card: {
    width: SIZES.width * 0.94,
    alignSelf: 'center',
    backgroundColor: '#1A1A1A', // Darker background for the list
    paddingHorizontal: SIZES.w4,
    overflow: 'hidden',
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#333333',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.h3,
  },
  question: {
    color: '#E0E0E0',
    fontFamily: FONTS.medium,
    fontSize: SIZES.w5,
    flex: 1,
    marginRight: SIZES.w2,
  },
  arrow: {
    width: SIZES.w8,
    height: SIZES.w8,
    tintColor: COLORS.gray300,
    resizeMode: 'contain',
  },
  answerContainer: {
    paddingBottom: SIZES.h3,
  },
  answer: {
    color: COLORS.gray400,
    fontFamily: FONTS.Regular,
    fontSize: SIZES.w4,
    lineHeight: SIZES.w4 * 1.6,
  },
  boldText: {
    fontFamily: FONTS.Bold,
    color: COLORS.white,
  },
});
