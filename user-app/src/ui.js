import { useThemedStyles } from './context/ThemeContext';
import React, { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthContext } from './context/AuthContext';

export const colors = { background: '#F4F7FA', card: '#FFFFFF', ink: '#172735', muted: '#6E7C88', primary: '#21649A', primarySoft: '#E1EDF6', green: '#16B67A', border: '#DDE5EB' };

export function AppScreen({ children, navigation, active }) {
  const styles = useThemedStyles(baseStyles);
  return <View style={styles.screen}><View style={styles.content}>{children}</View>{navigation && <BottomBar navigation={navigation} active={active} />}</View>;
}

export function PageTitle({ title, subtitle, onBack }) {
  const styles = useThemedStyles(baseStyles);
  return <View style={styles.titleRow}>{onBack && <Pressable accessibilityLabel="Regresar" onPress={onBack} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>}<View><Text style={styles.pageTitle}>{title}</Text>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}</View></View>;
}

function BottomBar({ navigation, active }) {
  const styles = useThemedStyles(baseStyles);
  const { user } = useContext(AuthContext);
  const items = [['Home', '⌂', 'Inicio'], ['Announcements', '♧', 'Avisos'], ['Debts', '▤', 'Pagos'], ['Reservations', '▣', 'Reservas'], ['Profile', '◉', 'Perfil']];
  const visibleItems = items;
  return <View style={styles.tabBar}>{visibleItems.map(([route, icon, label]) => <Pressable key={route} onPress={() => navigation.navigate(route)} style={styles.tab}><Text style={[styles.tabIcon, active === route && styles.tabActive]}>{icon}</Text><Text style={[styles.tabText, active === route && styles.tabActive]}>{label}</Text></Pressable>)}</View>;
}

export const shared = StyleSheet.create({ card: { backgroundColor: colors.card, borderRadius: 16, elevation: 2, padding: 16, shadowColor: '#161B2B', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }, muted: { color: colors.muted, fontSize: 12 }, section: { color: colors.ink, fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 22 } });

const baseStyles = StyleSheet.create({ screen: { backgroundColor: colors.background, flex: 1 }, content: { flex: 1 }, tabBar: { alignItems: 'center', backgroundColor: colors.card, borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', height: 70, justifyContent: 'space-around', paddingBottom: 5 }, tab: { alignItems: 'center', gap: 3, minWidth: 48, paddingVertical: 9 }, tabIcon: { color: '#9BA4B5', fontSize: 19, fontWeight: '700' }, tabText: { color: '#9BA4B5', fontSize: 10 }, tabActive: { color: colors.primary }, titleRow: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 18 }, back: { alignItems: 'center', backgroundColor: colors.card, borderColor: colors.border, borderRadius: 12, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 }, backText: { color: colors.ink, fontSize: 30, lineHeight: 34 }, pageTitle: { color: colors.ink, fontSize: 21, fontWeight: '800' }, subtitle: { color: colors.muted, fontSize: 12, marginTop: 2 } });
