import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import api from '../api';

export default function ReservationsScreen() {
  const [areaId, setAreaId] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');

  const createReservation = async () => {
    const area_id = Number(areaId);
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (!Number.isInteger(area_id) || area_id <= 0 || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      Alert.alert('Datos inválidos', 'Indica el área y fechas válidas en formato YYYY-MM-DDTHH:mm.');
      return;
    }
    if (end <= start) {
      Alert.alert('Horario inválido', 'La fecha final debe ser posterior a la fecha inicial.');
      return;
    }

    try {
      const response = await api.post('/reservations', {
        area_id,
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString(),
      });
      Alert.alert('Reservación creada', `Costo total: $${response.data.total_cost}`);
      setAreaId('');
      setStartDateTime('');
      setEndDateTime('');
    } catch (error) {
      Alert.alert('No se pudo reservar', error.response?.data?.error || 'Revisa tu conexión e inténtalo de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear reservación</Text>
      <TextInput keyboardType="numeric" onChangeText={setAreaId} placeholder="ID del área" style={styles.input} value={areaId} />
      <TextInput autoCapitalize="none" onChangeText={setStartDateTime} placeholder="Inicio: YYYY-MM-DDTHH:mm" style={styles.input} value={startDateTime} />
      <TextInput autoCapitalize="none" onChangeText={setEndDateTime} placeholder="Fin: YYYY-MM-DDTHH:mm" style={styles.input} value={endDateTime} />
      <Button title="Reservar" onPress={createReservation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, padding: 20 },
  input: { borderColor: '#9ca3af', borderRadius: 6, borderWidth: 1, padding: 12 },
  title: { fontSize: 22, fontWeight: 'bold' },
});
