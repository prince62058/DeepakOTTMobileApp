import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

export default StyleSheet.create({
    main: {
        marginTop: SIZES.height * 0.08,
        width: SIZES.width * 0.9,
        alignSelf: 'center',
        gap: SIZES.h5,
    },
    scrollView: {
        paddingBottom: SIZES.height * 0.05,
    },
    activePlan: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: COLORS.green,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 8,
        paddingVertical: SIZES.height * 0.001,
        paddingHorizontal: SIZES.width * 0.02,
        zIndex: 2,
    },
    activeText: {
        fontFamily: FONTS.Bold,
        color: COLORS.white,
        fontSize: SIZES.w6,
    },
    gradientBorder: {
        borderRadius: 12,
        padding: 2, // just border thickness
        // marginBottom: SIZES.h6,
        marginHorizontal: SIZES.width * 0.02,
    },
    contentBox: {
        backgroundColor: COLORS.lightBlack,
        borderRadius: 8,
        paddingHorizontal: SIZES.w6,
        paddingVertical: SIZES.h5,
        position: 'relative', // needed for absolute children
        marginHorizontal: SIZES.width * 0.025,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    leftColumn: {
        flex: 1,
        alignItems: 'flex-start',
    },
    rightColumn: {
        minWidth: SIZES.width * 0.25,
        alignItems: 'flex-end',
        justifyContent: 'flex-end'

    },
    title: {
        fontFamily: FONTS.Bold,
        color: COLORS.white,
        fontSize: SIZES.w12,
    },
    greenText: {
        fontFamily: FONTS.medium,
        color: COLORS.green,
        fontSize: SIZES.w6,
        marginTop: 4,
    },
    text: {
        fontFamily: FONTS.medium,
        color: COLORS.white,
        fontSize: SIZES.w5,
    },
    buttonStyle: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        height: SIZES.height * 0.045,
        paddingHorizontal: SIZES.w4,
    },
    buttonText: {
        fontFamily: FONTS.Bold,
        fontSize: SIZES.w7,
        textAlign: 'center',
    },
});
