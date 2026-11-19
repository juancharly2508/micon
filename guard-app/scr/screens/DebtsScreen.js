import { useThemedStyles } from '../context/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, StyleSheet } from 'react-native';
import api from '../api';

export default function DebtsScreen() {
  const styles = useThemedStyles(baseStyles);
  const [debts, setDebts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    property_id: '',
    user_id: '',
    type: 'mantenimiento',
    description: '',
    amount: '',
    due_date: '',
    status: 'pendiente',
  });

  const load = async () => {
    try {
      const res = await api.get('/debts');
      setDebts(res.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error al cargar');
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        property_id: Number(form.property_id),
        user_id: Number(form.user_id),
        amount: Number(form.amount),
      };
      if (editingId) {
        await api.put(`/debts/${editingId}`, payload);
        Alert.alert('Deuda actualizada');
      } else {
        await api.post('/debts', payload);
        Alert.alert('Deuda creada');
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
      property_id: String(item.property_id),
      user_id: String(item.user_id),
      type: item.type,
      description: item.description || '',
      amount: String(item.amount),
      due_date: item.due_date ? item.due_date.split('T')[0] : '',
      status: item.status,
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/debts/${id}`);
      Alert.alert('Deuda eliminada');
      load();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      property_id: '',
      user_id: '',
      type: 'mantenimiento',
      description: '',
      amount: '',
      due_date: '',
      status: 'pendiente',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Deudas</Text>
      <FlatList
        data={debts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Tipo: {item.type}</Text>
            <Text>{item.description}</Text>
            <Text>Monto: ${item.amount}</Text>
            <Text>Vence: {item.due_date ? item.due_date.split('T')[0] : 'N/A'}</Text>
            <Text>Estado: {item.status}</Text>
            <View style={styles.actions}>
              <Button title="Editar" onPress={() => handleEdit(item)} />
              <Button title="Eliminar" color="red" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />
      <Text style={styles.subHeader}>{editingId ? 'Editar deuda' : 'Crear deuda'}</Text>
      <TextInput placeholder="ID Propiedad" value={form.property_id} onChangeText={(v) => setForm({...form, property_id: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="ID Usuario" value={form.user_id} onChangeText={(v) => setForm({...form, user_id: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Tipo (agua, gas, mantenimiento, reserva, mensualidad_app, qr)" value={form.type} onChangeText={(v) => setForm({...form, type: v})} style={styles.input} />
      <TextInput placeholder="Descripción" value={form.description} onChangeText={(v) => setForm({...form, description: v})} style={styles.input} />
      <TextInput placeholder="Monto" value={form.amount} onChangeText={(v) => setForm({...form, amount: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Fecha vencimiento (YYYY-MM-DD)" value={form.due_date} onChangeText={(v) => setForm({...form, due_date: v})} style={styles.input} />
      <TextInput placeholder="Estado (pendiente, pagada, vencida)" value={form.status} onChangeText={(v) => setForm({...form, status: v})} style={styles.input} />
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