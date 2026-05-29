import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, Text, View } from 'react-native'

import AddPaymentSheet from '../../components/addPayment'
import CustomButton from '../../components/customButton'
import MainView from '../../components/mainView'
import { COLORS, FONTS, icons, images, SIZES } from '../../constants'
import styles from './styles'
import CustomHeader from '../../components/header/CustomHeader'
import { useDispatch, useSelector } from 'react-redux'
import { deleteBankApi, getAllBankApi } from '../../redux/actions/bankAction'
import { useTranslation } from 'react-i18next'

const AddPayment = ({ route }) => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const { banks } = useSelector(state => state.banks)

    // console.log('Bank List', banks)
    const sheetRef = useRef(null)
    const [loading, setLoading] = useState({ loading: false, refresh: false, pagination: false, delete: false })
    const handleLoading = (key, value) => {
        setLoading((prev) => ({ ...prev, [key]: value }))
    }
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        dispatch(getAllBankApi({ cb: (value) => handleLoading('loading', value) }))
    }, [])


    const onRefresh = useCallback(() => {
        dispatch(getAllBankApi({ cb: (value) => handleLoading('refresh', value) }))
    }, [])

    const handleDelete = (item) => {
        setDeleteId(item?._id)
        dispatch(deleteBankApi({
            cb: (value) => handleLoading('delete', value),
            bankAccountId: item?._id
        }))
    }


    const RenderBankCard = ({ item }) => {
        return item?.type === "BANK" ? (
            <View style={styles.view}>
                <Image source={icons.bank} style={styles.bank} />
                <View style={styles.body}>
                    <Text style={styles.text} numberOfLines={1}>{item?.fullName}</Text>
                    <Text style={styles.subText} numberOfLines={1}>{t('common.bank_name') || 'Bank Name'}: {item?.bankName}</Text>
                    <Text style={styles.subText} numberOfLines={1}>{t('common.account_number') || 'Account Number'}: {item?.accountNumber}</Text>
                    <Text style={styles.subText} numberOfLines={1}>{t('common.ifsc_code') || 'IFSC Code'}: {item?.ifscCode}</Text>
                </View>

                <Pressable
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item)}
                    disabled={loading.delete}
                >
                    {(loading.delete && item?._id === deleteId)
                        ? <ActivityIndicator size={'small'} color={COLORS.red} />
                        : <Image source={icons.trash} style={styles.trashIcon} />
                    }
                </Pressable>
            </View>
        ) : (
            <View style={styles.view}>
                <Image source={icons.upi} style={styles.upi} />
                <View style={styles.body}>
                    <Text style={styles.text} numberOfLines={1}>{item?.upiId}</Text>
                </View>

                <Pressable
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item)}
                    disabled={loading.delete}
                >
                    {(loading.delete && item?._id === deleteId)
                        ? <ActivityIndicator size={'small'} color={COLORS.red} />
                        : <Image source={icons.trash} style={styles.trashIcon} />
                    }
                </Pressable>
            </View>
        );
    }

    return (
        <MainView transparent bottomSafe={false}>
            <CustomHeader title={t('common.add_payment') || 'Bank Details'} />
            {(loading.loading && !banks) ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator color={COLORS.white} size={'small'} />
                </View>
            ) :
                (
                    <>
                        <View style={styles.rightColumn}>
                            <CustomButton
                                iconLeft={icons.plus}
                                iconStyle={styles.iconStyle}
                                title={t('common.add_payment') || "Add Payment Method"}
                                buttonStyle={styles.buttonStyle}
                                buttonText={styles.buttonText}
                                onPress={() => sheetRef.current?.present()}
                            />
                        </View>
                        <FlatList
                            data={banks || []}
                            keyExtractor={(item, index) => item?._id}
                            renderItem={({ item }) => <RenderBankCard item={item} />}
                            ItemSeparatorComponent={<View style={{ height: SIZES.height * 0.01 }} />}
                            contentContainerStyle={banks?.length > 0 ? { paddingHorizontal: SIZES.width * 0.04, paddingVertical: SIZES.height * 0.02 } : { flex: 1, alignItems: 'center', justifyContent: 'center' }}
                            ListEmptyComponent={<Image source={images.emptyBank} style={styles.emptyBank} />}
                            refreshControl={<RefreshControl refreshing={loading.refresh} onRefresh={onRefresh} />}
                        />
                    </>
                )}


            <AddPaymentSheet
                ref={sheetRef}
            />
        </MainView>
    )
}

export default AddPayment
