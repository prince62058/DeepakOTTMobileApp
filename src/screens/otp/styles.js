import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

export default StyleSheet.create({
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SIZES.height * 0.065,
        marginBottom: SIZES.height * 0.025,
        paddingHorizontal: SIZES.width * 0.115,
    },
    otpInput: {
        width: SIZES.width * 0.16,
        height: SIZES.width * 0.16,
        borderWidth: 0.5,
        borderRadius: 6,
        fontSize: SIZES.w12,
        fontFamily: FONTS.bold,
        color: COLORS.white,
        backgroundColor: COLORS.lightBlack,
    },
    otpInputFilled: {
        backgroundColor: COLORS.lightBlack,
        borderColor: COLORS.primary,
    },
    timerContainer: {
        width: SIZES.width * 0.9,
        alignSelf: 'center',
    },
    container: {
        flexDirection: 'row',
        gap: 5,
    },
    timerText: {
        fontSize: SIZES.w5,
        fontFamily: FONTS.semiBold,
        color: COLORS.white,
        marginTop: SIZES.height * 0.0028,
    },
    resendText: {
        fontSize: SIZES.w6,
        fontFamily: FONTS.Bold,
        color: COLORS.white,
    },
    resetPara: {
        fontSize: SIZES.w5,
        fontFamily: FONTS.regular,
        color: COLORS.separator,
    },
    iconStyle: {
        width: SIZES.width * 0.058,
        height: SIZES.width * 0.058,
        marginTop: SIZES.height * 0.0028,
    },
});