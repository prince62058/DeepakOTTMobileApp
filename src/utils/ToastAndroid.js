import { ToastAndroid } from "react-native";

export const showToast = (message) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
};

export const showToastWithGravity = (message) => {
    ToastAndroid.showWithGravity(
        message,
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
    );
};

export const showToastWithGravityAndOffset = (message) => {
    ToastAndroid.showWithGravityAndOffset(
        message,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25, // xOffset
        50  // yOffset
    );
};
