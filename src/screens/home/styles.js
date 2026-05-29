import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

export default StyleSheet.create({
    heading: {
        color: COLORS.white,
        fontFamily: FONTS.bold,
        fontSize: SIZES.w9,
        marginTop: SIZES.height * 0.012,
        marginLeft: SIZES.w8,
    },
    View: {
        width: '100%',
        alignSelf: 'center',
    },
    seperator: {
        width: SIZES.width * 0.024,
    },
    heading01: {
        color: COLORS.white,
        fontFamily: FONTS.Regular,
        fontSize: SIZES.w12,
    },
    row: {
        marginTop: SIZES.height * 0.02,
        paddingHorizontal: SIZES.w8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    arrow: {
        width: SIZES.w4,
        height: SIZES.w4,
        resizeMode: 'contain',
    },
    poster: {
        width: SIZES.width * 0.285,
        height: SIZES.height * 0.188,
        resizeMode: 'contain',
    },
})