import { useCallback, useEffect, useState } from 'react';
import { Image, RefreshControl, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import CustomButton from '../../components/customButton';
import IndicatorLoader from '../../components/loader/IndicatorLoader';
import MainView from '../../components/mainView';
import Nodata from '../../components/nodata/Nodata';
import { icons, images, SIZES } from '../../constants';
import { watchListApi } from '../../redux/actions/watchAction';
import CustomHeader from '../../components/header/CustomHeader';
import TransliteratedText from '../../components/transliteratedText';
import styles from './styles';

const WatchHistory = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { watchlist } = useSelector(state => state.watchlist);

  const [loading, setLoading] = useState({
    loading: false,
    refresh: false,
    pagination: false,
  });
  const handleLoading = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const fetchData = ({ loader, page = 1 }) => {
    dispatch(
      watchListApi({
        cb: value => handleLoading(loader, value),
        page,
      }),
    );
  };

  useEffect(() => {
    fetchData({ loader: 'loading' });
  }, []);

  const onRefresh = useCallback(() => {
    fetchData({ loader: 'refresh' });
  }, []);

  const handlePagination = () => {
    if (loading?.pagination) return;
    if (watchlist?.currentPage < watchlist?.page) {
      fetchData({
        loader: 'pagination',
        page: Number(watchlist?.currentPage) + 1,
      });
    }
  };

  const handleMovieClick = item => {
    navigation.navigate('ContinueWatch', {
      data: item?.movieOrSeriesId,
      timeStamp: item?.playTimeStamps,
    });
  };

  const renderCard = ({ item }) => {
    const genreNames = item?.movieOrSeriesId?.genre
      ?.filter(g => g?.name)
      ?.map(g => t(`genres.${g.name.toLowerCase()}`) || g.name)
      ?.join(', ');

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: item?.movieOrSeriesId?.poster }}
          style={styles.poster}
        />
        <View style={styles.textWrapper}>
          <TransliteratedText
            style={styles.title}
            text={item?.movieOrSeriesId?.name}
            language={i18n.language}
          />
          <View style={styles.flexRow}>
            <Text style={styles.text}>{genreNames}</Text>
            <Text style={styles.dot}>•</Text>
            <Image source={images.imdb} style={styles.imdb} />
            <Text style={styles.text}>{item?.movieOrSeriesId?.imdbRating}</Text>
          </View>
          <CustomButton
            title={t('common.re_watch') || 'Re Watch'}
            iconLeft={icons.play}
            buttonStyle={styles.buttonStyle}
            iconStyle={styles.iconStyle}
            buttonText={styles.buttonText}
            onPress={() => handleMovieClick(item)}
          />
        </View>
      </View>
    );
  };

  return (
    <MainView transparent bottomSafe={false}>
      <CustomHeader title={t('common.watch_history') || 'Watch History'} />
      {loading.loading && watchlist?.length < 1 ? (
        <IndicatorLoader />
      ) : (
        <>
          <FlatList
            data={watchlist?.data?.filter(item => item?.movieOrSeriesId) || []}
            keyExtractor={item => item?._id}
            refreshControl={
              <RefreshControl
                refreshing={loading?.refresh}
                onRefresh={onRefresh}
              />
            }
            renderItem={renderCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              watchlist?.data?.length > 1
                ? { paddingBottom: 10 }
                : { flexGrow: 1 }
            }
            ItemSeparatorComponent={() => (
              <View style={{ height: SIZES.height * 0.005 }} />
            )}
            ListEmptyComponent={<Nodata title={t('common.no_watch_history') || 'No watch history found'} />}
            onEndReached={handlePagination}
            onEndReachedThreshold={0.9}
          />
        </>
      )}
    </MainView>
  );
};

export default WatchHistory;
