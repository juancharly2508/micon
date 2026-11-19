import { useThemedStyles } from '../context/ThemeContext';
import React, { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import QRVerifyScreen from './QRVerifyScreen';
import AnnouncementsScreen from './AnnouncementsScreen';
import ReportsScreen from './ReportsScreen';
import { ThemeToggle } from '../context/ThemeContext';

const tabs = [
  { key: 'scan', label: 'Escanear', icon: '▦', component: QRVerifyScreen },
  { key: 'announcements', label: 'Avisos', icon: '♧', component: AnnouncementsScreen },
  { key: 'reports', label: 'Reportes', icon: '⚑', component: ReportsScreen },
];

export default function GuardTabsScreen() {
  const styles = useThemedStyles(baseStyles);
  const [active, setActive] = useState('scan');
  const { logout } = useContext(AuthContext);
  const screen = tabs.find((item) => item.key === active);
  const Screen = screen.component;
  return <View style={styles.container}><View style={styles.content}><Screen /></View><View style={styles.bar}>{tabs.map((tab) => <Pressable key={tab.key} accessibilityRole="button" accessibilityState={{ selected: active === tab.key }} onPress={() => setActive(tab.key)} style={styles.tab}><Text style={[styles.icon, active === tab.key && styles.selected]}>{tab.icon}</Text><Text style={[styles.label, active === tab.key && styles.selected]}>{tab.label}</Text></Pressable>)}<ThemeToggle compact /><Pressable accessibilityRole="button" onPress={logout} style={styles.exit}><Text style={styles.exitText}>Salir</Text></Pressable></View></View>;
}

const baseStyles = StyleSheet.create({ container: { backgroundColor: '#F6F7FB', flex: 1 }, content: { flex: 1 }, bar: { alignItems: 'center', backgroundColor: '#FFF', borderTopColor: '#E9EAF0', borderTopWidth: 1, flexDirection: 'row', height: 68, justifyContent: 'space-around', paddingBottom: 4 }, tab: { alignItems: 'center', minWidth: 64, paddingVertical: 8 }, icon: { color: '#9BA4B5', fontSize: 18, fontWeight: '700' }, label: { color: '#9BA4B5', fontSize: 10, marginTop: 3 }, selected: { color: '#5140E9' }, exit: { borderColor: '#E9EAF0', borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 }, exitText: { color: '#596074', fontSize: 10, fontWeight: '700' } });
