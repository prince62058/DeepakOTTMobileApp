import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Image,
    Modal,
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback,
} from 'react-native';
import { COLORS, FONTS, images, SIZES } from '../../constants';
import CustomButton from '../customButton';

const LogoutModal = ({
    visible,
    onClose,
    onConfirm,
    navigation,
    title,
    desc,
    confirmText,
}) => {
    const { t } = useTranslation();
    const handleOk = () => {
        onClose();
        onConfirm();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            {/* Dismiss when tapping outside */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.fullScreenContainer}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalBox}>
                            <View style={styles.acceptView}>
                                <Image source={images.logout} style={styles.centerImg} />
                                <View>
                                    <Text style={styles.text}>{title || t('common.logout') || 'Logout'}</Text>
                                    <Text style={styles.desc}>{desc || t('common.logout_desc') || 'Are you sure you want to logout?'}</Text>
                                </View>
                            </View>

                            <View style={styles.buttonview}>
                                <CustomButton
                                    buttonStyle={styles.primaryButton}
                                    title={confirmText || t('common.logout') || 'Logout'}
                                    onPress={handleOk}
                                />
                                <CustomButton
                                    buttonStyle={styles.cancelButton}
                                    title={t('common.cancel') || 'Cancel'}
                                    transparent
                                    buttonText={styles.cancelText}
                                    onPress={onClose}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default LogoutModal;

const styles = StyleSheet.create({
    fullScreenContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    modalBox: {
        width: SIZES.width * 0.88,
        minHeight: SIZES.height * 0.42,
        backgroundColor: COLORS.black,
        borderRadius: SIZES.width * 0.04,
        paddingVertical: SIZES.height * 0.04,
        paddingHorizontal: SIZES.width * 0.06,
        shadowColor: COLORS.white,
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    acceptView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerImg: {
        resizeMode: 'contain',
        width: SIZES.width * 0.35,
        height: SIZES.height * 0.16,
        marginBottom: SIZES.height * 0.01,
    },
    text: {
        fontFamily: FONTS.Bold,
        fontSize: SIZES.w18,
        color: COLORS.white,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    desc: {
        fontFamily: FONTS.medium,
        fontSize: SIZES.w4,
        color: COLORS.gray300,
        textAlign: 'center',
    },
    buttonview: {
        marginTop: SIZES.height * 0.145,
    },
    primaryButton: {
        marginBottom: SIZES.height * 0.015,
    },

});

