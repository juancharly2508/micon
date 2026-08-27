import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import api from '../api';

export default function QRGenerateScreen() {
  const [visitorName, setVisitorName] = useState('');
  const [validTo, setValidTo] = useState('2025-12-31 23:59:59');
  const [maxEntries, setMaxEntries] = useState('1');
  const [qr, setQr] = useState(null);

  const generateQR = async () => {
    try {
      const res = await api.post('/qr/generate', {
        visitor_name: visitorName,
        valid_to: validTo,
        max_entries: parseInt(maxEntries),
      });
      setQr(res.data.qr);
      Alert.alert('QR generado', res.data.message);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Generar QR para visitante</Text>
      <TextInput placeholder="Nombre del visitante" value={visitorName} onChangeText={setVisitorName} style={styles.input} />
      <TextInput placeholder="Fecha válida (YYYY-MM-DD HH:mm:ss)" value={validTo} onChangeText={setValidTo} style={styles.input} />
      <TextInput placeholder="Entradas máximas" value={maxEntries} onChangeText={setMaxEntries} keyboardType="numeric" style={styles.input} />
      <Button title="Generar QR" onPress={generateQR} />
      {qr && (
        <View style={styles.qrContainer}>
          <Text>Código: {qr.code}</Text>
          <Text>Costo: ${qr.cost}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 10, borderRadius: 5 },
  qrContainer: { marginTop: 20, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
});