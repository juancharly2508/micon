import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import api from '../api';

export default function ReportsScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const sendReport = async () => {
    try {
      await api.post('/reports', {
        type: anonymous ? 'anonimo' : 'visitante',
        title,
        description,
        area,
        anonymous,
      });
      Alert.alert('Reporte enviado');
      setTitle(''); setDescription(''); setArea('');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Enviar reporte o aviso</Text>
      <TextInput placeholder="Título" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Descripción" value={description} onChangeText={setDescription} multiline style={styles.input} />
      <TextInput placeholder="Área" value={area} onChangeText={setArea} style={styles.input} />
      <Button title="Enviar" onPress={sendReport} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 10, borderRadius: 5 },
});