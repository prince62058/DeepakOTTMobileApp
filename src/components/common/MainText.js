import { StyleSheet, Text } from 'react-native'
import { COLORS, FONTS } from '../../constants'
import { fontSize } from '../../utils/responsive/fonts'

const MainText = ({ children, style, fallback = '' }) => {
    let displayText = fallback

    if (typeof children === 'string' || typeof children === 'number') {
        displayText = String(children)
    }

    return <Text style={[styles.defaultText, style]}>{displayText}</Text>
}

const styles = StyleSheet.create({
    defaultText: {
        color: COLORS.white,
        fontFamily: FONTS.regular,
        fontSize: fontSize(20),
    },
})

export default MainText
