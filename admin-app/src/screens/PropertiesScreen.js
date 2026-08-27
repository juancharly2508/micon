import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, StyleSheet } from 'react-native';
import api from '../api';

export default function PropertiesScreen() {
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({ unit_number: '', address: '', owner_user_id: '', tenant_user_id: '', is_rental: 0, monthly_maintenance_fee: '0', status: 'activa' });

  const load = async () => {
    const res = await api.get('/properties');
    setProperties(res.data);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    try {
      await api.post('/properties', form);
      Alert.alert('Propiedad creada');
      load();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error');
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/properties/${id}`);
      load();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Propiedades</Text>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Unidad: {item.unit_number}</Text>
            <Text>Dirección: {item.address}</Text>
            <Text>Propietario ID: {item.owner_user_id}</Text>
            <Text>Inquilino ID: {item.tenant_user_id}</Text>
            <Button title="Eliminar" color="red" onPress={() => remove(item.id)} />
          </View>
        )}
      />
      <Text style={styles.subHeader}>Crear propiedad</Text>
      <TextInput placeholder="Número de unidad" value={form.unit_number} onChangeText={(v) => setForm({...form, unit_number: v})} style={styles.input} />
      <TextInput placeholder="Dirección" value={form.address} onChangeText={(v) => setForm({...form, address: v})} style={styles.input} />
      <TextInput placeholder="ID propietario" value={form.owner_user_id} onChangeText={(v) => setForm({...form, owner_user_id: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="ID inquilino" value={form.tenant_user_id} onChangeText={(v) => setForm({...form, tenant_user_id: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Cuota mantenimiento" value={form.monthly_maintenance_fee} onChangeText={(v) => setForm({...form, monthly_maintenance_fee: v})} keyboardType="numeric" style={styles.input} />
      <Button title="Crear" onPress={create} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  card: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 5, borderRadius: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 8, borderRadius: 5 },
});