import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import MainView from '../../components/mainView';
import MoviePoster from '../../components/moviePoster';
import { images, SIZES } from '../../constants';
import { recommandedApi } from '../../redux/actions/homeAction';
import CustomHeader from '../../components/header/CustomHeader';
import styles from './styles';

const Recommend = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { recommand } = useSelector(state => state.home);
  console.log('Recommanded data ---> ', recommand);

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

  const fetchData = ({ loader, page = 1 }) => {
    dispatch(
      recommandedApi({ cb: value => handleLoading(loader, value), page }),
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
    if (recommand?.currentPage < recommand?.page) {
      fetchData({
        loader: 'pagination',
        page: Number(recommand?.currentPage) + 1,
      });
    }
  };

  const handleCardPress = item => {
    navigation.navigate('ContinueWatch', { data: item, autoPlay: false });
  };

  return (
    <MainView transparent bottomSafe={false}>
      <CustomHeader title={t('common.recommended') || 'Recommended for You'} />
      <View style={styles.View}>
        <FlatList
          data={recommand?.data || []}
          keyExtractor={item => item?._id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingHorizontal: SIZES.w4 }}
          renderItem={({ item }) => (
            <MoviePoster
              item={item}
              plan
              posterPress={() => handleCardPress(item)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={loading.refresh}
              onRefresh={onRefresh}
            />
          }
          ItemSeparatorComponent={
            <View style={{ height: SIZES.height * 0.005 }} />
          }
          onEndReached={handlePagination}
          onEndReachedThreshold={0.9}
        />
      </View>
    </MainView>
  );
};

export default Recommend;
