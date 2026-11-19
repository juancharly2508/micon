import { useThemedStyles } from '../context/ThemeContext';
import React, { useContext, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const styles = useThemedStyles(baseStyles);
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', pending_unit_number: '', resident_status: '', owner_name: '', emergency_phone: '' });
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permiso necesario', 'Permite el acceso a tus fotos para elegir una imagen de identificación.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.4, base64: true });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPhoto({ uri: asset.uri, data: `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` });
    }
  };

  const register = async () => {
    if (saving) return;
    if (!form.resident_status) return Alert.alert('Elige tu estatus', 'Indica si eres propietario o inquilino.');
    if (!photo?.data) return Alert.alert('Agrega una foto', 'La foto ayuda a identificarte al ingresar al condominio.');
    setSaving(true);
    try {
      const response = await api.post('/auth/register', { ...form, profile_photo_uri: photo.data });
      await login(response.data.token, response.data.user);
    } catch (error) {
      Alert.alert('No se pudo crear la cuenta', error.response?.data?.error || 'Revisa tu conexión e intenta de nuevo.');
    } finally { setSaving(false); }
  };

  return <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
    <Pressable onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹  Volver</Text></Pressable>
    <Text style={styles.brand}>MiCon</Text><Text style={styles.eyebrow}>CUENTA DE RESIDENTE</Text>
    <View style={styles.card}><Text style={styles.title}>Crea tu perfil</Text><Text style={styles.subtitle}>La administración te vinculará al condominio con el código que recibirás al terminar.</Text>
      <Text style={styles.label}>Nombre completo</Text><TextInput value={form.full_name} onChangeText={(v) => set('full_name', v)} placeholder="Como aparece en tu identificación" style={styles.input} autoComplete="name" />
      <Text style={styles.label}>Correo electrónico</Text><TextInput value={form.email} onChangeText={(v) => set('email', v)} placeholder="tu@correo.com" style={styles.input} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <Text style={styles.label}>Contraseña</Text><TextInput value={form.password} onChangeText={(v) => set('password', v)} placeholder="Al menos 8 caracteres" style={styles.input} secureTextEntry autoComplete="new-password" />
      <Text style={styles.label}>Vivienda</Text><TextInput value={form.pending_unit_number} onChangeText={(v) => set('pending_unit_number', v)} placeholder="Ej. Casa 12" style={styles.input} autoCapitalize="words" /><Text style={styles.hint}>Escribe el nombre de tu casa tal como lo maneja la administración.</Text>
      <Text style={styles.label}>¿Cuál es tu estatus?</Text><View style={styles.choiceRow}><Pressable accessibilityRole="radio" accessibilityState={{ selected: form.resident_status === 'propietario' }} onPress={() => set('resident_status', 'propietario')} style={[styles.choice, form.resident_status === 'propietario' && styles.choiceSelected]}><Text style={[styles.choiceText, form.resident_status === 'propietario' && styles.choiceTextSelected]}>Soy propietario</Text></Pressable><Pressable accessibilityRole="radio" accessibilityState={{ selected: form.resident_status === 'inquilino' }} onPress={() => set('resident_status', 'inquilino')} style={[styles.choice, form.resident_status === 'inquilino' && styles.choiceSelected]}><Text style={[styles.choiceText, form.resident_status === 'inquilino' && styles.choiceTextSelected]}>Soy inquilino</Text></Pressable></View>
      {form.resident_status === 'inquilino' && <><Text style={styles.label}>Nombre del propietario</Text><TextInput value={form.owner_name} onChangeText={(v) => set('owner_name', v)} placeholder="Nombre completo" style={styles.input} /></>}
      <Text style={styles.label}>Contacto de emergencia</Text><TextInput value={form.emergency_phone} onChangeText={(v) => set('emergency_phone', v)} placeholder="Teléfono de un contacto" style={styles.input} keyboardType="phone-pad" />
      <Text style={styles.label}>Foto de perfil</Text><Pressable accessibilityRole="button" onPress={choosePhoto} style={styles.photoPicker}>{photo ? <Image source={{ uri: photo.uri }} style={styles.photo} /> : <View style={styles.photoPlaceholder}><Text style={styles.photoIcon}>＋</Text><Text style={styles.photoText}>Elegir foto</Text></View>}<Text style={styles.photoHint}>Puedes seleccionar una imagen de tu teléfono.</Text></Pressable>
      <Pressable disabled={saving} onPress={register} style={[styles.button, saving && styles.disabled]}><Text style={styles.buttonText}>{saving ? 'Creando cuenta…' : 'Crear mi cuenta'}</Text></Pressable>
      <View style={styles.footer}><Text style={styles.footerText}>¿Ya tienes cuenta?</Text><Pressable onPress={() => navigation.navigate('Login')}><Text style={styles.link}> Iniciar sesión</Text></Pressable></View>
    </View>
  </ScrollView>;
}

const baseStyles = StyleSheet.create({ screen: { backgroundColor: '#F6F7FB', flexGrow: 1, padding: 20, paddingTop: 50 }, back: { alignSelf: 'flex-start', marginBottom: 19, paddingVertical: 7 }, backText: { color: '#5140E9', fontSize: 13, fontWeight: '800' }, brand: { color: '#26213F', fontSize: 27, fontWeight: '900' }, eyebrow: { color: '#788196', fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginTop: 3 }, card: { backgroundColor: '#FFF', borderColor: '#E9EAF0', borderRadius: 20, borderWidth: 1, marginTop: 18, padding: 19 }, title: { color: '#161B2B', fontSize: 23, fontWeight: '800' }, subtitle: { color: '#788196', fontSize: 12, lineHeight: 19, marginTop: 6 }, label: { color: '#3E4556', fontSize: 12, fontWeight: '700', marginTop: 18 }, input: { backgroundColor: '#FFF', borderColor: '#E4E6ED', borderRadius: 11, borderWidth: 1, color: '#161B2B', fontSize: 14, marginTop: 7, padding: 13 }, hint: { color: '#788196', fontSize: 10, lineHeight: 15, marginTop: 5 }, choiceRow: { flexDirection: 'row', gap: 9, marginTop: 8 }, choice: { alignItems: 'center', borderColor: '#E4E6ED', borderRadius: 11, borderWidth: 1, flex: 1, padding: 13 }, choiceSelected: { backgroundColor: '#F2F1FF', borderColor: '#5140E9' }, choiceText: { color: '#596074', fontSize: 11, fontWeight: '700' }, choiceTextSelected: { color: '#5140E9' }, photoPicker: { alignItems: 'center', backgroundColor: '#FAFAFC', borderColor: '#E4E6ED', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 12, marginTop: 8, padding: 10 }, photoPlaceholder: { alignItems: 'center', backgroundColor: '#EEEAFE', borderRadius: 30, height: 60, justifyContent: 'center', width: 60 }, photo: { borderRadius: 30, height: 60, width: 60 }, photoIcon: { color: '#5140E9', fontSize: 22 }, photoText: { color: '#5140E9', fontSize: 8, fontWeight: '700' }, photoHint: { color: '#788196', flex: 1, fontSize: 10, lineHeight: 15 }, button: { alignItems: 'center', backgroundColor: '#5140E9', borderRadius: 11, marginTop: 23, padding: 15 }, disabled: { opacity: 0.6 }, buttonText: { color: '#FFF', fontSize: 13, fontWeight: '800' }, footer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 18 }, footerText: { color: '#788196', fontSize: 11 }, link: { color: '#5140E9', fontSize: 11, fontWeight: '800' } });
