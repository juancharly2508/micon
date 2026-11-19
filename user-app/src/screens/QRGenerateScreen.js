import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import api from '../api';
import { useThemedStyles } from '../context/ThemeContext';
import { AppScreen } from '../ui';

export default function QRGenerateScreen({ navigation }) {
  const styles = useThemedStyles(baseStyles);
  const [visitorName, setVisitorName] = useState('');
  const [validTo, setValidTo] = useState(() => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [maxEntries, setMaxEntries] = useState('1');
  const [qr, setQr] = useState(null);

  const generateQR = async () => {
    try {
      const res = await api.post('/qr/generate', {
        visitor_name: visitorName,
        valid_to: validTo,
        max_entries: parseInt(maxEntries),
      });
      setQr(res.data.qr);
      Alert.alert('QR generado', res.data.message);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Error');
    }
  };

  return <AppScreen navigation={navigation} active="Home"><View style={styles.screen}><Text style={styles.title}>Invitar visitante</Text><Text style={styles.subtitle}>Crea un código temporal para que pueda ingresar al condominio.</Text><View style={styles.card}><Text style={styles.label}>Nombre del visitante</Text><TextInput placeholder="Ej. Ana López" placeholderTextColor="#9BA4B5" value={visitorName} onChangeText={setVisitorName} style={styles.input} /><Text style={styles.label}>Válido hasta</Text><TextInput placeholder="AAAA-MM-DDTHH:mm" placeholderTextColor="#9BA4B5" value={validTo} onChangeText={setValidTo} style={styles.input} /><Text style={styles.label}>Número máximo de entradas</Text><TextInput placeholder="1" placeholderTextColor="#9BA4B5" value={maxEntries} onChangeText={setMaxEntries} keyboardType="numeric" style={styles.input} /><Pressable accessibilityRole="button" disabled={!visitorName.trim()} onPress={generateQR} style={[styles.button, !visitorName.trim() && styles.disabled]}><Text style={styles.buttonText}>Generar código de acceso</Text></Pressable></View>{qr && <View style={styles.result}><Text style={styles.resultTitle}>Código listo para compartir</Text><Text selectable style={styles.code}>{qr.code}</Text><Text style={styles.hint}>El guardia verificará el código al llegar tu visita.</Text></View>}</View></AppScreen>;
}

const baseStyles = StyleSheet.create({ screen: { backgroundColor: '#F6F7FB', flex: 1, padding: 20, paddingTop: 50 }, title: { color: '#161B2B', fontSize: 23, fontWeight: '800' }, subtitle: { color: '#788196', fontSize: 12, lineHeight: 18, marginTop: 6 }, card: { backgroundColor: '#FFF', borderColor: '#E9EAF0', borderRadius: 17, borderWidth: 1, marginTop: 20, padding: 17 }, label: { color: '#3E4556', fontSize: 12, fontWeight: '700', marginTop: 14 }, input: { backgroundColor: '#FFF', borderColor: '#E4E6ED', borderRadius: 11, borderWidth: 1, color: '#161B2B', marginTop: 7, padding: 13 }, button: { alignItems: 'center', backgroundColor: '#5140E9', borderRadius: 11, marginTop: 21, padding: 15 }, disabled: { opacity: 0.5 }, buttonText: { color: '#FFF', fontSize: 12, fontWeight: '800' }, result: { alignItems: 'center', backgroundColor: '#EEEAFE', borderRadius: 16, marginTop: 16, padding: 18 }, resultTitle: { color: '#161B2B', fontSize: 13, fontWeight: '800' }, code: { color: '#5140E9', fontSize: 24, fontWeight: '900', letterSpacing: 2, marginTop: 10 }, hint: { color: '#788196', fontSize: 11, marginTop: 8, textAlign: 'center' } });
