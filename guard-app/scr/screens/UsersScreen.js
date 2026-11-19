import { useThemedStyles } from '../context/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Button, Alert, StyleSheet } from 'react-native';
import api from '../api';

export default function UsersScreen() {
  const styles = useThemedStyles(baseStyles);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', role: 'residente', property_id: '' });

  const loadUsers = async () => {
    const res = await api.get('/users');
    setUsers(res.data);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async () => {
    try {
      await api.post('/users', form);
      Alert.alert('Usuario creado');
      loadUsers();
      setForm({ full_name: '', email: '', password: '', phone: '', role: 'residente', property_id: '' });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      loadUsers();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Usuarios</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{item.full_name} ({item.role})</Text>
            <Text>{item.email}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.delete}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Text style={styles.subHeader}>Crear usuario</Text>
      <TextInput placeholder="Nombre completo" value={form.full_name} onChangeText={(v) => setForm({...form, full_name: v})} style={styles.input} />
      <TextInput placeholder="Email" value={form.email} onChangeText={(v) => setForm({...form, email: v})} style={styles.input} autoCapitalize="none" />
      <TextInput placeholder="Contraseña" value={form.password} onChangeText={(v) => setForm({...form, password: v})} secureTextEntry style={styles.input} />
      <TextInput placeholder="Teléfono" value={form.phone} onChangeText={(v) => setForm({...form, phone: v})} style={styles.input} />
      <TextInput placeholder="Rol (residente, guardia, admin)" value={form.role} onChangeText={(v) => setForm({...form, role: v})} style={styles.input} />
      <TextInput placeholder="ID de propiedad" value={form.property_id} onChangeText={(v) => setForm({...form, property_id: v})} keyboardType="numeric" style={styles.input} />
      <Button title="Crear" onPress={handleCreate} />
    </View>
  );
}

const baseStyles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  card: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 5, borderRadius: 5 },
  delete: { color: 'red', marginTop: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 8, borderRadius: 5 },
});