import { useThemedStyles } from '../context/ThemeContext';
import React, { useContext, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const styles = useThemedStyles(baseStyles);
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', condominium_name: '' });
  const [saving, setSaving] = useState(false);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const register = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const response = await api.post('/auth/register-admin', form);
      await login(response.data.token, response.data.user);
    } catch (error) {
      Alert.alert('No se pudo crear la cuenta', error.response?.data?.error || 'Revisa tu conexión e intenta de nuevo.');
    } finally { setSaving(false); }
  };

  return <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
    <View style={styles.brand}><Text style={styles.brandName}>MiCon</Text><Text style={styles.eyebrow}>ADMINISTRACIÓN CLARA, DESDE EL INICIO</Text></View>
    <View style={styles.card}>
      <Text style={styles.title}>Crea tu espacio</Text><Text style={styles.subtitle}>Al registrarte se creará un condominio privado para ti.</Text>
      <Text style={styles.label}>Tu nombre</Text><TextInput value={form.full_name} onChangeText={(v) => set('full_name', v)} placeholder="Nombre y apellido" style={styles.input} autoComplete="name" />
      <Text style={styles.label}>Nombre del condominio</Text><TextInput value={form.condominium_name} onChangeText={(v) => set('condominium_name', v)} placeholder="Ej. Residencial Las Palmas" style={styles.input} />
      <Text style={styles.label}>Correo electrónico</Text><TextInput value={form.email} onChangeText={(v) => set('email', v)} placeholder="tu@correo.com" style={styles.input} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <Text style={styles.label}>Contraseña</Text><TextInput value={form.password} onChangeText={(v) => set('password', v)} placeholder="Al menos 8 caracteres" style={styles.input} secureTextEntry autoComplete="new-password" />
      <Pressable accessibilityRole="button" disabled={saving} onPress={register} style={[styles.button, saving && styles.disabled]}><Text style={styles.buttonText}>{saving ? 'Creando cuenta…' : 'Crear cuenta y condominio'}</Text></Pressable>
      <View style={styles.footer}><Text style={styles.footerText}>¿Ya tienes una cuenta?</Text><Pressable onPress={() => navigation.navigate('Login')}><Text style={styles.link}> Inicia sesión</Text></Pressable></View>
    </View>
  </ScrollView>;
}

const baseStyles = StyleSheet.create({ screen: { backgroundColor: '#F6F7FB', flexGrow: 1, justifyContent: 'center', padding: 22 }, brand: { marginBottom: 20 }, brandName: { color: '#26213F', fontSize: 29, fontWeight: '900' }, eyebrow: { color: '#788196', fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginTop: 5 }, card: { backgroundColor: '#FFF', borderColor: '#E9EAF0', borderRadius: 22, borderWidth: 1, padding: 22 }, title: { color: '#161B2B', fontSize: 24, fontWeight: '800' }, subtitle: { color: '#788196', fontSize: 13, lineHeight: 19, marginTop: 6 }, label: { color: '#3E4556', fontSize: 12, fontWeight: '700', marginTop: 19 }, input: { backgroundColor: '#FFF', borderColor: '#E4E6ED', borderRadius: 12, borderWidth: 1, color: '#161B2B', fontSize: 15, marginTop: 7, padding: 14 }, button: { alignItems: 'center', backgroundColor: '#5140E9', borderRadius: 12, marginTop: 24, padding: 16 }, disabled: { opacity: 0.6 }, buttonText: { color: '#FFF', fontSize: 14, fontWeight: '800' }, footer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 19 }, footerText: { color: '#788196', fontSize: 12 }, link: { color: '#5140E9', fontSize: 12, fontWeight: '800' } });
