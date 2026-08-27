import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, Alert, StyleSheet } from 'react-native';
import api from '../api';

export default function QRCodesScreen() {
  const [qrs, setQrs] = useState([]);

  const load = async () => {
    try {
      const res = await api.get('/qr');
      setQrs(res.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error al cargar');
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/qr/${id}`);
      Alert.alert('QR eliminado');
      load();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Códigos QR de visitantes</Text>
      <FlatList
        data={qrs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Código: {item.code}</Text>
            <Text>Visitante: {item.visitor_name}</Text>
            <Text>Propiedad ID: {item.property_id}</Text>
            <Text>Válido hasta: {new Date(item.valid_to).toLocaleString()}</Text>
            <Text>Entradas: {item.entries_count}/{item.max_entries}</Text>
            <Text>Costo: ${item.cost}</Text>
            <Text>Pagado: {item.paid ? 'Sí' : 'No'}</Text>
            <Text>Estado: {item.status}</Text>
            <Button title="Eliminar" color="red" onPress={() => handleDelete(item.id)} />
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
});