import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Panel de Administración</Text>
      <Text>Bienvenido, {user.full_name}</Text>
      <View style={styles.menu}>
        <Button title="Usuarios" onPress={() => navigation.navigate('Users')} />
        <Button title="Propiedades" onPress={() => navigation.navigate('Properties')} />
        <Button title="Áreas" onPress={() => navigation.navigate('Areas')} />
        <Button title="Horarios" onPress={() => navigation.navigate('Schedules')} />
        <Button title="Deudas" onPress={() => navigation.navigate('Debts')} />
        <Button title="Reservaciones" onPress={() => navigation.navigate('Reservations')} />
        <Button title="Avisos" onPress={() => navigation.navigate('Announcements')} />
        <Button title="Códigos QR" onPress={() => navigation.navigate('QRCodes')} />
        <Button title="Reportes" onPress={() => navigation.navigate('Reports')} />
        <Button title="Pagos" onPress={() => navigation.navigate('Payments')} />
      </View>
      <Button title="Cerrar sesión" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  menu: { gap: 10, marginVertical: 20 },
});