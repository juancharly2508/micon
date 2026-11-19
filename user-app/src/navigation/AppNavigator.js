import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PendingMembershipScreen from '../screens/PendingMembershipScreen';
import RulesScreen from '../screens/RulesScreen';
import HomeScreen from '../screens/HomeScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';
import DebtsScreen from '../screens/DebtsScreen';
import ReservationsScreen from '../screens/ReservationsScreen';
import QRGenerateScreen from '../screens/QRGenerateScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : !user.condo_id ? (
          <Stack.Screen name="PendingMembership" component={PendingMembershipScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
            <Stack.Screen name="Debts" component={DebtsScreen} />
            <Stack.Screen name="Reservations" component={ReservationsScreen} />
            {user.has_guards && <Stack.Screen name="QRGenerate" component={QRGenerateScreen} />}
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="Rules" component={RulesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
