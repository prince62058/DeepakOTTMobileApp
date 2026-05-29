import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

export default StyleSheet.create({
    main: {
        width: SIZES.width * 0.94,
        alignSelf: 'center',
    },
    emptyBank: {
        width: SIZES.width,
        height: SIZES.height * 0.36,
        resizeMode: 'contain',
        // backgroundColor: 'red'
    },
    rightColumn: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginRight: SIZES.w1,
    },
    buttonStyle: {
        marginTop: SIZES.height * 0.02,
        paddingHorizontal: SIZES.width * 0.05,
        borderRadius: 6,
    },
    buttonText: {
        marginTop: SIZES.height * 0.004,
        fontFamily: FONTS.Bold,
        fontSize: SIZES.w6,
        textAlign: 'center',
    },
    iconStyle: {
        width: SIZES.width * 0.038,
        marginRight: SIZES.width * 0.01,
    },
    title: {
        fontFamily: FONTS.Bold,
        color: COLORS.white,
        fontSize: SIZES.w12,
    },
    view: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightBlack,
        borderRadius: 8,
        paddingHorizontal: SIZES.w6,
    },
    body: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginLeft: SIZES.w12,
        paddingVertical: SIZES.h6,
    },
    bank: {
        width: SIZES.width * 0.12,
        height: SIZES.width * 0.12,
        resizeMode: 'contain',
    },
    upi: {
        width: SIZES.width * 0.15,
        height: SIZES.width * 0.15,
        resizeMode: 'contain',
    },
    text: {
        fontSize: SIZES.w8,
        color: COLORS.white,
        fontFamily: FONTS.PoppinsMedium,
    },
    subText: {
        fontSize: SIZES.w2,
        color: COLORS.gray400,
        fontFamily: FONTS.PoppinsMedium,
    },
    deleteBtn: {
        width: SIZES.width * 0.1,
        height: SIZES.width * 0.1,
        borderRadius: 6,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trashIcon: {
        width: '60%',
        height: '60%',
        resizeMode: 'contain',
    },
})