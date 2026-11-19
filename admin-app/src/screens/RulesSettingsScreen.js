import { useThemedStyles } from '../context/ThemeContext';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import api from '../api';

export default function RulesSettingsScreen({ navigation }) {
  const styles = useThemedStyles(baseStyles);
  const [rules, setRules] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { api.get('/condominiums/me').then(({ data }) => setRules(data.rules || '')).catch(() => Alert.alert('No se pudo cargar', 'Intenta volver a abrir esta sección.')); }, []);
  const save = async () => {
    if (!rules.trim()) return Alert.alert('Agrega el reglamento', 'Escribe las reglas principales antes de guardar.');
    setSaving(true);
    try { await api.patch('/condominiums/setup', { step: 3, rules }); Alert.alert('Reglamento actualizado'); navigation.goBack(); }
    catch (error) { Alert.alert('No se pudo guardar', error.response?.data?.error || 'Intenta de nuevo.'); }
    finally { setSaving(false); }
  };
  return <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled"><Pressable onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹  Configuración</Text></Pressable><Text style={styles.eyebrow}>COMUNIDAD</Text><Text style={styles.title}>Reglamento</Text><Text style={styles.subtitle}>Los residentes podrán consultar este texto desde su app.</Text><View style={styles.card}><Text style={styles.label}>Reglas principales</Text><TextInput value={rules} onChangeText={setRules} multiline textAlignVertical="top" placeholder="Escribe los acuerdos y horarios de la comunidad…" style={styles.input} /><Pressable disabled={saving} onPress={save} style={[styles.button, saving && styles.disabled]}><Text style={styles.buttonText}>{saving ? 'Guardando…' : 'Guardar reglamento'}</Text></Pressable></View></ScrollView>;
}

const baseStyles = StyleSheet.create({ screen: { backgroundColor: '#F6F7FB', flexGrow: 1, padding: 20, paddingTop: 50 }, back: { alignSelf: 'flex-start', marginBottom: 22, paddingVertical: 8 }, backText: { color: '#5140E9', fontSize: 13, fontWeight: '800' }, eyebrow: { color: '#788196', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 }, title: { color: '#161B2B', fontSize: 27, fontWeight: '900', marginTop: 5 }, subtitle: { color: '#788196', fontSize: 13, lineHeight: 19, marginTop: 5 }, card: { backgroundColor: '#FFF', borderColor: '#E9EAF0', borderRadius: 17, borderWidth: 1, marginTop: 18, padding: 17 }, label: { color: '#3E4556', fontSize: 12, fontWeight: '800' }, input: { borderColor: '#E4E6ED', borderRadius: 11, borderWidth: 1, color: '#161B2B', fontSize: 14, lineHeight: 21, marginTop: 9, minHeight: 240, padding: 14 }, button: { alignItems: 'center', backgroundColor: '#5140E9', borderRadius: 11, marginTop: 17, padding: 15 }, disabled: { opacity: 0.6 }, buttonText: { color: '#FFF', fontSize: 12, fontWeight: '800' } });
