import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

export default StyleSheet.create({
    mainStyle: {
        width: SIZES.width * 0.9,
        alignSelf: 'center',
        marginBottom: SIZES.h4,
    },
    listContainer: {
        // alignItems: 'center',
        marginVertical: SIZES.h4,
    },
    box: {
        borderWidth: 1,
        borderRadius: 8,
        height: SIZES.height * 0.07,
        width: SIZES.width * 0.435,
        margin: SIZES.w1,
        minWidth: SIZES.width * 0.22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.lightBlack,
    },
    selectedBox: {
        borderColor: COLORS.separator,
    },
    text: {
        width: SIZES.width * 0.9,
        alignSelf: 'center',
        fontFamily: FONTS.regular,
        fontSize: SIZES.w8,
        color: COLORS.white,
        marginTop: SIZES.h6,
    },
    title: {
        fontFamily: FONTS.regular,
        fontSize: SIZES.w8,
        color: COLORS.white,
    },
    selectedText: {
        fontFamily: FONTS.semiBold,
    },
});
