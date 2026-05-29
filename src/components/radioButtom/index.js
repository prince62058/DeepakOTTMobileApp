import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { COLORS, SIZES } from '../../constants'

const RadioButton = ({ active = false, onPress }) => {
    return (
        <TouchableOpacity style={[styles.touch, active && { borderColor: COLORS.primary }]} onPress={onPress} >
            {active ? <View style={styles.dot} /> : null}
        </TouchableOpacity>
    )
}

export default RadioButton

const styles = StyleSheet.create({
    touch: {
        width: SIZES.width * .056,
        height: SIZES.width * .056,
        borderRadius: 100,
        borderWidth: 1.6,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    dot: {
        width: SIZES.width * .032,
        height: SIZES.width * .032,
        borderRadius: 100,
        backgroundColor: COLORS.primary,

    }
})