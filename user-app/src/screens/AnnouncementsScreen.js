import { useThemedStyles } from '../context/ThemeContext';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import api from '../api';
import { AppScreen, colors, PageTitle, shared } from '../ui';

export default function AnnouncementsScreen({ navigation }) {
  const styles = useThemedStyles(baseStyles);
  const [announcements, setAnnouncements] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const res = await api.get('/announcements'); setAnnouncements(res.data); } finally { setLoading(false); } })(); }, []);
  return <AppScreen navigation={navigation} active="Announcements"><View style={styles.container}><PageTitle title="Anuncios y Avisos" subtitle="Mantente al día con tu comunidad" onBack={() => navigation.navigate('Home')} />{loading ? <ActivityIndicator color={colors.primary} /> : <FlatList data={announcements} contentContainerStyle={styles.list} keyExtractor={(item) => String(item.id)} ListEmptyComponent={<Text style={styles.empty}>No hay avisos por ahora.</Text>} renderItem={({ item }) => <View style={[shared.card, styles.card]}><Text style={styles.date}>▣ {new Date(item.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</Text><Text style={styles.title}>{item.title}</Text><Text style={styles.body}>{item.body}</Text></View>} />}</View></AppScreen>;
}
const baseStyles = StyleSheet.create({ container: { flex: 1, padding: 20, paddingBottom: 0 }, list: { gap: 12, paddingBottom: 18 }, card: { gap: 8 }, date: { color: colors.muted, fontSize: 11 }, title: { color: colors.ink, fontSize: 15, fontWeight: '800' }, body: { color: colors.muted, fontSize: 12, lineHeight: 17 }, empty: { color: colors.muted, textAlign: 'center' } });
