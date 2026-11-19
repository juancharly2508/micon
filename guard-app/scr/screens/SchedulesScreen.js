import { useThemedStyles } from '../context/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, StyleSheet } from 'react-native';
import api from '../api';

export default function SchedulesScreen() {
  const styles = useThemedStyles(baseStyles);
  const [schedules, setSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    area_id: '',
    day_of_week: '0',
    start_time: '08:00',
    end_time: '20:00',
    is_closed: 0,
  });

  const load = async () => {
    try {
      const res = await api.get('/schedules');
      setSchedules(res.data);
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
        day_of_week: Number(form.day_of_week),
        is_closed: Number(form.is_closed),
      };
      if (editingId) {
        await api.put(`/schedules/${editingId}`, payload);
        Alert.alert('Horario actualizado');
      } else {
        await api.post('/schedules', payload);
        Alert.alert('Horario creado');
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
      day_of_week: String(item.day_of_week),
      start_time: item.start_time.slice(0, 5),
      end_time: item.end_time.slice(0, 5),
      is_closed: item.is_closed,
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/schedules/${id}`);
      Alert.alert('Horario eliminado');
      load();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ area_id: '', day_of_week: '0', start_time: '08:00', end_time: '20:00', is_closed: 0 });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Horarios de áreas</Text>
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Área ID: {item.area_id}</Text>
            <Text>Día: {item.day_of_week} (0=Domingo, 1=Lunes...)</Text>
            <Text>Inicio: {item.start_time.slice(0, 5)}</Text>
            <Text>Fin: {item.end_time.slice(0, 5)}</Text>
            <Text>Cerrado: {item.is_closed ? 'Sí' : 'No'}</Text>
            <View style={styles.actions}>
              <Button title="Editar" onPress={() => handleEdit(item)} />
              <Button title="Eliminar" color="red" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />
      <Text style={styles.subHeader}>{editingId ? 'Editar horario' : 'Crear horario'}</Text>
      <TextInput placeholder="ID Área" value={form.area_id} onChangeText={(v) => setForm({...form, area_id: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Día (0-6)" value={form.day_of_week} onChangeText={(v) => setForm({...form, day_of_week: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Hora inicio (HH:mm)" value={form.start_time} onChangeText={(v) => setForm({...form, start_time: v})} style={styles.input} />
      <TextInput placeholder="Hora fin (HH:mm)" value={form.end_time} onChangeText={(v) => setForm({...form, end_time: v})} style={styles.input} />
      <TextInput placeholder="Cerrado (1/0)" value={String(form.is_closed)} onChangeText={(v) => setForm({...form, is_closed: v})} keyboardType="numeric" style={styles.input} />
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
  actions: { flexDirection: 'row', gap: 10, marginTop: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 8, borderRadius: 5 },
  formButtons: { flexDirection: 'row', gap: 10 },
});