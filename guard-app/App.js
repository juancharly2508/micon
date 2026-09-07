import React from 'react';
import { AuthProvider } from './scr/context/AuthContext';
import AppNavigator from './scr/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
