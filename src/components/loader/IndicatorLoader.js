import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS, SIZES } from '../../constants';

const IndicatorLoader = () => {
    return (
        <View style={styles.container}>
            <ActivityIndicator
                color={COLORS.white}
                size={SIZES.width * 0.1}
                style={styles.loader}
            />
        </View>
    );
};

export default IndicatorLoader;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loader: {
        // any additional loader styling (optional)
    },
});
