import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import MainView from '../../components/mainView';
import Nodata from '../../components/nodata/Nodata';
import { COLORS, icons, SIZES } from '../../constants';

import {
  deleteWishlistApi,
  wishlistApi,
} from '../../redux/actions/wishlistAction';
import styles from './styles';
import CustomHeader from '../../components/header/CustomHeader';
import TransliteratedText from '../../components/transliteratedText';

const Wishlist = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { key: 'all', label: t('common.all') || 'All' },
    { key: 'MOVIE', label: t('common.movie') || 'Movie' },
    { key: 'WEB_SERIES', label: t('common.web_series') || 'Web Series' },
  ];

  const dispatch = useDispatch();

  const handleWishlistClick = item => {
    navigation.navigate('ContinueWatch', {
      data: item?.movieOrSeriesId,
      autoPlay: false,
    });
  };
  const { wishlist } = useSelector(state => state.wishlist);
  // console.log("wishlist store data", wishlist)

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
      wishlistApi({
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
    if (wishlist?.currentPage < wishlist?.page) {
      fetchData({
        loader: 'pagination',
        page: Number(wishlist?.currentPage) + 1,
      });
    }
  };

  const handleDeleteWishlist = item => {
    dispatch(deleteWishlistApi({ id: item?.movieOrSeriesId?._id }));
  };

  const filteredWishlist = useMemo(() => {
    if (activeTab === 'all') {
      return wishlist?.data;
    }
    return wishlist?.data?.filter(
      item => item?.movieOrSeriesId?.mainType === activeTab,
    );
  }, [wishlist, activeTab]);

  const renderCard = ({ item }) => {
    return (
      <View style={styles.card}>
        <Pressable
          style={styles.clickableArea}
          onPress={() => handleWishlistClick(item)}
        >
          <Image
            source={{ uri: item.movieOrSeriesId.poster }}
            style={styles.poster}
          />
          <View style={styles.textWrapper}>
            <TransliteratedText
              style={styles.title}
              text={item.movieOrSeriesId.name}
              language={i18n.language}
            />
            <View style={styles.cardFlexRow}>
              <Text style={styles.text}>
                {t(`genres.${item.movieOrSeriesId.genre?.[0]?.name.toLowerCase()}`) || item.movieOrSeriesId.genre?.[0]?.name}
              </Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.text}>
                {item?.movieOrSeriesId?.imdbRating}
              </Text>
            </View>
          </View>
        </Pressable>
        <Pressable onPress={() => handleDeleteWishlist(item)}>
          <Image source={icons.wishlistFill} style={styles.wishlistFill} />
        </Pressable>
      </View>
    );
  };

  return (
    <MainView transparent bottomSafe={false}>
      <CustomHeader title={t('common.wishlist') || 'Wishlist'} />

      <View style={styles.toggle}>
        {tabs.map(item => {
          const isActive = activeTab === item.key;
          const ButtonWrapper = isActive ? LinearGradient : View;
          const wrapperProps = isActive
            ? {
                colors: [COLORS.p1, COLORS.p2],
                start: { x: 0, y: 0 },
                end: { x: 0, y: 1 },
                style: styles.Row,
              }
            : { style: styles.Row };

          return (
            <Pressable
              key={item.key}
              style={styles.flexRow}
              onPress={() => setActiveTab(item.key)}
            >
              <ButtonWrapper {...wrapperProps}>
                <Text style={[styles.toggleText, { color: COLORS.white }]}>
                  {item.label}
                </Text>
              </ButtonWrapper>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filteredWishlist}
        keyExtractor={item => item?._id}
        renderItem={renderCard}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={{ height: SIZES.height * 0.006 }} />
        )}
        refreshControl={
          <RefreshControl refreshing={loading?.refresh} onRefresh={onRefresh} />
        }
        contentContainerStyle={
          filteredWishlist?.length !== 0 ? {} : { flexGrow: 1 }
        }
        ListEmptyComponent={() => (
          <Nodata
            title={
              activeTab === 'all'
                ? t('common.watchlist_awaits') || 'Your Watchlist Awaits'
                : activeTab === 'MOVIE'
                ? t('common.cinematic_journeys') || 'Cinematic Journeys Ahead'
                : t('common.epic_series_coming') || 'Epic Series Coming Your Way'
            }
            description={
              activeTab === 'all'
                ? t('common.watchlist_blank') || 'Your watchlist is a blank canvas. Start adding your favorites and let the marathon begin!'
                : t('common.new_movies_added') || 'New movies are constantly added. Stay tuned for your next favorite story!'
            }
          />
        )}
        onEndReached={handlePagination}
        onEndReachedThreshold={0.9}
      />
    </MainView>
  );
};

export default Wishlist;
