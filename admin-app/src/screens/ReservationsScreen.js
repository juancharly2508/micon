import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, StyleSheet } from 'react-native';
import api from '../api';

export default function ReservationsScreen() {
  const [reservations, setReservations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    area_id: '',
    user_id: '',
    property_id: '',
    start_datetime: '',
    end_datetime: '',
    total_cost: '',
    status: 'pendiente',
  });

  const load = async () => {
    try {
      const res = await api.get('/reservations');
      setReservations(res.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error al cargar');
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        area_id: Number(form.area_id),
        user_id: Number(form.user_id),
        property_id: Number(form.property_id),
        total_cost: Number(form.total_cost),
        start_datetime: form.start_datetime.replace(' ', 'T'),
        end_datetime: form.end_datetime.replace(' ', 'T'),
      };
      if (editingId) {
        await api.put(`/reservations/${editingId}`, payload);
        Alert.alert('Reservación actualizada');
      } else {
        await api.post('/reservations', payload);
        Alert.alert('Reservación creada');
      }
      resetForm();
      load();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      area_id: String(item.area_id),
      user_id: String(item.user_id),
      property_id: String(item.property_id),
      start_datetime: item.start_datetime.replace('T', ' ').slice(0, 16),
      end_datetime: item.end_datetime.replace('T', ' ').slice(0, 16),
      total_cost: String(item.total_cost),
      status: item.status,
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reservations/${id}`);
      Alert.alert('Reservación eliminada');
      load();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      area_id: '',
      user_id: '',
      property_id: '',
      start_datetime: '',
      end_datetime: '',
      total_cost: '',
      status: 'pendiente',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reservaciones</Text>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Área ID: {item.area_id}</Text>
            <Text>Usuario ID: {item.user_id}</Text>
            <Text>Inicio: {new Date(item.start_datetime).toLocaleString()}</Text>
            <Text>Fin: {new Date(item.end_datetime).toLocaleString()}</Text>
            <Text>Costo: ${item.total_cost}</Text>
            <Text>Estado: {item.status}</Text>
            <View style={styles.actions}>
              <Button title="Editar" onPress={() => handleEdit(item)} />
              <Button title="Eliminar" color="red" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />
      <Text style={styles.subHeader}>{editingId ? 'Editar reservación' : 'Crear reservación'}</Text>
      <TextInput placeholder="ID Área" value={form.area_id} onChangeText={(v) => setForm({...form, area_id: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="ID Usuario" value={form.user_id} onChangeText={(v) => setForm({...form, user_id: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="ID Propiedad" value={form.property_id} onChangeText={(v) => setForm({...form, property_id: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Inicio (YYYY-MM-DD HH:mm)" value={form.start_datetime} onChangeText={(v) => setForm({...form, start_datetime: v})} style={styles.input} />
      <TextInput placeholder="Fin (YYYY-MM-DD HH:mm)" value={form.end_datetime} onChangeText={(v) => setForm({...form, end_datetime: v})} style={styles.input} />
      <TextInput placeholder="Costo total" value={form.total_cost} onChangeText={(v) => setForm({...form, total_cost: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Estado (pendiente, confirmada, cancelada, pagada)" value={form.status} onChangeText={(v) => setForm({...form, status: v})} style={styles.input} />
      <View style={styles.formButtons}>
        <Button title={editingId ? 'Actualizar' : 'Crear'} onPress={handleSubmit} />
        {editingId && <Button title="Cancelar" onPress={resetForm} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  card: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 5, borderRadius: 5 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 8, borderRadius: 5 },
  formButtons: { flexDirection: 'row', gap: 10 },
});