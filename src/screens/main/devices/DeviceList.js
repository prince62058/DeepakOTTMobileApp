import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import CustomHeader from '../../../components/header/CustomHeader';
import LoanScreenCard from '../../../components/loanScreenCard';
import MainView from '../../../components/MainView';
import SearchBox from '../../../components/search';
import { COLORS, FONTS, SIZES } from '../../../constants';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearSearch,
  getLoanListThunk,
  lockDeviceBulkThunk,
  unlockDeviceBulkThunk,
  requestDeviceLocationBulkThunk,
  requestDeviceSimInfoBulkThunk,
} from '../../../redux/slices/main/loanSlice';
import Loader from '../../../components/common/loader/Loader';
import Nodata from '../../../components/common/nodata/Nodata';
import Seperator from '../../../components/common/seperator/Seperator';
import LoanSheet from '../../../components/gorhumsheet/LoanSheet';
import { showToast } from '../../../utils/ToastAndroid';
import { fontSize } from '../../../utils/fontSize';
let debounceTimer;

const DeviceList = ({ navigation, route }) => {
  const { key } = route?.params ?? {};

  const dispatch = useDispatch();
  const { loanData, loading, pagination, searchData, searchPagination } =
    useSelector(state => state.loan);

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchData = useCallback(
    ({ isRefresh = false, page = 1, search = '', filter = key }) => {
      dispatch(getLoanListThunk({ isRefresh, page, search, filter }));
    },
    [dispatch, key],
  );

  useEffect(() => {
    fetchData({});
  }, [fetchData]);

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (!search) {
        dispatch(clearSearch());
        return;
      }
      // fetchData({ search, page: 1 })
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [search, fetchData, dispatch]);

  const onRefresh = useCallback(() => {
    fetchData({ isRefresh: true });
    setSearch('');
    dispatch(clearSearch());
    setSelectedIds([]);
  }, [fetchData, dispatch]);

  const handlePagination = () => {
    if (
      loading?.pagination ||
      loading?.loading ||
      searchPagination?.loading ||
      searchPagination?.pagination
    )
      return;
    if (pagination?.currentPage < pagination?.totalPages) {
      fetchData({ page: Number(pagination?.currentPage) + 1, search });
    }
  };

  const handleCardPress = item => {
    if (selectedIds.length > 0) {
      toggleSelection(item?._id);
    } else {
      navigation.navigate('LoanInfo', { loanId: item?._id });
    }
  };

  const toggleSelection = id => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  };

  const handleLongPress = item => {
    if (selectedIds.length === 0) {
      toggleSelection(item?._id);
    }
  };

  const handleBulkAction = actionThunk => {
    if (selectedIds.length === 0) return;
    dispatch(actionThunk({ loanIds: selectedIds }))
      .unwrap()
      .then(() => {
        setSelectedIds([]);
      });
  };

  const handleNavigation = () => {
    navigation.popToTop();
    navigation.navigate('Tab', { screen: 'AddCustomer' });
  };

  const [selectedFilterValue, setSelectedFilterValue] = useState([]);
  const handleSelectFilter = value => {
    setSelectedFilterValue(prev => {
      if (prev.includes(value)) {
        return prev;
      }
      return [...prev, value];
    });
  };
  const handleRemoveFilter = value => {
    if (value) {
      setSelectedFilterValue(prev => prev.filter(item => item !== value));
    } else {
      setSelectedFilterValue([]);
    }
  };
  const handleFilter = () => {
    if (selectedFilterValue?.length < 1) {
      showToast('Select atleast one filter value');
      return;
    }
  };

  const filterSheetRef = useRef(null);
  const handlePresent = useCallback(ref => {
    ref.current?.present();
  }, []);
  const handleDismiss = useCallback(ref => {
    ref.current?.dismiss();
  }, []);
  const [sheetOpen, setSheetOpen] = useState({
    filter: false,
  });
  const handleSheetChange = (key, value) => {
    setSheetOpen(prev => ({ ...prev, [key]: value }));
  };
  useEffect(() => {
    const backAction = () => {
      if (selectedIds.length > 0) {
        setSelectedIds([]);
        return true;
      }
      if (sheetOpen.filter) {
        handleDismiss(filterSheetRef);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [sheetOpen, selectedIds, handleDismiss]);

  const renderBulkActions = () => {
    if (selectedIds.length === 0) return null;
    return (
      <View style={styles.bulkActionContainer}>
        <Text style={styles.selectedCount}>{selectedIds.length} Selected</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.red }]}
            onPress={() => handleBulkAction(lockDeviceBulkThunk)}
          >
            <Text style={styles.actionText}>Lock</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.green }]}
            onPress={() => handleBulkAction(unlockDeviceBulkThunk)}
          >
            <Text style={styles.actionText}>Unlock</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: COLORS.primary400 },
            ]}
            onPress={() => handleBulkAction(requestDeviceLocationBulkThunk)}
          >
            <Text style={styles.actionText}>Loc</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: COLORS.primary400 },
            ]}
            onPress={() => handleBulkAction(requestDeviceSimInfoBulkThunk)}
          >
            <Text style={styles.actionText}>SIM</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <MainView transparent={false}>
      <CustomHeader
        title={
          selectedIds.length > 0
            ? `${selectedIds.length} Selected`
            : route.params?.title
        }
        back
        rightIcon={selectedIds.length > 0 && 'close'}
        handleRightIcon={() => setSelectedIds([])}
      />

      {loanData?.length > 0 && selectedIds.length === 0 && (
        <SearchBox
          value={search}
          handleChange={setSearch}
          showFilter={route.params?.filter ?? false}
          handleFilter={() => handlePresent(filterSheetRef)}
        />
      )}

      {loading?.loading || loading?.search ? (
        <Loader />
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={search ? searchData : loanData}
            keyExtractor={(item, index) =>
              item?._id ? `${item._id}-${index}` : index.toString()
            }
            renderItem={({ item }) => (
              <LoanScreenCard
                item={item}
                onPress={() => handleCardPress(item)}
                onLongPress={() => handleLongPress(item)}
                selected={selectedIds.includes(item?._id)}
              />
            )}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading?.refreshing}
                onRefresh={onRefresh}
              />
            }
            contentContainerStyle={
              loanData?.length > 0
                ? styles.contentContainerStyle
                : styles.emptyContainerStyle
            }
            ListEmptyComponent={<Nodata custom onPress={handleNavigation} />}
            ItemSeparatorComponent={<Seperator height={SIZES.height * 0.01} />}
            onEndReached={handlePagination}
            onEndReachedThreshold={0.1}
          />
          {renderBulkActions()}
        </View>
      )}

      <LoanSheet
        ref={filterSheetRef}
        handleSheetChanges={index => handleSheetChange('filter', index >= 0)}
        selectedFilterValue={selectedFilterValue}
        handleSelectFilter={handleSelectFilter}
        handleRemoveFilter={handleRemoveFilter}
        handleFilter={handleFilter}
      />
    </MainView>
  );
};

export default DeviceList;

const styles = StyleSheet.create({
  mainStyle: {
    marginHorizontal: SIZES.width * 0.035,
  },
  contentContainerStyle: {
    paddingHorizontal: SIZES.width * 0.05,
    paddingBottom: SIZES.height * 0.1,
  },
  emptyContainerStyle: {
    flex: 1,
  },
  bulkActionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.lightBlack,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SIZES.width * 0.04,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
  },
  selectedCount: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: fontSize(16),
  },
  actionRow: {
    flexDirection: 'row',
    gap: SIZES.width * 0.02,
  },
  actionButton: {
    paddingHorizontal: SIZES.width * 0.03,
    paddingVertical: SIZES.height * 0.01,
    borderRadius: 8,
    minWidth: SIZES.width * 0.12,
    alignItems: 'center',
  },
  actionText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: fontSize(12),
  },
});
