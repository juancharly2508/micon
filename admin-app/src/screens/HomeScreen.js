import { useThemedStyles } from '../context/ThemeContext';
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import Constants from 'expo-constants';

export default function HomeScreen({ navigation }) {
  const styles = useThemedStyles(baseStyles);
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({
    users: 0,
    properties: 0,
    pendingDebts: 0,
    activeReservations: 0,
  });
  const [loading, setLoading] = useState(true);

  const firstName = user?.full_name?.split(' ')[0] || 'Administrador';

  const loadStats = async () => {
    try {
      const [usersRes, propertiesRes, debtsRes, reservationsRes] =
        await Promise.all([
          api.get('/users'),
          api.get('/properties'),
          api.get('/debts?status=pending'),
          api.get('/reservations?status=confirmada'),
        ]);

      setStats({
        users: usersRes.data.length,
        properties: propertiesRes.data.length,
        pendingDebts: debtsRes.data.length,
        activeReservations: reservationsRes.data.length,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Obtener las URLs desde las variables de entorno (con fallback)
  const GUARD_APP_URL =
    Constants.expoConfig?.extra?.guardAppUrl ||
    process.env.EXPO_PUBLIC_GUARD_APP_URL ||
    'guardapp://';
  const USER_APP_URL =
    Constants.expoConfig?.extra?.userAppUrl ||
    process.env.EXPO_PUBLIC_USER_APP_URL ||
    'userapp://';

  const openApp = async (url, appName) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'App no instalada',
          `La aplicación de ${appName} no está instalada en este dispositivo.`,
          [
            { text: 'OK' },
            {
              text: 'Buscar en Play Store',
              onPress: () =>
                Linking.openURL(
                  'https://play.google.com/store/search?q=micon&c=apps'
                ),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', `No se pudo abrir ${appName}.`);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {firstName} 👋</Text>
            <Text style={styles.role}>Administrador · MiCon</Text>
          </View>
          <Pressable onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Salir</Text>
          </Pressable>
        </View>

        {/* Tarjetas de estadísticas */}
        <Text style={styles.section}>Resumen del complejo</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.users}</Text>
            <Text style={styles.statLabel}>Usuarios</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.properties}</Text>
            <Text style={styles.statLabel}>Propiedades</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pendingDebts}</Text>
            <Text style={styles.statLabel}>Deudas pendientes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activeReservations}</Text>
            <Text style={styles.statLabel}>Reservas activas</Text>
          </View>
        </View>

        {/* Acceso rápido a otras apps */}
        <Text style={styles.section}>Otras aplicaciones</Text>
        <View style={styles.otherApps}>
          <Pressable
            onPress={() => openApp(GUARD_APP_URL, 'Guardia')}
            style={[styles.appButton, styles.guardApp]}
          >
            <Text style={styles.appButtonIcon}>🛡️</Text>
            <Text style={styles.appButtonText}>App de Guardia</Text>
            <Text style={styles.appButtonSub}>Control de acceso y vigilancia</Text>
          </Pressable>
          <Pressable
            onPress={() => openApp(USER_APP_URL, 'Residentes')}
            style={[styles.appButton, styles.userApp]}
          >
            <Text style={styles.appButtonIcon}>🏠</Text>
            <Text style={styles.appButtonText}>App de Residentes</Text>
            <Text style={styles.appButtonSub}>Pagos, reservas y reportes</Text>
          </Pressable>
        </View>

        {/* Acciones principales */}
        <Text style={styles.section}>Panel de administración</Text>
        <View style={styles.grid}>
          <Pressable
            onPress={() => navigation.navigate('Users')}
            style={[styles.action, { backgroundColor: '#EEEAFE' }]}
          >
            <Text style={styles.icon}>👥</Text>
            <Text style={styles.actionTitle}>Usuarios</Text>
            <Text style={styles.actionSub}>Gestionar residentes</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Properties')}
            style={[styles.action, { backgroundColor: '#E6F5FF' }]}
          >
            <Text style={styles.icon}>🏢</Text>
            <Text style={styles.actionTitle}>Unidades</Text>
            <Text style={styles.actionSub}>Propiedades</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Debts')}
            style={[styles.action, { backgroundColor: '#FFECEC' }]}
          >
            <Text style={styles.icon}>💰</Text>
            <Text style={styles.actionTitle}>Por cobrar</Text>
            <Text style={styles.actionSub}>Consultar deudas</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Reservations')}
            style={[styles.action, { backgroundColor: '#E3F9ED' }]}
          >
            <Text style={styles.icon}>📅</Text>
            <Text style={styles.actionTitle}>Reservas</Text>
            <Text style={styles.actionSub}>Áreas comunes</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Reports')}
            style={[styles.action, { backgroundColor: '#FFF3D9' }]}
          >
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.actionTitle}>Reportes</Text>
            <Text style={styles.actionSub}>Atender incidencias</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Announcements')}
            style={[styles.action, { backgroundColor: '#EEEAFE' }]}
          >
            <Text style={styles.icon}>📢</Text>
            <Text style={styles.actionTitle}>Nuevo aviso</Text>
            <Text style={styles.actionSub}>Crear para todos</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// Estilos (sin cambios, igual que antes)
const baseStyles = StyleSheet.create({
  screen: { backgroundColor: '#F6F7FB', flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  greeting: { color: '#161B2B', fontSize: 20, fontWeight: '800' },
  role: { color: '#788196', fontSize: 12, marginTop: 3 },
  logoutButton: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E4E6ED',
  },
  logoutText: { color: '#5140E9', fontWeight: '600', fontSize: 13 },
  section: {
    color: '#161B2B',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#161B2B' },
  statLabel: { fontSize: 12, color: '#788196', marginTop: 4 },
  otherApps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appButton: {
    borderRadius: 16,
    padding: 16,
    width: '48%',
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guardApp: { backgroundColor: '#1A2C3E' },
  userApp: { backgroundColor: '#2C5F2D' },
  appButtonIcon: { fontSize: 28, color: '#FFF' },
  appButtonText: { color: '#FFF', fontSize: 14, fontWeight: '800', marginTop: 6 },
  appButtonSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  action: {
    borderRadius: 15,
    minHeight: 118,
    padding: 14,
    width: '48%',
    marginBottom: 10,
  },
  icon: { color: '#5140E9', fontSize: 21 },
  actionTitle: { color: '#161B2B', fontSize: 13, fontWeight: '800', marginTop: 15 },
  actionSub: { color: '#788196', fontSize: 10, marginTop: 4 },
});