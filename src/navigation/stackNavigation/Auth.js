import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { COLORS } from '../../constants'
import CompleteProfile from '../../screens/completeProfile'
import OtpScreen from '../../screens/otp'
import Preferences from '../../screens/preferences'
import WelcomeScreen from '../../screens/welcome'

const Stack = createNativeStackNavigator()

const Auth = () => {
    return (
        <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{ animation: 'ios_from_right', headerStyle: { backgroundColor: COLORS.black }, headerTintColor: '#fff', }}
        >
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false, headerTransparent: true }} />
            <Stack.Screen name="Otp" component={OtpScreen} options={{ title: '' }} />
            <Stack.Screen name="CompleteProfile" component={CompleteProfile} options={{ title: '' }} />
            <Stack.Screen name="Preferences" component={Preferences} options={{ title: '' }} />
        </Stack.Navigator>
    )
}
export default Auth