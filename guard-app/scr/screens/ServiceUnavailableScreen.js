import { useThemedStyles } from '../context/ThemeContext';
import React, { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function ServiceUnavailableScreen() {
  const styles = useThemedStyles(baseStyles);
  const { logout } = useContext(AuthContext);
  return <View style={styles.screen}><Text style={styles.brand}>MiCon Seguridad</Text><View style={styles.card}><Text style={styles.icon}>◇</Text><Text style={styles.title}>Servicio desactivado</Text><Text style={styles.body}>La administración deshabilitó temporalmente el acceso de guardias para este condominio. Comunícate con el administrador si necesitas ayuda.</Text><Pressable onPress={logout} style={styles.button}><Text style={styles.buttonText}>Cerrar sesión</Text></Pressable></View></View>;
}

const baseStyles = StyleSheet.create({ screen: { backgroundColor: '#F6F7FB', flex: 1, justifyContent: 'center', padding: 22 }, brand: { color: '#26213F', fontSize: 24, fontWeight: '900', marginBottom: 18 }, card: { alignItems: 'center', backgroundColor: '#FFF', borderColor: '#E9EAF0', borderRadius: 20, borderWidth: 1, padding: 22 }, icon: { alignItems: 'center', backgroundColor: '#EEEAFE', borderRadius: 25, color: '#5140E9', fontSize: 26, overflow: 'hidden', paddingHorizontal: 13, paddingVertical: 8 }, title: { color: '#161B2B', fontSize: 20, fontWeight: '800', marginTop: 15 }, body: { color: '#788196', fontSize: 12, lineHeight: 19, marginTop: 7, textAlign: 'center' }, button: { alignItems: 'center', backgroundColor: '#26213F', borderRadius: 11, marginTop: 22, padding: 14, width: '100%' }, buttonText: { color: '#FFF', fontSize: 12, fontWeight: '800' } });
