import { useThemedStyles } from '../context/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, StyleSheet } from 'react-native';
import api from '../api';

export default function AreasScreen() {
  const styles = useThemedStyles(baseStyles);
  const [areas, setAreas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    requires_reservation: 1,
    is_public: 0,
    cost_per_hour: '0',
    cost_per_day: '0',
    max_capacity: '1',
    active: 1,
  });

  const load = async () => {
    try {
      const res = await api.get('/areas');
      setAreas(res.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error al cargar');
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        requires_reservation: Number(form.requires_reservation),
        is_public: Number(form.is_public),
        cost_per_hour: Number(form.cost_per_hour),
        cost_per_day: Number(form.cost_per_day),
        max_capacity: Number(form.max_capacity),
        active: Number(form.active),
      };
      if (editingId) {
        await api.put(`/areas/${editingId}`, payload);
        Alert.alert('Área actualizada');
      } else {
        await api.post('/areas', payload);
        Alert.alert('Área creada');
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
      name: item.name,
      description: item.description || '',
      requires_reservation: item.requires_reservation,
      is_public: item.is_public,
      cost_per_hour: String(item.cost_per_hour),
      cost_per_day: String(item.cost_per_day),
      max_capacity: String(item.max_capacity),
      active: item.active,
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/areas/${id}`);
      Alert.alert('Área eliminada');
      load();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      requires_reservation: 1,
      is_public: 0,
      cost_per_hour: '0',
      cost_per_day: '0',
      max_capacity: '1',
      active: 1,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Áreas de reservación</Text>
      <FlatList
        data={areas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text>Costo/hora: ${item.cost_per_hour}</Text>
            <Text>Costo/día: ${item.cost_per_day}</Text>
            <Text>Capacidad: {item.max_capacity}</Text>
            <Text>Activa: {item.active ? 'Sí' : 'No'}</Text>
            <View style={styles.actions}>
              <Button title="Editar" onPress={() => handleEdit(item)} />
              <Button title="Eliminar" color="red" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />
      <Text style={styles.subHeader}>{editingId ? 'Editar área' : 'Crear área'}</Text>
      <TextInput placeholder="Nombre" value={form.name} onChangeText={(v) => setForm({...form, name: v})} style={styles.input} />
      <TextInput placeholder="Descripción" value={form.description} onChangeText={(v) => setForm({...form, description: v})} style={styles.input} />
      <TextInput placeholder="Requiere reserva (1/0)" value={String(form.requires_reservation)} onChangeText={(v) => setForm({...form, requires_reservation: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Es público (1/0)" value={String(form.is_public)} onChangeText={(v) => setForm({...form, is_public: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Costo por hora" value={form.cost_per_hour} onChangeText={(v) => setForm({...form, cost_per_hour: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Costo por día" value={form.cost_per_day} onChangeText={(v) => setForm({...form, cost_per_day: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Capacidad máxima" value={form.max_capacity} onChangeText={(v) => setForm({...form, max_capacity: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Activa (1/0)" value={String(form.active)} onChangeText={(v) => setForm({...form, active: v})} keyboardType="numeric" style={styles.input} />
      <View style={styles.formButtons}>
        <Button title={editingId ? 'Actualizar' : 'Crear'} onPress={handleSubmit} />
        {editingId && <Button title="Cancelar" onPress={resetForm} />}
      </View>
    </View>
  );
}

const baseStyles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  card: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 5, borderRadius: 5 },
  title: { fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 8, borderRadius: 5 },
  formButtons: { flexDirection: 'row', gap: 10 },
});