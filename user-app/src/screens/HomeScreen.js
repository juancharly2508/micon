import { useThemedStyles } from '../context/ThemeContext';
import React, { useContext } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { AppScreen, colors, shared } from '../ui';
import { useTheme } from '../context/ThemeContext';

const quickAccess = [['Announcements', '♧', 'Avisos', 'Mantente al día', '#EEEAFE'], ['Debts', '▤', 'Mis deudas', 'Ver pagos', '#FFECEC'], ['Reservations', '▣', 'Reservas', 'Áreas comunes', '#E6F5FF'], ['Rules', '☰', 'Reglamento', 'Acuerdos comunes', '#FFF3D9'], ['QRGenerate', '▦', 'Invitar visitante', 'Generar código QR', '#E3F9ED'], ['Reports', '⚑', 'Reportes', 'Crear reporte', '#FFF3D9']];

export default function HomeScreen({ navigation }) {
  const styles = useThemedStyles(baseStyles);
  const { mode, colors: palette } = useTheme();
  const { user, logout } = useContext(AuthContext);
  const visibleQuickAccess = user?.has_guards ? quickAccess : quickAccess.filter(([route]) => route !== 'QRGenerate');
  const name = user?.full_name?.split(' ')[0] || 'Vecino';
  return <AppScreen navigation={navigation} active="Home"><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><View><Text style={styles.greeting}>Hola, {name} 👋</Text><Text style={styles.role}>Unidad {user?.property_id || 'sin asignar'} · Residente</Text></View><Pressable onPress={logout} style={styles.bell}><Text>♧</Text></Pressable></View>
    <Pressable onPress={() => navigation.navigate('Debts')} style={styles.statusCard}><Text style={styles.statusTitle}>Estado de tu residencia</Text><Text style={styles.statusText}>Consulta pendientes, pagos y próximas reservaciones.</Text><Text style={styles.statusArrow}>›</Text></Pressable>
    <Text style={shared.section}>Acceso rápido</Text><View style={styles.grid}>{visibleQuickAccess.map(([route, icon, title, subtitle, tint]) => <Pressable key={route} onPress={() => navigation.navigate(route)} style={[styles.quickCard, { backgroundColor: mode === 'dark' ? palette.surfaceAlt : tint }]}><Text style={styles.quickIcon}>{icon}</Text><Text style={styles.quickTitle}>{title}</Text><Text style={styles.quickSubtitle}>{subtitle}</Text></Pressable>)}</View>
  </ScrollView></AppScreen>;
}

const baseStyles = StyleSheet.create({ container: { padding: 20 }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18, marginTop: 16 }, greeting: { color: colors.ink, fontSize: 20, fontWeight: '800' }, role: { color: colors.muted, fontSize: 12, marginTop: 3 }, bell: { alignItems: 'center', backgroundColor: colors.card, borderRadius: 18, height: 40, justifyContent: 'center', width: 40 }, statusCard: { backgroundColor: colors.primary, borderRadius: 16, minHeight: 96, padding: 17 }, statusTitle: { color: '#FFF', fontSize: 15, fontWeight: '800' }, statusText: { color: '#E7E4FF', fontSize: 12, marginTop: 6, paddingRight: 20 }, statusArrow: { color: '#FFF', fontSize: 30, position: 'absolute', right: 16, top: 31 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, quickCard: { borderRadius: 15, minHeight: 112, padding: 13, width: '31.5%' }, quickIcon: { color: colors.primary, fontSize: 20 }, quickTitle: { color: colors.ink, fontSize: 12, fontWeight: '800', marginTop: 11 }, quickSubtitle: { color: colors.muted, fontSize: 9, marginTop: 4 } });
