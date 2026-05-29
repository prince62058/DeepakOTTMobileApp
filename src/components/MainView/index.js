import {
  StatusBar,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants';

const MainView = ({
  children,
  mainStyle,
  transparent = false,
  bottomSafe = true,
  keyboardBehavior,
  keyboardVerticalOffset,
}) => {
  const insets = useSafeAreaInsets();

  const paddingTop = transparent ? 0 : insets.top ?? 0;
  const paddingBottom = bottomSafe ? insets.bottom ?? 0 : 0;
  const paddingLeft = bottomSafe ? insets.left ?? 0 : 0;
  const paddingRight = bottomSafe ? insets.right ?? 0 : 0;

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        mainStyle,
        { paddingTop, paddingBottom, paddingLeft, paddingRight },
      ]}
      behavior={
        keyboardBehavior ?? (Platform.OS === 'ios' ? 'padding' : undefined)
      }
      keyboardVerticalOffset={keyboardVerticalOffset}
      enabled={true}
    >
      <StatusBar
        translucent={transparent}
        backgroundColor={transparent ? 'transparent' : COLORS.black}
        barStyle="light-content"
      />
      {children}
    </KeyboardAvoidingView>
  );
};

export default MainView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
});
