import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import MainView from '../../components/mainView';
import MoviePoster from '../../components/moviePoster';
import Nodata from '../../components/nodata/Nodata';
import { COLORS, SIZES } from '../../constants';
import { getGenreMoviewApi } from '../../redux/actions/searchAction';
import CustomHeader from '../../components/header/CustomHeader';

const Genre = ({ navigation, route }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { genreData } = useSelector(state => state.search);
  // console.log('List of genre data ---> ', genreData)

  const genreId = route?.params?.genreId ?? null;
  const mainType = route?.params?.mainType ?? null;

  const [loading, setLoading] = useState({
    loading: false,
    refresh: false,
    pagination: false,
    search: false,
  });
  const handleLoading = (key, value) => {
    setLoading(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchData = ({ loader, genre, page = 1 }) => {
    dispatch(
      getGenreMoviewApi({
        genre,
        mainType,
        cb: value => handleLoading(loader, value),
        page,
      }),
    );
  };

  useEffect(() => {
    if (genreId) {
      fetchData({ loader: 'loading', genre: genreId._id });
    }
  }, [genreId]);
  const onRefresh = useCallback(() => {
    if (genreId) {
      fetchData({ loader: 'refresh', genre: genreId._id });
    }
  }, [genreId]);

  const handlePagination = () => {
    if (loading?.pagination || !genreId) return;
    if (genreData?.currentPage < genreData?.page) {
      fetchData({
        loader: 'pagination',
        genre: genreId._id,
        page: Number(genreData?.currentPage) + 1,
      });
    }
  };

  const handleCardPress = item => {
    navigation.navigate('ContinueWatch', { data: item });
  };

  const renderItem = ({ item }) => {
    return (
      <MoviePoster item={item} plan posterPress={() => handleCardPress(item)} />
    );
  };

  return (
    <MainView transparent bottomSafe={false}>
      <CustomHeader
        title={
          genreId
            ? t(`genres.${genreId?.name?.toLowerCase()}`) || `${genreId?.name}`
            : ''
        }
      />
      {loading?.loading && genreData?.data?.length < 1 ? (
        <View style={styles.center}>
          <ActivityIndicator size={'large'} color={COLORS.white} />
        </View>
      ) : (
        <FlatList
          data={genreData?.data || []}
          keyExtractor={(item, index) => item?._id}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={
            genreData?.data?.length > 0
              ? styles.contentContainer
              : styles.emptyContainer
          }
          ListEmptyComponent={
            <Nodata
              title={
                mainType === 'MOVIE'
                  ? t('common.cinematic_wonders') || 'Cinematic Wonders Coming Soon'
                  : t('common.epic_sagas') || 'Epic Sagas in Production'
              }
              description={
                mainType === 'MOVIE'
                  ? t('common.curtain_rising') || 'A new curtain is about to rise. Stay tuned for the next big screen masterpiece!'
                  : t('common.next_chapter') || 'The next great chapter is being written. Check back soon for brand new series!'
              }
            />
          }
          ItemSeparatorComponent={
            <View style={{ height: SIZES.height * 0.005 }} />
          }
          refreshControl={
            <RefreshControl
              refreshing={loading?.refresh}
              onRefresh={onRefresh}
            />
          }
          onEndReached={handlePagination}
          onEndReachedThreshold={0.9}
        />
      )}
    </MainView>
  );
};

export default Genre;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    paddingHorizontal: SIZES.width * 0.025,
    paddingBottom: SIZES.height * 0.02,
  },
  emptyContainer: {
    flex: 1,
  },
  seperator: {
    height: SIZES.height * 0.1,
  },
});
