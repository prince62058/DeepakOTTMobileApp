import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomBottomTab from '../../components/bottomTab';
import Home from '../../screens/home';
import Categories from '../../screens/categories';
import Profile from '../../screens/profile';
import Wishlist from '../../screens/wishlist';
import HomeHeader from '../../components/homeHeader';
import MainView from '../../components/mainView';
import { COLORS } from '../../constants';

const Tab = createBottomTabNavigator();
const BottomTab = () => {
    return (
        <MainView transparent>
            <Tab.Navigator tabBar={(props) => <CustomBottomTab {...props} />} >
                <Tab.Screen name="Home" component={Home}
                    options={({ navigation }) => ({ header: () => <HomeHeader navigation={navigation} /> })}
                />
                <Tab.Screen name="Categories" component={Categories} options={{ headerShown: false }} />
                <Tab.Screen name="Wishlist" component={Wishlist} options={{ headerShown: false }} />
                <Tab.Screen name="Profile" component={Profile} options={{ headerShown: false, title: 'Account' }} />
            </Tab.Navigator>
        </MainView>
    )
}

export default BottomTab