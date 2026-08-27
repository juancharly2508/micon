import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text>Bienvenido, {user.full_name}</Text>
      <Button title="Avisos" onPress={() => navigation.navigate('Announcements')} />
      <Button title="Mis Deudas" onPress={() => navigation.navigate('Debts')} />
      <Button title="Reservaciones" onPress={() => navigation.navigate('Reservations')} />
      <Button title="Generar QR" onPress={() => navigation.navigate('QRGenerate')} />
      <Button title="Reportes" onPress={() => navigation.navigate('Reports')} />
      <Button title="Cerrar sesión" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: 10, padding: 20 },
});