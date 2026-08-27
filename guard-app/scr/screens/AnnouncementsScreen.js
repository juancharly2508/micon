import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, StyleSheet } from 'react-native';
import api from '../api';

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    body: '',
    expires_at: '',
    active: 1,
  });

  const load = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error al cargar');
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        active: Number(form.active),
        expires_at: form.expires_at || null,
      };
      if (editingId) {
        await api.put(`/announcements/${editingId}`, payload);
        Alert.alert('Aviso actualizado');
      } else {
        await api.post('/announcements', payload);
        Alert.alert('Aviso creado');
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
      title: item.title,
      body: item.body,
      expires_at: item.expires_at ? item.expires_at.split('T')[0] : '',
      active: item.active,
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      Alert.alert('Aviso eliminado');
      load();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ title: '', body: '', expires_at: '', active: 1 });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Avisos generales</Text>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.body}</Text>
            <Text>Expira: {item.expires_at ? item.expires_at.split('T')[0] : 'N/A'}</Text>
            <Text>Activo: {item.active ? 'Sí' : 'No'}</Text>
            <View style={styles.actions}>
              <Button title="Editar" onPress={() => handleEdit(item)} />
              <Button title="Eliminar" color="red" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />
      <Text style={styles.subHeader}>{editingId ? 'Editar aviso' : 'Crear aviso'}</Text>
      <TextInput placeholder="Título" value={form.title} onChangeText={(v) => setForm({...form, title: v})} style={styles.input} />
      <TextInput placeholder="Contenido" value={form.body} onChangeText={(v) => setForm({...form, body: v})} multiline style={styles.input} />
      <TextInput placeholder="Fecha expiración (YYYY-MM-DD)" value={form.expires_at} onChangeText={(v) => setForm({...form, expires_at: v})} style={styles.input} />
      <TextInput placeholder="Activo (1/0)" value={String(form.active)} onChangeText={(v) => setForm({...form, active: v})} keyboardType="numeric" style={styles.input} />
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
  title: { fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 8, borderRadius: 5 },
  formButtons: { flexDirection: 'row', gap: 10 },
});