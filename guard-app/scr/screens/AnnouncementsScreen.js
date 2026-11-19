import { useThemedStyles } from '../context/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import api from '../api';

export default function AnnouncementsScreen() {
  const styles = useThemedStyles(baseStyles);
  const [announcements, setAnnouncements] = useState([]);
  const load = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error al cargar');
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Avisos</Text>
      <Text style={styles.subtitle}>Información de la administración del condominio.</Text>
      <FlatList
        data={announcements}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>Aún no hay avisos</Text><Text style={styles.muted}>Cuando la administración publique uno, aparecerá aquí.</Text></View>}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Aviso de administración'}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />
    </View>
  );
}

const baseStyles = StyleSheet.create({
  container: { backgroundColor: '#F6F7FB', flex: 1, padding: 20, paddingTop: 48 },
  header: { color: '#161B2B', fontSize: 23, fontWeight: '800' },
  subtitle: { color: '#788196', fontSize: 12, marginBottom: 16, marginTop: 5 },
  list: { paddingBottom: 16 },
  card: { backgroundColor: '#FFF', borderColor: '#E9EAF0', borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 16 },
  date: { color: '#5140E9', fontSize: 10, fontWeight: '700', marginBottom: 8 },
  title: { color: '#161B2B', fontSize: 16, fontWeight: '800', marginBottom: 7 },
  body: { color: '#596074', fontSize: 13, lineHeight: 20 },
  empty: { alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, marginTop: 30, padding: 22 },
  emptyTitle: { color: '#161B2B', fontSize: 15, fontWeight: '700', marginBottom: 5 },
  muted: { color: '#788196', fontSize: 12, textAlign: 'center' },
});
