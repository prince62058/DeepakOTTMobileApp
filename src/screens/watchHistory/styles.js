import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

export default StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: SIZES.width * 0.02,
        paddingHorizontal: SIZES.width * 0.045,
        gap: SIZES.width * 0.035,
        // backgroundColor: 'red'
    },
    heading: {
        fontFamily: FONTS.Regular,
        color: COLORS.white,
        fontSize: SIZES.w8,
        marginTop: SIZES.height * 0.02,
    },
    poster: {
        width: SIZES.width * 0.285,
        height: SIZES.height * 0.188,
        resizeMode: 'cover',
        borderRadius: 4,
        // backgroundColor: COLORS.gray300,
    },
    textWrapper: {
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    title: {
        color: COLORS.white,
        fontFamily: FONTS.Regular,
        fontSize: SIZES.w6,
    },
    subTitle: {
        color: COLORS.gray400,
        fontFamily: FONTS.regular,
        fontSize: SIZES.w4,
    },
    iconStyle: {
        width: SIZES.width * 0.048,
        height: SIZES.width * 0.048,
        marginLeft: SIZES.w0,
        marginBottom: SIZES.width * 0.01,
    },
    buttonText: {
        fontSize: SIZES.w6,
        fontFamily: FONTS.Regular,
        marginRight: SIZES.w1,
    },
    buttonStyle: {
        marginTop: SIZES.h3,
        height: SIZES.height * 0.0455,
        width: SIZES.width * 0.39
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SIZES.width * 0.035,
    },
    text: {
        color: COLORS.gray400,
        fontFamily: FONTS.regular,
        fontSize: SIZES.w4,
    },
    imdb: {
        width: SIZES.width * 0.075,
        height: SIZES.height * 0.02,
        borderRadius: SIZES.width * 0.006,
    },
    dot: {
        color: COLORS.primary,
        fontSize: SIZES.width * 0.032,
    },
    imdbText: {
        color: COLORS.white,
        fontFamily: FONTS.regular,
        fontSize: SIZES.w2,
    },
    View: {
        marginTop: SIZES.height * 0.065,
        width: '100%',
        alignSelf: 'center',
    },

})