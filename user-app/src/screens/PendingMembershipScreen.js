import { useThemedStyles } from '../context/ThemeContext';
import React, { useContext, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function PendingMembershipScreen() {
  const styles = useThemedStyles(baseStyles);
  const { user, refreshUser, logout } = useContext(AuthContext);
  const [checking, setChecking] = useState(false);
  const checkStatus = async () => {
    setChecking(true);
    try {
      const updated = await refreshUser();
      if (!updated?.condo_id) Alert.alert('Aún pendiente', 'Pídele a la administración que agregue tu código.');
    } catch { Alert.alert('Sin conexión', 'No pudimos consultar tu estado. Intenta de nuevo.'); }
    finally { setChecking(false); }
  };
  return <View style={styles.screen}><Text style={styles.brand}>MiCon</Text><View style={styles.card}><View style={styles.icon}><Text style={styles.iconText}>⌂</Text></View><Text style={styles.title}>Tu cuenta está lista</Text><Text style={styles.subtitle}>Comparte este código con la administración para vincularte con tu vivienda.</Text><View style={styles.codeBox}><Text style={styles.codeLabel}>TU CÓDIGO DE RESIDENTE</Text><Text selectable style={styles.code}>{user?.membership_code || '—'}</Text></View><Text style={styles.hint}>La administración lo ingresa desde “Residentes”. Cuando te vinculen, tus opciones se activarán aquí.</Text><Pressable disabled={checking} onPress={checkStatus} style={[styles.button, checking && styles.disabled]}><Text style={styles.buttonText}>{checking ? 'Consultando…' : 'Ya me agregaron'}</Text></Pressable><Pressable onPress={logout} style={styles.logout}><Text style={styles.logoutText}>Cerrar sesión</Text></Pressable></View></View>;
}

const baseStyles = StyleSheet.create({ screen: { alignItems: 'center', backgroundColor: '#F6F7FB', flex: 1, justifyContent: 'center', padding: 22 }, brand: { alignSelf: 'flex-start', color: '#26213F', fontSize: 25, fontWeight: '900', marginBottom: 20 }, card: { alignItems: 'center', backgroundColor: '#FFF', borderColor: '#E9EAF0', borderRadius: 22, borderWidth: 1, padding: 22, width: '100%' }, icon: { alignItems: 'center', backgroundColor: '#EEEAFE', borderRadius: 26, height: 52, justifyContent: 'center', width: 52 }, iconText: { color: '#5140E9', fontSize: 28 }, title: { color: '#161B2B', fontSize: 22, fontWeight: '800', marginTop: 15 }, subtitle: { color: '#788196', fontSize: 12, lineHeight: 18, marginTop: 7, textAlign: 'center' }, codeBox: { alignItems: 'center', backgroundColor: '#F8F7FF', borderColor: '#DDD8FF', borderRadius: 15, borderWidth: 1, marginTop: 21, padding: 18, width: '100%' }, codeLabel: { color: '#788196', fontSize: 9, fontWeight: '800', letterSpacing: 1 }, code: { color: '#342A9C', fontSize: 27, fontWeight: '900', letterSpacing: 3, marginTop: 8 }, hint: { color: '#788196', fontSize: 11, lineHeight: 17, marginTop: 14, textAlign: 'center' }, button: { alignItems: 'center', backgroundColor: '#5140E9', borderRadius: 11, marginTop: 22, padding: 14, width: '100%' }, disabled: { opacity: 0.6 }, buttonText: { color: '#FFF', fontSize: 12, fontWeight: '800' }, logout: { marginTop: 15, padding: 8 }, logoutText: { color: '#788196', fontSize: 11, fontWeight: '700' } });
