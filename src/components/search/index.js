import {
  Image,
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import { COLORS, FONTS, icons, SIZES } from '../../constants';

const CustomSearch = ({ placeholder, customStyle, value, onChangeText}) => {

return (
    <View style={[styles.button, customStyle]}>
      <Image source={icons.search} style={styles.iconStyle} />
      <TextInput
        style={[styles.text, { flex: 1 }]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray400}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

export default CustomSearch;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: SIZES.width * 0.0189,
    paddingHorizontal: SIZES.w8,
    height: SIZES.width * 0.134,
    marginTop: SIZES.height * 0.02,
    borderRadius: SIZES.width * 0.08,
    backgroundColor: COLORS.lightBlack,
  },
  text: {
    fontFamily: FONTS.medium,
    color: COLORS.white,
    fontSize: SIZES.w6,
  },
  iconStyle: {
    width: SIZES.w13,
    height: SIZES.w13,
    resizeMode: 'contain',
  }
});
