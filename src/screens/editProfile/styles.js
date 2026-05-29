import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

export default StyleSheet.create({
    profileContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SIZES.height * 0.03,
    },
    profilePic: {
        width: SIZES.width * 0.34,
        height: SIZES.width * 0.34,
        backgroundColor: COLORS.gray300,
        borderRadius: SIZES.width * 0.2,
    },
    edit: {
        width: SIZES.width * 0.08,
        height: SIZES.width * 0.08,
        position: 'absolute',
        right: SIZES.width * 0.35,
        bottom: 0,
    },
    inputView: {
        width: SIZES.width * 0.9,
        alignSelf: 'center',
        marginTop: SIZES.height * 0.03,
        gap: 10,
    },
    mainStyle: {
        width: SIZES.width * 0.9,
        alignSelf: 'center',
        position: 'absolute',
        // left: 0,
        // right: 0,
        bottom: 10,
    },
    scrollView: {
        // marginTop: SIZES.height * 0.15,
        paddingBottom: SIZES.height * 0.12
    },
})