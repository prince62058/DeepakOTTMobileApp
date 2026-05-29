import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import MainView from '../../components/mainView';
import HeadingText from '../../components/headingText';
import CustomButton from '../../components/customButton';
import styles from './styles';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getGenreApi, registerApi } from '../../redux/actions/authAction';
import { showToast } from '../../utils/ToastAndroid';

const Preferences = ({ navigation, route }) => {
    const { t } = useTranslation();

    const paramsData = route.params
    const { user, genre } = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [loading, setLoading] = useState(false)
    const [skiping, setSkiping] = useState(false)

    const toggleGenre = (genre) => {
        if (selectedGenres.includes(genre)) {
            setSelectedGenres(selectedGenres.filter((g) => g !== genre));
        } else {
            if (selectedGenres.length < 5) {
                setSelectedGenres([...selectedGenres, genre]);
            }
        }
    };

    const handleSubmit = (skip) => {
        const { language, ...restData } = paramsData
        let payload = {
            ...restData,
            language: [language?._id]
        }
        if (skip) {
            dispatch(registerApi({ payload, cb: setSkiping }))
        } else {
            if (selectedGenres.length === 0) {
            showToast(t('common.select_atleast_one') || 'Please select at least one genre or skip')
                return
            }
            payload.genrePreferences = selectedGenres?.map((item) => item?._id)
            // console.log(payload)
            dispatch(registerApi({ payload, cb: setLoading }))
        }

    }


    useEffect(() => {
        dispatch(getGenreApi({}))
    }, [])

    return (
        <MainView transparent>
            <HeadingText
                heading={t('common.genre_preferences') || 'Genre Preferences'}
                para={t('common.choose_5_genres') || 'Choose up to 5 genres to personalize your experience.'}
            />

            <Text style={styles.text}>{t('common.selected') || 'Selected'}: {selectedGenres.length}/5</Text>

            <FlatList
                data={genre || []}
                numColumns={2}
                keyExtractor={(item) => item?._id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.box,
                            selectedGenres?.some(i => i._id === item?._id) && styles.selectedBox,
                        ]}
                        onPress={() => toggleGenre(item)}
                        disabled={
                            selectedGenres.length >= 5 &&
                            !selectedGenres.includes(item.title)
                        }
                    >
                        <Text
                            style={[
                                styles.title,
                                selectedGenres.includes(item.title) && styles.selectedText,
                            ]}
                        >
                            {item?.icon} {item.name}
                        </Text>
                    </TouchableOpacity>
                )}

                ListFooterComponent={() => (
                    <View>

                        <CustomButton
                            title={t('common.continue') || "Continue"}
                            mainStyle={styles.mainStyle}
                            onPress={() => handleSubmit(false)}
                            loading={loading}
                            disabled={loading || skiping}
                        />

                        <CustomButton
                            transparent
                            mainStyle={styles.mainStyle}
                            title={t('common.skip_now') || "Skip for now"}
                            onPress={() => handleSubmit(true)}
                            loading={skiping}
                            disabled={loading || skiping}
                        />
                    </View>
                )}
                ListFooterComponentStyle={{ paddingBottom: 10 }}
            />


        </MainView>
    );
};

export default Preferences;
