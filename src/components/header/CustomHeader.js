import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomHeader = ({ title, showBack = true, rightComponent }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, height: SIZES.height * 0.06 }}>
        {showBack && (
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Icon name="chevron-left" size={30} color={COLORS.white} />
          </Pressable>
        )}
        <Text style={styles.text} numberOfLines={1}>{title}</Text>
      </View>
      {rightComponent && (
        <View style={styles.rightContainer}>
          {rightComponent}
        </View>
      )}
    </View>
  );
};

export default CustomHeader

const styles = StyleSheet.create({
    container: {
        // backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.width * 0.05,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        paddingRight: SIZES.width * 0.04,
        paddingVertical: 10,
    },
    backIcon: {
        width: SIZES.width * 0.05,
        height: SIZES.width * 0.05,
        resizeMode: 'contain',
        tintColor: COLORS.white,
    },
    text: {
        color: COLORS.white,
        fontFamily: FONTS.Regular,
        fontSize: SIZES.w10,
        marginBottom: -3,
    },
    rightContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    }
})