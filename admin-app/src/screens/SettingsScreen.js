import { useThemedStyles } from '../context/ThemeContext';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { ThemeToggle } from '../context/ThemeContext';

export default function SettingsScreen({ navigation }) {
  const styles = useThemedStyles(baseStyles);
  const { user, refreshUser, logout } = useContext(AuthContext);
  const [hasGuards, setHasGuards] = useState(Boolean(user?.has_guards));
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get('/condominiums/me').then(({ data }) => setHasGuards(Boolean(data.has_guards))).catch(() => {}); }, []);

  const changeGuardService = async (value) => {
    setSaving(true);
    try {
      await api.patch('/condominiums/guards', { has_guards: value });
      setHasGuards(value);
      await refreshUser();
    } catch (error) {
      Alert.alert('No se pudo actualizar', error.response?.data?.error || 'Intenta de nuevo.');
    } finally { setSaving(false); }
  };

  return <ScrollView contentContainerStyle={styles.screen}>
    <Pressable onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹  Regresar</Text></Pressable>
    <Text style={styles.eyebrow}>TU COMUNIDAD</Text><Text style={styles.title}>Configuración</Text><Text style={styles.subtitle}>{user?.condominium_name || 'Condominio'}</Text>
    <ThemeToggle />
    <View style={styles.card}><View style={styles.row}><View style={styles.copy}><Text style={styles.cardTitle}>Servicio de guardia</Text><Text style={styles.cardText}>{hasGuards ? 'Las funciones de seguridad están activas y los guardias pueden iniciar sesión.' : 'Las funciones de seguridad permanecen ocultas para esta comunidad.'}</Text></View><Switch accessibilityLabel="Servicio de guardia" disabled={saving} value={hasGuards} onValueChange={changeGuardService} trackColor={{ false: '#D9DCE5', true: '#BDB5FF' }} thumbColor={hasGuards ? '#5140E9' : '#F4F4F5'} /></View></View>
    <View style={styles.note}><Text style={styles.noteTitle}>Cambios en tiempo real</Text><Text style={styles.noteText}>Al desactivar el servicio, los guardias dejan de poder entrar a su app y las opciones de seguridad se ocultan.</Text></View>
    <Pressable onPress={() => navigation.navigate('RulesSettings')} style={styles.rulesButton}><Text style={styles.rulesButtonTitle}>Editar el reglamento</Text><Text style={styles.rulesButtonText}>Actualiza las reglas que pueden consultar los residentes.</Text></Pressable>
    <Pressable onPress={logout} style={styles.logout}><Text style={styles.logoutText}>Cerrar sesión</Text></Pressable>
  </ScrollView>;
}

const baseStyles = StyleSheet.create({ screen: { backgroundColor: '#F6F7FB', flexGrow: 1, padding: 20, paddingTop: 52 }, back: { alignSelf: 'flex-start', marginBottom: 24, paddingVertical: 8 }, backText: { color: '#5140E9', fontSize: 13, fontWeight: '800' }, eyebrow: { color: '#788196', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 6 }, title: { color: '#161B2B', fontSize: 28, fontWeight: '900' }, subtitle: { color: '#788196', fontSize: 14, marginTop: 5 }, card: { backgroundColor: '#FFF', borderColor: '#E9EAF0', borderRadius: 18, borderWidth: 1, marginTop: 24, padding: 18 }, row: { alignItems: 'center', flexDirection: 'row', gap: 10 }, copy: { flex: 1 }, cardTitle: { color: '#161B2B', fontSize: 15, fontWeight: '800' }, cardText: { color: '#788196', fontSize: 12, lineHeight: 18, marginTop: 6 }, note: { backgroundColor: '#EEEAFE', borderRadius: 14, marginTop: 14, padding: 16 }, noteTitle: { color: '#342A9C', fontSize: 12, fontWeight: '800' }, noteText: { color: '#5140A3', fontSize: 11, lineHeight: 17, marginTop: 5 }, rulesButton: { backgroundColor: '#FFF', borderColor: '#E9EAF0', borderRadius: 14, borderWidth: 1, marginTop: 14, padding: 16 }, rulesButtonTitle: { color: '#161B2B', fontSize: 13, fontWeight: '800' }, rulesButtonText: { color: '#788196', fontSize: 11, lineHeight: 17, marginTop: 4 }, logout: { alignItems: 'center', borderColor: '#E3D4D4', borderRadius: 12, borderWidth: 1, marginTop: 28, padding: 14 }, logoutText: { color: '#9B4242', fontSize: 13, fontWeight: '800' } });
