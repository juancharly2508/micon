import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);
const themes = { light: { background: '#F5F4F9', surface: '#FFFFFF', surfaceAlt: '#ECEAF3', text: '#242035', muted: '#777387', border: '#E2DFEB', primary: '#59478F', primarySoft: '#EAE6F5' }, dark: { background: '#17151F', surface: '#24212E', surfaceAlt: '#302C3C', text: '#F3F0FA', muted: '#B7B0C6', border: '#403A4F', primary: '#B8A8F0', primarySoft: '#352E49' } };

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');
  useEffect(() => { AsyncStorage.getItem('micon-theme').then((saved) => { if (saved === 'dark' || saved === 'light') setMode(saved); }).catch(() => {}); }, []);
  const toggleMode = async () => { const next = mode === 'dark' ? 'light' : 'dark'; setMode(next); await AsyncStorage.setItem('micon-theme', next); };
  const value = useMemo(() => ({ mode, colors: themes[mode], toggleMode }), [mode]);
  return <><StatusBar style={mode === 'dark' ? 'light' : 'dark'} /><ThemeContext.Provider value={value}>{children}</ThemeContext.Provider></>;
}

export function useTheme() { return useContext(ThemeContext) || { mode: 'light', colors: themes.light, toggleMode: () => {} }; }

export function useThemedStyles(baseStyles) {
  const { mode, colors } = useTheme();
  return useMemo(() => {
    const textColors = new Set(['#161B2B', '#172735', '#242035', '#24283A', '#30364A', '#3E4556', '#26213F']);
    const mutedColors = new Set(['#596074', '#788196', '#9BA4B5']);
    const softColors = new Set(['#FFECEC', '#E6F5FF', '#E6F4FE', '#E3F9ED', '#FFF3D9', '#E9F3FF', '#EEEFF4', '#F0F1F6', '#F0F1F5']);
    const map = (value, key) => {
      if (Array.isArray(value)) return value.map((item) => map(item, key));
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, map(child, childKey)]));
      if (typeof value !== 'string') return value;
      const color = value.toUpperCase();
      if (key === 'backgroundColor') {
        if (color === '#F6F7FB' || color === '#F4F7FA' || color === '#F5F4F9' || color === '#F2F7F5') return colors.background;
        if (color === '#FFF' || color === '#FFFFFF' || color === '#FAFAFC') return colors.surface;
        if (color === '#26213F') return mode === 'dark' ? colors.surfaceAlt : value;
        if (softColors.has(color) || color === '#F8F7FF' || color === '#F7F6FF') return colors.surfaceAlt;
        if (color === '#EEEAFE' || color === '#EEECFF' || color === '#F2F1FF') return colors.primarySoft;
        if (color === '#5140E9') return colors.primary;
      }
      if (key === 'color') {
        if (textColors.has(color)) return colors.text;
        if (mutedColors.has(color)) return colors.muted;
        if (color === '#5140E9' || color === '#342A9C') return colors.primary;
      }
      if (key === 'borderColor' || key === 'borderTopColor' || key === 'borderBottomColor') {
        if (['#E9EAF0', '#E4E6ED', '#D9DCE5', '#CCC', '#DDD8FF'].includes(color)) return colors.border;
        if (color === '#5140E9') return colors.primary;
      }
      if (key === 'shadowColor' && mode === 'dark') return '#000000';
      return value;
    };
    return map(baseStyles, '');
  }, [baseStyles, colors, mode]);
}

export function ThemeToggle({ compact = false }) {
  const { mode, colors, toggleMode } = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={mode === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'} onPress={toggleMode} style={[styles.button, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}><Text style={[styles.text, { color: colors.text }]}>{compact ? (mode === 'dark' ? '☀' : '☾') : (mode === 'dark' ? '☀  Modo claro' : '☾  Modo oscuro')}</Text></Pressable>;
}

const styles = { button: { alignSelf: 'flex-start', borderRadius: 12, borderWidth: 1, marginTop: 12, paddingHorizontal: 13, paddingVertical: 10 }, text: { fontSize: 12, fontWeight: '700' } };
