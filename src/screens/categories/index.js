import debounce from 'lodash.debounce';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import IndicatorLoader from '../../components/loader/IndicatorLoader';
import MainView from '../../components/mainView';
import MoviePoster from '../../components/moviePoster';
import Nodata from '../../components/nodata/Nodata';
import CustomSearch from '../../components/search';
import { COLORS, icons, SIZES } from '../../constants';
import { categoryApi } from '../../redux/actions/homeAction';
import { searchMovieSeriesApi } from '../../redux/actions/searchAction';
import { MOVIESERIES_SEARCH } from '../../redux/types';
import styles from './styles';
import CustomHeader from '../../components/header/CustomHeader';

const Categories = ({ navigation }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { category } = useSelector(state => state.home);
  const { searchMoviesSeries } = useSelector(state => state.search);

  const [loading, setLoading] = useState({
    loading: false,
    refresh: false,
    search: false,
  });
  const handleLoading = useCallback((key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  const [activeTab, setActiveTab] = useState('MOVIE');
  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const [query, setQuery] = useState('');

  const fetchData = useCallback(
    (loader, mainType) => {
      dispatch(
        categoryApi({
          mainType,
          cb: value => handleLoading(loader, value),
        }),
      );
    },
    [dispatch, handleLoading],
  );

  const fetchSearchData = useCallback(
    ({ loader, search, mainType, genre }) => {
      dispatch(
        searchMovieSeriesApi({
          cb: value => handleLoading(loader, value),
          search,
          mainType,
          genre,
        }),
      );
    },
    [dispatch, handleLoading],
  );

  useEffect(() => {
    fetchData('loading', activeTab);
  }, [fetchData]); // only on mount (initial fetch). activeTab changes handled below.

  useEffect(() => {
    fetchData('loading', activeTab);

    if (debouncedRef.current && debouncedRef.current.cancel) {
      debouncedRef.current.cancel();
    }

    if (query?.length > 0) {
      fetchSearchData({
        loader: 'search',
        search: query,
        mainType: activeTab,
        genre: null,
      });
    } else {
      dispatch({ type: MOVIESERIES_SEARCH, payload: null });
    }
  }, [activeTab, fetchData, fetchSearchData, query, dispatch]);

  const onRefresh = useCallback(() => {
    fetchData('refresh', activeTab);
    setQuery('');
    dispatch({ type: MOVIESERIES_SEARCH, payload: null });
  }, [dispatch, fetchData, activeTab]);

  const debouncedRef = useRef(
    debounce(searchTerm => {
      if (searchTerm?.length > 0) {
        fetchSearchData({
          loader: 'search',
          search: searchTerm,
          mainType: activeTabRef.current,
          genre: null,
        });
      } else {
        dispatch({ type: MOVIESERIES_SEARCH, payload: null });
      }
    }, 800),
  );

  useEffect(() => {
    return () => {
      debouncedRef.current &&
        debouncedRef.current.cancel &&
        debouncedRef.current.cancel();
    };
  }, []);

  const handleSearch = useCallback(value => {
    setQuery(value);
    debouncedRef.current(value);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setQuery('');
      dispatch({ type: MOVIESERIES_SEARCH, payload: null });
    });
    return unsubscribe;
  }, [navigation, dispatch]);

  const renderToggleButton = (key, label, icon) => {
    const isActive = activeTab === key;
    const ButtonWrapper = isActive ? LinearGradient : View;
    const wrapperProps = isActive
      ? {
          colors: [COLORS.p1, COLORS.p2],
          start: { x: 0, y: 0 },
          end: { x: 0, y: 1 },
          style: styles.row,
        }
      : { style: styles.row };

    return (
      <Pressable style={styles.flexRow} onPress={() => setActiveTab(key)}>
        <ButtonWrapper {...wrapperProps}>
          <Text style={styles.toggleText}>{label}</Text>
          <Image source={icon} style={styles.icon} />
        </ButtonWrapper>
      </Pressable>
    );
  };

  const handleGenre = item => {
    navigation.navigate('Genre', { genreId: item, mainType: activeTab });
  };

  const renderItem = ({ item }) => (
    <Pressable style={styles.cardWrapper} onPress={() => handleGenre(item)}>
      <ImageBackground source={{ uri: item?.image }} style={styles.bgImage}>
        <View style={styles.overlay} />
        <Text style={styles.cardTitle}>
          {t(`genres.${item?.name?.toLowerCase()}`) || item?.name}
        </Text>
      </ImageBackground>
    </Pressable>
  );

  const isSearchMode =
    Array.isArray(searchMoviesSeries) && searchMoviesSeries.length > 0;
  const genreData = Array.isArray(category?.genreData)
    ? category.genreData
    : [];
  const searchData = Array.isArray(searchMoviesSeries)
    ? searchMoviesSeries
    : [];

  const numColumns = isSearchMode ? 3 : 2;

  const handleMovieClick = item => {
    navigation.navigate('ContinueWatch', { data: item });
  };
  const handleGenreClick = item => {
    navigation.navigate('ContinueWatch', { data: item });
  };

  return (
    <MainView transparent bottomSafe={false}>
      <CustomHeader title={t('common.categories') || 'Categories'} />

      <View style={styles.toggle}>
        {renderToggleButton('MOVIE', t('common.movie') || 'Movie', icons.movie)}
        {renderToggleButton('WEB_SERIES', t('common.web_series') || 'Web Series', icons.webSeries)}
      </View>

      <View style={styles.center}>
        <CustomSearch
          placeholder={t('common.search_placeholder') || 'Search for a movie and webseries'}
          value={query}
          onChangeText={handleSearch}
        />

        {loading.loading && genreData?.length < 1 ? (
          <IndicatorLoader />
        ) : (
          <FlatList
            // key includes mode & numColumns so switching remounts FlatList -> prevents native crashes
            key={`flatlist-${
              isSearchMode ? 'search' : 'genre'
            }-cols-${numColumns}`}
            data={query?.length ? searchData : genreData}
            numColumns={numColumns}
            columnWrapperStyle={
              numColumns > 1 ? { justifyContent: 'flex-start' } : undefined
            }
            keyExtractor={(item, index) =>
              item?._id ?? item?.id ?? index.toString()
            }
            contentContainerStyle={[
              styles.listContainer,
              (query?.length ? searchData : genreData).length === 0 && {
                flexGrow: 1,
              },
            ]}
            ItemSeparatorComponent={<View style={{ height: 5 }} />}
            ListHeaderComponent={
              query?.length ? (
                <Text style={styles.heading}>{`${t('common.result_of') || 'Result of'} ${query}`}</Text>
              ) : (
                <Text style={styles.heading}>{t('common.genre_categories') || 'Genre Categories'}</Text>
              )
            }
            ListHeaderComponentStyle={{ width: SIZES.width * 0.9 }}
            renderItem={
              isSearchMode
                ? ({ item }) => (
                    <MoviePoster
                      item={item}
                      posterPress={() => handleMovieClick(item)}
                    />
                  )
                : renderItem
            }
            refreshControl={
              <RefreshControl
                refreshing={loading?.refresh}
                onRefresh={onRefresh}
              />
            }
            removeClippedSubviews={Platform.OS === 'android' ? false : true}
            initialNumToRender={12}
            ListEmptyComponent={() => (
              <Nodata
                title={
                  activeTab === 'MOVIE'
                    ? t('common.movie_coming_soon') || 'New movie is coming soon. Stay tuned for exciting entertainment'
                    : t('common.series_coming_soon') || 'New webseries is coming soon. Stay tuned for exciting entertainment'
                }
              />
            )}
          />
        )}
      </View>
    </MainView>
  );
};

export default Categories;
