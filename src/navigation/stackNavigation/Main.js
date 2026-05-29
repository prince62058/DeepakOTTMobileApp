import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

import MainView from '../../components/mainView';
import { COLORS, FONTS, icons, SIZES } from '../../constants';
import AddPayment from '../../screens/addPayment';
import ContinueWatch from '../../screens/continueWatch';
import EditProfile from '../../screens/editProfile';
import Faqs from '../../screens/FAQ';
import Notification from '../../screens/notification';
import Recommend from '../../screens/recommend';
import Rewards from '../../screens/Rewards';
import Search from '../../screens/search';
import Subscription from '../../screens/Subscription';
import Terms from '../../screens/terms';
import PrivacyPolicy from '../../screens/privacy';
import AboutUs from '../../screens/aboutUs';
import Trending from '../../screens/trending';
import Wallet from '../../screens/wallet';
import WatchHistory from '../../screens/watchHistory';
import Wishlist from '../../screens/wishlist';
import Categories from '../../screens/categories';
import Profile from '../../screens/profile';
import BottomTab from '../bottomTabNavigation/BottomTab';
import Genre from '../../screens/genre/Genre';

const Stack = createNativeStackNavigator();

const Main = () => {
  const { t } = useTranslation();
  return (
    <MainView transparent bottomSafe={false}>
      <Stack.Navigator
        initialRouteName="BottomTab"
        screenOptions={{
          animation: 'fade',
          headerShown: true,
          headerTransparent: false,
          headerStyle: {
            backgroundColor: COLORS.black,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            color: COLORS.white,
            fontFamily: FONTS.Regular,
            fontSize: SIZES.w10,
          },
        }}
      >
        <Stack.Screen
          name="BottomTab"
          component={BottomTab}
          options={{ headerTransparent: true, headerShown: false }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Wishlist"
          component={Wishlist}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Categories"
          component={Categories}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WatchHistory"
          component={WatchHistory}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Wallet"
          component={Wallet}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddPayment"
          component={AddPayment}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Rewards"
          component={Rewards}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Subscription"
          component={Subscription}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Terms"
          component={Terms}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicy}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AboutUs"
          component={AboutUs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Faqs"
          component={Faqs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ContinueWatch"
          component={ContinueWatch}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Trending"
          component={Trending}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Recommend"
          component={Recommend}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Search"
          component={Search}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notification"
          component={Notification}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Genre"
          component={Genre}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </MainView>
  );
};

export default Main;
