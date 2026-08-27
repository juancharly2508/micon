import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, Alert, StyleSheet } from 'react-native';
import api from '../api';

export default function ReportsScreen() {
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

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/reports/${id}`, { status });
      Alert.alert('Estado actualizado');
      load();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reports/${id}`);
      Alert.alert('Reporte eliminado');
      load();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reportes</Text>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Tipo: {item.type}</Text>
            <Text>Título: {item.title}</Text>
            <Text>{item.description}</Text>
            <Text>Área: {item.area || 'N/A'}</Text>
            <Text>Estado: {item.status}</Text>
            <View style={styles.actions}>
              <Button title="Marcar en revisión" onPress={() => handleStatus(item.id, 'en_revision')} />
              <Button title="Marcar resuelto" onPress={() => handleStatus(item.id, 'resuelto')} />
              <Button title="Eliminar" color="red" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  card: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 5, borderRadius: 5 },
  actions: { flexDirection: 'row', gap: 5, marginTop: 5 },
});