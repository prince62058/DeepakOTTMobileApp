import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native';
import { useState, useRef } from 'react';
import { COLORS, FONTS, SIZES, icons } from '../../constants';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

const CustomInput = ({
  label,
  required,
  password,
  secure,
  drop,
  placeholder,
  value,
  onChangeText,
  error,
  height,
  width,
  maxLength,
  multiline,
  onFocus,
  customContainer,
  leftIcon,
  dropdown,
  date,
  time,
  mobile,
  otp,
  email,
  onPress,
  multiple,
  noteditable,
  disabled,
  inputWrapperStyle,
  placeholderTextColor = COLORS.gray400,
  keyboardType,
  bottomSheet,
}) => {
  const [isSecure, setIsSecure] = useState(secure);
  const [isDrop, setIsDrop] = useState(drop);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const showPicker = dropdown || date || time || noteditable;
  const editable = disabled
    ? false
    : !(dropdown || date || time || noteditable || drop);

  const getKeyboardType = () => {
    if (keyboardType) return keyboardType;
    if (mobile || otp) return 'numeric';
    if (email) return 'email-address';
    return 'default';
  };

  const getAutoCapitalize = () => {
    return email ? 'none' : 'sentences';
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const toggleSecure = () => {
    setIsSecure(prev => !prev);
  };
  const toggleDrop = () => {
    setIsDrop(prev => !prev);
  };

  const handleTextChange = text => {
    if (mobile || otp) {
      text = text.replace(/[^0-9]/g, '');
    } else if (email) {
      text = text.slice(0, 35);
      // text = text.trim();
    }

    if (onChangeText) onChangeText(text);
  };

  // Border color logic
  const getBorderStyle = () => {
    if (error) return { borderColor: COLORS.error };
    if (isFocused) return { borderColor: COLORS.purple400 };
    return { borderColor: COLORS.gray400 };
  };

  const InputComponent = bottomSheet ? BottomSheetTextInput : TextInput;

  return (
    <View style={[styles.container, customContainer]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      <Pressable onPress={showPicker ? onPress : undefined}>
        <View
          style={[
            styles.inputWrapper,
            inputWrapperStyle,
            getBorderStyle(),
            disabled && styles.disabledBorder,
          ]}
        >
          {leftIcon && (
            <Image
              source={leftIcon}
              style={styles.leftIcon}
              resizeMode="contain"
            />
          )}

          <InputComponent
            ref={inputRef}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            value={value}
            secureTextEntry={password ? isSecure : false}
            onChangeText={handleTextChange}
            maxLength={maxLength}
            multiline={multiline}
            keyboardType={getKeyboardType()}
            autoCapitalize={getAutoCapitalize()}
            editable={editable}
            autoCorrect={false}
            autoComplete="off"
            style={[
              styles.input,
              multiline && styles.multiline,
              {
                width: leftIcon ? '85%' : '100%',
                opacity: disabled ? 0.6 : 1,
              },
            ]}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {(password || showPicker || drop) && (
            <Pressable
              style={styles.rightIcon}
              onPress={() => {
                if (password) {
                  toggleSecure();
                } else if (showPicker && onPress) {
                  onPress();
                } else if (drop) {
                  toggleDrop();
                  if (onPress) onPress(); // also inform parent
                }
              }}
            >
              <Image
                source={
                  password
                    ? isSecure
                      ? icons.eyeClose
                      : icons.eyeOpen
                    : dropdown || drop
                    ? isDrop
                      ? icons.downArrow
                      : icons.upArrow
                    : date
                    ? icons.calendar
                    : time
                    ? icons.clock
                    : multiple
                    ? icons.chevronDown
                    : null
                }
                style={styles.icon}
              />
            </Pressable>
          )}
        </View>
      </Pressable>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SIZES.height * 0.018,
    width: '100%',
  },
  label: {
    fontFamily: FONTS.regular,
    color: COLORS.white,
    fontSize: SIZES.w8,
    marginBottom: SIZES.height * 0.008,
  },
  required: {
    color: COLORS.white,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlack,
    borderRadius: 8,
    paddingHorizontal: SIZES.w6,
    // height: SIZES.width * 0.13,
  },
  leftIcon: {
    width: SIZES.w12,
    height: SIZES.w12,
    marginRight: SIZES.w5,
  },
  input: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.w8,
    color: COLORS.white,
    height: SIZES.height * 0.065,
    // paddingVertical: 0,
  },
  multiline: {
    height: SIZES.height * 0.12,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  rightIcon: {
    position: 'absolute',
    right: SIZES.w4,
  },
  icon: {
    width: SIZES.w12,
    height: SIZES.w12,
    resizeMode: 'contain',
  },
  error: {
    color: COLORS.red,
    fontFamily: FONTS.regular,
    fontSize: SIZES.w4,
    marginTop: SIZES.height * 0.02,
  },
});

export default CustomInput;
