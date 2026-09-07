import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import UsersScreen from '../screens/UsersScreen';
import PropertiesScreen from '../screens/PropertiesScreen';
import AreasScreen from '../screens/AreasScreen';
import DebtsScreen from '../screens/DebtsScreen';
import ReservationsScreen from '../screens/ReservationsScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';
import QRCodesScreen from '../screens/QRCodesScreen';
import ReportsScreen from '../screens/ReportsScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import SchedulesScreen from '../screens/SchedulesScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Users" component={UsersScreen} />
            <Stack.Screen name="Properties" component={PropertiesScreen} />
            <Stack.Screen name="Areas" component={AreasScreen} />
            <Stack.Screen name="Debts" component={DebtsScreen} />
            <Stack.Screen name="Reservations" component={ReservationsScreen} />
            <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
            <Stack.Screen name="QRCodes" component={QRCodesScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="Payments" component={PaymentsScreen} />
            <Stack.Screen name="Schedules" component={SchedulesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
