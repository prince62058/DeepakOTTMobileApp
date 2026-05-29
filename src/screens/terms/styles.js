import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.width * 0.05,
    paddingBottom: SIZES.height * 0.03,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: 'center',
    marginTop: SIZES.height * 0.2,
  },
});

export default styles;
