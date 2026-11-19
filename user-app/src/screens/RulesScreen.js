import { useThemedStyles } from '../context/ThemeContext';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import api from '../api';
import { AppScreen, colors, PageTitle, shared } from '../ui';

export default function RulesScreen({ navigation }) {
  const styles = useThemedStyles(baseStyles);
  const [condo, setCondo] = useState(null);
  useEffect(() => { api.get('/condominiums/me').then(({ data }) => setCondo(data)).catch((error) => Alert.alert('No se pudo cargar el reglamento', error.response?.data?.error || 'Intenta de nuevo.')); }, []);
  return <AppScreen navigation={navigation} active="Rules"><ScrollView contentContainerStyle={styles.container}><PageTitle title="Reglamento" subtitle={condo?.name || 'Acuerdos de tu comunidad'} onBack={() => navigation.goBack()} /><View style={shared.card}><Text style={styles.heading}>Reglas principales</Text><Text style={styles.body}>{condo?.rules || 'La administración aún no ha publicado el reglamento.'}</Text></View></ScrollView></AppScreen>;
}

const baseStyles = StyleSheet.create({ container: { padding: 20, paddingTop: 36 }, heading: { color: colors.ink, fontSize: 15, fontWeight: '800' }, body: { color: '#3E4556', fontSize: 14, lineHeight: 23, marginTop: 12 } });
