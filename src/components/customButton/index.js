import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONTS, SIZES } from '../../constants';

const CustomButton = ({
    mainStyle,
    buttonStyle,
    title,
    buttonText,
    onPress,
    loading,
    disabled,
    iconLeft,
    iconRight,
    iconStyle,
    gray = false,
    transparent = false,

}) => {
    // Gradient colors
    const gradientColors = [COLORS.p1, COLORS.p2]; // default
    const transparentColors = [COLORS.black, COLORS.black];
    const grayColors = [COLORS.lightBlack, COLORS.lightBlack];

    let buttonColors = gradientColors;
    if (transparent) buttonColors = transparentColors;
    if (gray) buttonColors = grayColors;

    return (
        <View style={[mainStyle]}>
            <LinearGradient
                colors={buttonColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[
                    styles.button,
                    buttonStyle,
                    transparent && { borderWidth: 1, borderColor: COLORS.gray300 },
                ]}
            >
                <TouchableOpacity
                    disabled={loading || disabled}
                    onPress={onPress}
                    activeOpacity={0.7}
                    style={styles.touchableArea}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} size={SIZES.width * 0.08} />
                    ) : (
                        <View style={styles.row}>
                            {iconLeft && (
                                <Image
                                    source={iconLeft}
                                    resizeMode="contain"
                                    style={[styles.icon, iconStyle]}
                                />
                            )}
                            <Text
                                style={[
                                    styles.buttonText,
                                    buttonText,
                                    { color: COLORS.white },
                                ]}
                            >
                                {title}
                            </Text>
                            {iconRight && (
                                <Image
                                    source={iconRight}
                                    resizeMode="contain"
                                    style={[styles.icon, iconStyle]}
                                />
                            )}
                        </View>
                    )}
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
};

export default CustomButton;

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        borderRadius: 10,
        height: SIZES.height * 0.068,
        overflow: 'hidden',
    },
    touchableArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    buttonText: {
        fontSize: SIZES.w11,
        fontFamily: FONTS.semiBold,
    },
    icon: {
        width: SIZES.width * 0.052,
        height: SIZES.width * 0.052,
    },
});
