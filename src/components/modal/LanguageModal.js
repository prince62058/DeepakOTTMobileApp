import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback,
    TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

const LanguageModal = ({
    visible,
    onClose,
    onSelect,
    title = 'Select Language',
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.fullScreenContainer}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalBox}>
                            <Text style={styles.text}>{title}</Text>
                            
                            <TouchableOpacity 
                                style={styles.option} 
                                onPress={() => onSelect('en')}
                            >
                                <Text style={styles.optionText}>English</Text>
                            </TouchableOpacity>

                            <View style={styles.separator} />

                            <TouchableOpacity 
                                style={styles.option} 
                                onPress={() => onSelect('hi')}
                            >
                                <Text style={styles.optionText}>हिंदी (Hindi)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.closeButton} 
                                onPress={onClose}
                            >
                                <Text style={styles.closeText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default LanguageModal;

const styles = StyleSheet.create({
    fullScreenContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalBox: {
        width: SIZES.width * 0.8,
        backgroundColor: COLORS.lightBlack || '#1c1c1c',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
    },
    text: {
        fontFamily: FONTS.semiBold,
        fontSize: 20,
        color: COLORS.white,
        marginBottom: 20,
    },
    option: {
        width: '100%',
        paddingVertical: 15,
        alignItems: 'center',
    },
    optionText: {
        fontFamily: FONTS.medium,
        fontSize: 18,
        color: COLORS.white,
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: COLORS.separator || '#333',
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
    },
    closeText: {
        color: COLORS.primary,
        fontFamily: FONTS.bold,
        fontSize: 16,
    }
});
