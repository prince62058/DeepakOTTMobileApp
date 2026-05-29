import debounce from 'lodash.debounce';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import MainView from '../../components/mainView';
import MoviePoster from '../../components/moviePoster';
import Nodata from '../../components/nodata/Nodata';
import CustomSearch from '../../components/search';
import TransliteratedText from '../../components/transliteratedText';
import { icons, SIZES, COLORS } from '../../constants';
import {
  createTopSearchApi,
  deleteTopSearchApi,
  getTopSearchApi,
  searchMovieSeriesApi,
} from '../../redux/actions/searchAction';
import { MOVIESERIES_SEARCH } from '../../redux/types';
import styles from './styles';
import CustomHeader from '../../components/header/CustomHeader';

const RenderTopItem = ({ item, handleMovieClick, handleDelete }) => {
  const { t, i18n } = useTranslation();
  const posterUri = item?.movieWebSeriesId?.poster || item?.poster || null;
  const title = item?.movieWebSeriesId?.name || item?.name || 'Unknown';

  const renderRightActions = () => {
    return (
      <Pressable
        style={styles.swipeDeleteButton}
        onPress={() => handleDelete(item)}
      >
        <Text style={styles.swipeActionText}>{t('common.remove') || 'Remove'}</Text>
      </Pressable>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
    >
      <View style={styles.card}>
        <View style={styles.row}>
          {posterUri ? (
            <Image source={{ uri: posterUri }} style={styles.posterStyle} />
          ) : (
            <View
              style={[
                styles.posterStyle,
                { justifyContent: 'center', alignItems: 'center' },
              ]}
            >
              <Text numberOfLines={1}>{title}</Text>
            </View>
          )}
          <TransliteratedText
            style={styles.title}
            text={title}
            language={i18n.language}
          />
        </View>
        <Pressable
          onPress={() => handleMovieClick(item)}
          style={styles.actionIcon}
        >
          <Image source={icons.play} style={styles.iconStyle} />
        </Pressable>
      </View>
    </Swipeable>
  );
};

const Search = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { topsearch, searchMoviesSeries } = useSelector(state => state.search);

  const [loading, setLoading] = useState({
    loading: false,
    refresh: false,
    search: false,
    pagination: false,
  });
  const handleLoading = (key, value) =>
    setLoading(prev => ({ ...prev, [key]: value }));

  const [query, setQuery] = useState('');

  const fetchData = ({ loader }) => {
    dispatch(
      getTopSearchApi({
        cb: value => handleLoading(loader, value),
      }),
    );
  };

  const fetchSearchData = ({ loader, search }) => {
    dispatch(
      searchMovieSeriesApi({
        cb: value => handleLoading(loader, value),
        search,
      }),
    );
  };

  useEffect(() => {
    fetchData({ loader: 'loading' });
    dispatch({ type: MOVIESERIES_SEARCH, payload: null });
  }, []);

  const onRefresh = useCallback(() => {
    fetchData({ loader: 'refresh' });
    setQuery('');
    dispatch({ type: MOVIESERIES_SEARCH, payload: null });
  }, []);

  const debouncedFetch = useRef(
    debounce(searchTerm => {
      if (searchTerm?.length > 0) {
        fetchSearchData({ loader: 'search', search: searchTerm });
      } else {
        dispatch({ type: MOVIESERIES_SEARCH, payload: null });
      }
    }, 800),
  ).current;

  useEffect(() => {
    return () => {
      if (debouncedFetch && debouncedFetch.cancel) debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  const handleSearch = useCallback(value => {
    setQuery(value);
    debouncedFetch(value);
  }, []);

  const safeKey = (item, index) => {
    return item?._id?.toString() || item?.id?.toString() || String(index);
  };

  const handleMovieClick = (item, api) => {
    const movieData = item?.movieWebSeriesId || item;
    const payload = {
      movieWebSeriesId: movieData?._id,
    };
    if (api) {
      dispatch(createTopSearchApi({ payload }));
    }
    navigation.navigate('ContinueWatch', { data: movieData });
  };

  const handleDeleteTopSearch = item => {
    dispatch(deleteTopSearchApi({ id: item?._id }));
  };

  const isSearchMode =
    Array.isArray(searchMoviesSeries) && searchMoviesSeries.length > 0;

  return (
    <MainView transparent bottomSafe={false}>
      <CustomHeader title={t('common.search') || 'Search'} />
      <View style={styles.center}>
        <CustomSearch
          placeholder={t('common.search_placeholder_2') || 'Search for a show, movie'}
          customStyle={styles.customStyle}
          value={query}
          onChangeText={handleSearch}
        />

        <Text style={styles.heading}>
          {isSearchMode ? t('common.web_series_movies') || 'Web series & movies' : t('common.top_searches') || 'Top Searches'}
        </Text>

        {isSearchMode ? (
          <FlatList
            key="search-list" // stable key for search list
            data={searchMoviesSeries}
            keyExtractor={safeKey}
            renderItem={({ item }) => {
              return (
                <MoviePoster
                  item={item}
                  posterPress={() => handleMovieClick(item, true)}
                />
              );
            }}
            showsVerticalScrollIndicator={false}
            numColumns={3}
            contentContainerStyle={{ paddingBottom: SIZES.h8, flexGrow: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={loading?.refresh}
                onRefresh={onRefresh}
              />
            }
            initialNumToRender={12}
            removeClippedSubviews={true}
            ListEmptyComponent={() => (
              <Nodata
                title={t('common.spotlight_waiting') || 'The Spotlight is Waiting'}
                description={t('common.no_match') || "We couldn't find a match, but the next blockbuster is just a discovery away. Try searching for something else!"}
              />
            )}
          />
        ) : (
          <FlatList
            key="top-list"
            data={topsearch}
            keyExtractor={safeKey}
            renderItem={({ item }) => (
              <RenderTopItem
                item={item}
                handleMovieClick={handleMovieClick}
                handleDelete={handleDeleteTopSearch}
              />
            )}
            showsVerticalScrollIndicator={false}
            numColumns={1}
            contentContainerStyle={{ paddingBottom: SIZES.h8, flexGrow: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={loading?.refresh}
                onRefresh={onRefresh}
              />
            }
            initialNumToRender={8}
            removeClippedSubviews={true}
            ListEmptyComponent={() => (
              <Nodata
                title={t('common.quiet_moment') || 'A Quiet Moment'}
                description={t('common.no_top_searches') || 'No top searches just yet. Be the first to trend by searching for your next favorite show!'}
              />
            )}
          />
        )}
      </View>
    </MainView>
  );
};

export default Search;
