import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

export default StyleSheet.create({
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: SIZES.width * 0.275,
        borderRadius: SIZES.w0,
        borderColor: COLORS.gray400,
        borderWidth: 1,
        height: SIZES.height * 0.05,
    },
    toggle: {
        marginTop: SIZES.height * 0.02,
        width: SIZES.width * 0.9,
        alignSelf: 'center',
        height: SIZES.width * 0.14,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        overflow: 'hidden',
    },
    toggleText: {
        fontFamily: FONTS.Regular,
        fontSize: SIZES.w8,
        textAlign: 'center',
        marginBottom: -3
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: SIZES.width * 0.03,
        borderRadius: SIZES.w4,
        paddingHorizontal: SIZES.width * 0.045,
        gap: SIZES.width * 0.045,
    },
    heading: {
        fontFamily: FONTS.Regular,
        color: COLORS.white,
        fontSize: SIZES.w8,
        marginTop: SIZES.height * 0.02,
        marginLeft: SIZES.width * 0.06,
    },
    poster: {
        width: SIZES.width * 0.27,
        height: SIZES.height * 0.135,
        resizeMode: 'contain',
        backgroundColor: COLORS.gray300,
    },
    gift: {
        width: SIZES.width * 0.265,
        height: SIZES.height * 0.135,
        resizeMode: 'contain',
    },
    textWrapper: {
        justifyContent: 'center',
        marginBottom: SIZES.width * 0.01,
        flex: 1, // Optimized for better wrapping
    },
    title: {
        color: COLORS.white,
        fontFamily: FONTS.Regular,
        fontSize: SIZES.w6,
    },
    message: {
        color: COLORS.white,
        fontFamily: FONTS.Regular,
        fontSize: SIZES.w5,
        marginTop: SIZES.w2,
    },
    subTitle: {
        color: COLORS.gray400,
        fontFamily: FONTS.regular,
        fontSize: SIZES.w4,
        marginTop: SIZES.w1, // Minor spacing optimization
    },
    button: {
        borderWidth: 1,
        borderRadius: SIZES.w0,
        borderColor: COLORS.gray400,
        paddingVertical: SIZES.height * 0.008,
        marginTop: SIZES.height * 0.015, // Reduced margin for optimization
    }
});