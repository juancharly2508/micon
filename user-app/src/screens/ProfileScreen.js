import { useThemedStyles } from '../context/ThemeContext';
import React, { useContext, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { AppScreen, colors, PageTitle, shared } from '../ui';
import { ThemeToggle } from '../context/ThemeContext';

export default function ProfileScreen({ navigation }) {
  const styles = useThemedStyles(baseStyles);
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(user || {});
  useEffect(() => { api.get('/auth/me').then((response) => setProfile(response.data)).catch(() => {}); }, []);
  const fields = [
    ['Correo electrónico', profile.email],
    ['Vivienda', profile.property_id ? `Casa ${profile.property_id}` : profile.pending_unit_number],
    ['Estatus', profile.resident_status === 'inquilino' ? 'Inquilino' : profile.resident_status === 'propietario' ? 'Propietario' : null],
    ...(profile.resident_status === 'inquilino' ? [['Propietario de la vivienda', profile.owner_name]] : []),
    ['Contacto de emergencia', profile.emergency_phone],
  ].filter(([, value]) => value);
  return <AppScreen navigation={navigation} active="Profile"><ScrollView contentContainerStyle={styles.container}>
    <PageTitle title="Mi perfil" subtitle="Tus datos para la comunidad" />
    <ThemeToggle />
    <View style={styles.profileCard}>
      {profile.profile_photo_uri ? <Image source={{ uri: profile.profile_photo_uri }} style={styles.avatar} /> : <View style={styles.avatarFallback}><Text style={styles.initial}>{profile.full_name?.charAt(0)?.toUpperCase() || 'R'}</Text></View>}
      <Text style={styles.name}>{profile.full_name || 'Residente'}</Text><Text style={styles.role}>Residente MiCon</Text>
    </View>
    <View style={styles.details}>{fields.map(([label, value]) => <View key={label} style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>)}</View>
    <Pressable onPress={() => navigation.navigate('Rules')} style={styles.link}><Text style={styles.linkText}>Consultar reglamento</Text><Text style={styles.arrow}>›</Text></Pressable>
    <Pressable onPress={logout} style={styles.logout}><Text style={styles.logoutText}>Cerrar sesión</Text></Pressable>
  </ScrollView></AppScreen>;
}

const baseStyles = StyleSheet.create({ container: { padding: 20, paddingTop: 18 }, profileCard: { ...shared.card, alignItems: 'center', marginBottom: 14, paddingVertical: 24 }, avatar: { borderRadius: 38, height: 76, width: 76 }, avatarFallback: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 38, height: 76, justifyContent: 'center', width: 76 }, initial: { color: colors.primary, fontSize: 28, fontWeight: '800' }, name: { color: colors.ink, fontSize: 18, fontWeight: '800', marginTop: 12 }, role: { color: colors.muted, fontSize: 12, marginTop: 4 }, details: { ...shared.card, paddingHorizontal: 16 }, row: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: 13 }, label: { color: colors.muted, fontSize: 11 }, value: { color: colors.ink, fontSize: 14, fontWeight: '600', marginTop: 4 }, link: { ...shared.card, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }, linkText: { color: colors.ink, fontSize: 13, fontWeight: '700' }, arrow: { color: colors.primary, fontSize: 23 }, logout: { alignItems: 'center', borderColor: colors.border, borderRadius: 12, borderWidth: 1, marginTop: 14, padding: 14 }, logoutText: { color: '#C43E52', fontSize: 13, fontWeight: '700' } });
