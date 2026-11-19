import { useThemedStyles } from '../context/ThemeContext';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function UsersScreen({ navigation }) {
  const styles = useThemedStyles(baseStyles);
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [code, setCode] = useState('');
  const [guard, setGuard] = useState({ full_name: '', email: '', password: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const loadUsers = async () => { try { const response = await api.get('/users'); setUsers(response.data); } catch (error) { Alert.alert('No se pudo cargar la lista', error.response?.data?.error || 'Intenta de nuevo.'); } };
  useEffect(() => { loadUsers(); }, []);

  const linkResident = async () => {
    if (!code.trim() || saving) return;
    setSaving(true);
    try { const response = await api.post('/users/link', { code }); Alert.alert('Residente agregado', `${response.data.full_name} ya pertenece a este condominio.`); setCode(''); loadUsers(); }
    catch (error) { Alert.alert('No se pudo vincular', error.response?.data?.error || 'Revisa el código e intenta de nuevo.'); }
    finally { setSaving(false); }
  };

  const createGuard = async () => {
    if (saving) return;
    setSaving(true);
    try { await api.post('/users', { ...guard, role: 'guardia' }); Alert.alert('Cuenta de guardia creada', 'Comparte el correo y la contraseña con el guardia.'); setGuard({ full_name: '', email: '', password: '', phone: '' }); loadUsers(); }
    catch (error) { Alert.alert('No se pudo crear la cuenta', error.response?.data?.error || 'Revisa los datos.'); }
    finally { setSaving(false); }
  };

  const removeGuard = async (id) => {
    try { await api.delete(`/users/${id}`); loadUsers(); }
    catch (error) { Alert.alert('No se pudo quitar', error.response?.data?.error || 'Intenta de nuevo.'); }
  };

  return <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
    <Pressable onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹  Panel principal</Text></Pressable>
    <Text style={styles.eyebrow}>COMUNIDAD</Text><Text style={styles.header}>Residentes y equipo</Text><Text style={styles.subtitle}>Vincula residentes y administra quién tiene acceso.</Text>
    <View style={styles.card}><Text style={styles.cardTitle}>Agregar residente</Text><Text style={styles.helper}>Pídele su código de MiCon. Al vincularlo, se asigna automáticamente a la vivienda que registró.</Text><View style={styles.codeRow}><TextInput autoCapitalize="characters" autoCorrect={false} value={code} onChangeText={setCode} placeholder="Código del residente" style={[styles.input, styles.codeInput]} /><Pressable disabled={saving || !code.trim()} onPress={linkResident} style={[styles.primaryButton, (saving || !code.trim()) && styles.disabled]}><Text style={styles.primaryButtonText}>{saving ? 'Agregando…' : '＋ Agregar'}</Text></Pressable></View></View>
    <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Personas vinculadas</Text><Text style={styles.count}>{users.length}</Text></View>
    <FlatList scrollEnabled={false} data={users.filter((item) => item.role !== 'admin' && (user?.has_guards || item.role !== 'guardia'))} keyExtractor={(item) => String(item.id)} ListEmptyComponent={<Text style={styles.empty}>Aquí aparecerán quienes ya estén vinculados a tu condominio.</Text>} renderItem={({ item }) => <View style={styles.personCard}>{item.profile_photo_uri ? <Image source={{ uri: item.profile_photo_uri }} style={styles.personAvatarImage} /> : <View style={styles.personAvatar}><Text style={styles.personAvatarText}>{item.full_name?.trim()?.[0]?.toUpperCase() || 'M'}</Text></View>}<View style={styles.personInfo}><Text style={styles.personName}>{item.full_name}</Text><Text style={styles.personMeta}>{item.role === 'guardia' ? 'Guardia' : `Vivienda ${item.pending_unit_number || item.property_id || 'sin asignar'} · ${item.resident_status === 'inquilino' ? 'Inquilino' : 'Propietario'}`} · {item.email}</Text>{item.owner_name ? <Text style={styles.personMeta}>Propietario: {item.owner_name}</Text> : null}{item.emergency_phone ? <Text style={styles.personMeta}>Emergencia: {item.emergency_phone}</Text> : null}</View>{item.role === 'guardia' && <Pressable onPress={() => removeGuard(item.id)}><Text style={styles.remove}>Quitar</Text></Pressable>}</View>} />
    {user?.has_guards && <View style={styles.card}><Text style={styles.cardTitle}>Agregar guardia</Text><Text style={styles.helper}>Se creará una cuenta para que ingrese desde la app MiCon Seguridad.</Text><TextInput value={guard.full_name} onChangeText={(v) => setGuard((current) => ({ ...current, full_name: v }))} placeholder="Nombre completo" style={styles.input} /><TextInput value={guard.email} onChangeText={(v) => setGuard((current) => ({ ...current, email: v }))} placeholder="Correo electrónico" autoCapitalize="none" keyboardType="email-address" style={styles.input} /><TextInput value={guard.password} onChangeText={(v) => setGuard((current) => ({ ...current, password: v }))} placeholder="Contraseña temporal (8 caracteres mínimo)" secureTextEntry style={styles.input} /><TextInput value={guard.phone} onChangeText={(v) => setGuard((current) => ({ ...current, phone: v }))} placeholder="Teléfono (opcional)" keyboardType="phone-pad" style={styles.input} /><Pressable disabled={saving} onPress={createGuard} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>{saving ? 'Guardando…' : 'Crear cuenta de guardia'}</Text></Pressable></View>}
    <Text style={styles.footer}>Las cuentas de guardia se ocultan cuando el servicio está desactivado.</Text>
  </ScrollView>;
}

const baseStyles = StyleSheet.create({ container: { backgroundColor: '#F6F7FB', flexGrow: 1, padding: 20, paddingTop: 50 }, back: { alignSelf: 'flex-start', marginBottom: 22, paddingVertical: 8 }, backText: { color: '#5140E9', fontSize: 13, fontWeight: '800' }, eyebrow: { color: '#788196', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 }, header: { color: '#161B2B', fontSize: 27, fontWeight: '900', marginTop: 5 }, subtitle: { color: '#788196', fontSize: 13, lineHeight: 19, marginTop: 5 }, card: { backgroundColor: '#FFF', borderColor: '#E9EAF0', borderRadius: 17, borderWidth: 1, marginTop: 18, padding: 17 }, cardTitle: { color: '#161B2B', fontSize: 15, fontWeight: '800' }, helper: { color: '#788196', fontSize: 11, lineHeight: 17, marginTop: 5 }, codeRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 10 }, input: { backgroundColor: '#FFF', borderColor: '#E4E6ED', borderRadius: 11, borderWidth: 1, color: '#161B2B', fontSize: 14, marginTop: 11, padding: 13 }, codeInput: { flex: 1, marginTop: 0 }, primaryButton: { alignItems: 'center', backgroundColor: '#5140E9', borderRadius: 11, paddingHorizontal: 14, paddingVertical: 14 }, primaryButtonText: { color: '#FFF', fontSize: 12, fontWeight: '800' }, disabled: { opacity: 0.5 }, sectionRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 10, marginTop: 26 }, sectionTitle: { color: '#161B2B', fontSize: 16, fontWeight: '800' }, count: { backgroundColor: '#EEEAFE', borderRadius: 10, color: '#5140E9', fontSize: 11, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4 }, empty: { backgroundColor: '#FFF', borderRadius: 14, color: '#788196', fontSize: 12, lineHeight: 18, padding: 16 }, personCard: { alignItems: 'center', backgroundColor: '#FFF', borderColor: '#E9EAF0', borderRadius: 14, borderWidth: 1, flexDirection: 'row', marginBottom: 8, padding: 13 }, personAvatar: { alignItems: 'center', backgroundColor: '#EEEAFE', borderRadius: 17, height: 34, justifyContent: 'center', width: 34 }, personAvatarImage: { borderRadius: 17, height: 34, width: 34 }, personAvatarText: { color: '#5140E9', fontSize: 14, fontWeight: '800' }, personInfo: { flex: 1, marginLeft: 10 }, personName: { color: '#24283A', fontSize: 12, fontWeight: '800' }, personMeta: { color: '#788196', fontSize: 9, marginTop: 4 }, remove: { color: '#A04A4A', fontSize: 10, fontWeight: '700', padding: 5 }, secondaryButton: { alignItems: 'center', backgroundColor: '#26213F', borderRadius: 11, marginTop: 15, padding: 14 }, secondaryButtonText: { color: '#FFF', fontSize: 12, fontWeight: '800' }, footer: { color: '#788196', fontSize: 10, lineHeight: 16, marginVertical: 15, textAlign: 'center' } });
