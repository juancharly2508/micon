import { useThemedStyles } from '../context/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import api from '../api';

export default function ReportsScreen() {
  const styles = useThemedStyles(baseStyles);
  const [reports, setReports] = useState([]);

  const load = async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error al cargar');
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reportes</Text>
      <Text style={styles.subtitle}>Incidentes registrados en el condominio.</Text>
      <FlatList
        data={reports}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>Sin reportes pendientes</Text><Text style={styles.muted}>Los reportes de visitantes aparecerán aquí.</Text></View>}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.top}><Text style={styles.type}>{item.type === 'visitante' ? 'Visitante' : 'Incidente'}</Text><Text style={styles.status}>{item.status || 'Nuevo'}</Text></View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.description}</Text>
            {item.area ? <Text style={styles.area}>Zona: {item.area}</Text> : null}
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
  card: { backgroundColor: '#FFF', borderColor: '#E9EAF0', borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 15 },
  top: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  type: { color: '#5140E9', fontSize: 10, fontWeight: '800' },
  status: { backgroundColor: '#EEEAFE', borderRadius: 10, color: '#5140E9', fontSize: 10, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5 },
  title: { color: '#161B2B', fontSize: 15, fontWeight: '800', marginBottom: 5 },
  body: { color: '#596074', fontSize: 12, lineHeight: 18 },
  area: { color: '#788196', fontSize: 11, marginTop: 10 },
  empty: { alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, marginTop: 30, padding: 22 },
  emptyTitle: { color: '#161B2B', fontSize: 15, fontWeight: '700', marginBottom: 5 },
  muted: { color: '#788196', fontSize: 12, textAlign: 'center' },
});
