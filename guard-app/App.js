import React from 'react';
import { AuthProvider } from './scr/context/AuthContext';
import AppNavigator from './scr/navigation/AppNavigator';
import { ThemeProvider } from './scr/context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider><AuthProvider><AppNavigator /></AuthProvider></ThemeProvider>
  );
}
