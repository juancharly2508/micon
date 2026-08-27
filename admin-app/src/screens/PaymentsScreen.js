import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, StyleSheet } from 'react-native';
import api from '../api';

export default function PaymentsScreen() {
  const [payments, setPayments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    user_id: '',
    concept: '',
    amount: '',
    status: 'completado',
    reference: '',
  });

  const load = async () => {
    try {
      const res = await api.get('/payments');
      setPayments(res.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error al cargar');
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        user_id: Number(form.user_id),
        amount: Number(form.amount),
      };
      if (editingId) {
        await api.put(`/payments/${editingId}`, payload);
        Alert.alert('Pago actualizado');
      } else {
        await api.post('/payments', payload);
        Alert.alert('Pago registrado');
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
      user_id: String(item.user_id),
      concept: item.concept,
      amount: String(item.amount),
      status: item.status,
      reference: item.reference || '',
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/payments/${id}`);
      Alert.alert('Pago eliminado');
      load();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ user_id: '', concept: '', amount: '', status: 'completado', reference: '' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pagos</Text>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Usuario ID: {item.user_id}</Text>
            <Text>Concepto: {item.concept}</Text>
            <Text>Monto: ${item.amount}</Text>
            <Text>Estado: {item.status}</Text>
            <Text>Referencia: {item.reference || 'N/A'}</Text>
            <Text>Fecha: {new Date(item.payment_date).toLocaleString()}</Text>
            <View style={styles.actions}>
              <Button title="Editar" onPress={() => handleEdit(item)} />
              <Button title="Eliminar" color="red" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />
      <Text style={styles.subHeader}>{editingId ? 'Editar pago' : 'Registrar pago'}</Text>
      <TextInput placeholder="ID Usuario" value={form.user_id} onChangeText={(v) => setForm({...form, user_id: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Concepto" value={form.concept} onChangeText={(v) => setForm({...form, concept: v})} style={styles.input} />
      <TextInput placeholder="Monto" value={form.amount} onChangeText={(v) => setForm({...form, amount: v})} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Estado" value={form.status} onChangeText={(v) => setForm({...form, status: v})} style={styles.input} />
      <TextInput placeholder="Referencia" value={form.reference} onChangeText={(v) => setForm({...form, reference: v})} style={styles.input} />
      <View style={styles.formButtons}>
        <Button title={editingId ? 'Actualizar' : 'Registrar'} onPress={handleSubmit} />
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