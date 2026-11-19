import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import GuardTabsScreen from '../screens/GuardTabsScreen';
import ServiceUnavailableScreen from '../screens/ServiceUnavailableScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : !user.has_guards ? (
          <Stack.Screen name="ServiceUnavailable" component={ServiceUnavailableScreen} />
        ) : (
          <>
            <Stack.Screen name="GuardTabs" component={GuardTabsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
