import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import api from '../api';

export default function QRGenerateScreen() {
  const [visitorName, setVisitorName] = useState('');
  const [validTo, setValidTo] = useState('2025-12-31T23:59:59');
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
    <View style={{ padding: 20 }}>
      <Text>Generar QR para visitante</Text>
      <TextInput placeholder="Nombre del visitante" value={visitorName} onChangeText={setVisitorName} />
      <TextInput placeholder="Fecha válida (YYYY-MM-DD HH:mm)" value={validTo} onChangeText={setValidTo} />
      <TextInput placeholder="Entradas máximas" value={maxEntries} onChangeText={setMaxEntries} keyboardType="numeric" />
      <Button title="Generar QR" onPress={generateQR} />
      {qr && (
        <View>
          <Text>Código: {qr.code}</Text>
          <Text>Costo: ${qr.cost}</Text>
          <Text>El guardia escaneará este código.</Text>
        </View>
      )}
    </View>
  );
}