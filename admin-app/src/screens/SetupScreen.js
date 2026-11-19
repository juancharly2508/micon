import { useThemedStyles } from '../context/ThemeContext';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { ThemeToggle } from '../context/ThemeContext';

const steps = ['Viviendas', 'Amenidades', 'Reglamento', 'Residentes', 'Guardias'];

export default function SetupScreen() {
  const styles = useThemedStyles(baseStyles);
  const { user, refreshUser, logout } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [unitCount, setUnitCount] = useState('');
  const [areas, setAreas] = useState([]);
  const [areaDraft, setAreaDraft] = useState('');
  const [residentCode, setResidentCode] = useState('');
  const [linkedResidents, setLinkedResidents] = useState([]);
  const [rules, setRules] = useState('');
  const [hasGuards, setHasGuards] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const condoResponse = await api.get('/condominiums/me');
        const condo = condoResponse.data;
        setStep(condo.setup_step >= 5 ? 5 : Math.max(1, condo.setup_step + 1));
        setUnitCount(condo.unit_count ? String(condo.unit_count) : '');
        setRules(condo.rules || '');
        setHasGuards(Boolean(condo.has_guards));
        setAreas(condo.areas || []);
      } catch (error) { /* Un administrador recién registrado aún no guarda pasos. */ }
    })();
  }, []);

  const addArea = () => {
    const name = areaDraft.trim();
    if (name && !areas.some((area) => area.toLocaleLowerCase() === name.toLocaleLowerCase())) setAreas((current) => [...current, name]);
    setAreaDraft('');
  };

  const linkResident = async () => {
    if (!residentCode.trim()) return;
    try {
      const { data } = await api.post('/users/link', { code: residentCode });
      setLinkedResidents((current) => [...current, data.full_name]);
      setResidentCode('');
      Alert.alert('Residente agregado', `${data.full_name} quedó vinculado a su vivienda.`);
    } catch (error) { Alert.alert('No se pudo vincular', error.response?.data?.error || 'Revisa el código y la vivienda.'); }
  };

  const saveStep = async (next) => {
    if (saving) return;
    if (step === 1 && (!/^\d+$/.test(unitCount) || Number(unitCount) < 1 || Number(unitCount) > 500)) return Alert.alert('Revisa el número de viviendas', 'Escribe una cantidad entre 1 y 500.');
    if (step === 3 && !rules.trim()) return Alert.alert('Agrega las reglas principales', 'Puedes escribir “Aún no hay reglas definidas” si las completarás después.');
    if (step === 5 && hasGuards === null) return Alert.alert('Elige una opción', 'Indica si el condominio cuenta con servicio de guardia.');
    setSaving(true);
    try {
      const payload = { step };
      if (step === 1) payload.unit_count = Number(unitCount);
      if (step === 2) payload.areas = areas;
      if (step === 3) payload.rules = rules;
      if (step === 5) payload.has_guards = hasGuards;
      if (next) await api.patch('/condominiums/setup', payload);
      else await api.patch('/condominiums/setup', { ...payload, complete: true });
      if (next) setStep(next);
      else await refreshUser();
    } catch (error) {
      Alert.alert('No se pudo guardar', error.response?.data?.error || 'Intenta de nuevo.');
    } finally { setSaving(false); }
  };

  return <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <View style={styles.header}><View><Text style={styles.brand}>MiCon</Text><Text style={styles.eyebrow}>CONFIGURACIÓN INICIAL</Text></View><Pressable onPress={logout} style={styles.signOut}><Text style={styles.signOutText}>Salir</Text></Pressable></View>
        <ThemeToggle compact />
    <View style={styles.stepper}><Text style={styles.stepCount}>PASO {step} DE 5</Text><View style={styles.progressTrack}><View style={[styles.progress, { width: `${step * 20}%` }]} /></View><View style={styles.stepLabels}>{steps.map((label, index) => <Text key={label} style={[styles.stepLabel, index + 1 === step && styles.stepLabelActive]}>{index + 1}</Text>)}</View></View>
    <View style={styles.card}>
      {step === 1 && <><Text style={styles.title}>¿Cuántas viviendas hay?</Text><Text style={styles.subtitle}>Crearemos una lista para que los residentes elijan su casa al registrarse.</Text><Text style={styles.label}>Número total de viviendas</Text><TextInput value={unitCount} onChangeText={setUnitCount} keyboardType="number-pad" placeholder="Ej. 48" style={styles.input} /><Text style={styles.helper}>Puedes cambiar los nombres de cada vivienda después.</Text></>}
      {step === 2 && <><Text style={styles.title}>Agrega las áreas comunes</Text><Text style={styles.subtitle}>Incluye solo los espacios que existen en tu comunidad.</Text><View style={styles.suggestions}>{['Alberca', 'Áreas verdes', 'Cancha', 'Salón de eventos'].map((name) => <Pressable key={name} onPress={() => setAreas((current) => current.includes(name) ? current : [...current, name])} style={styles.chip}><Text style={styles.chipText}>＋ {name}</Text></Pressable>)}</View><View style={styles.addRow}><TextInput value={areaDraft} onChangeText={setAreaDraft} onSubmitEditing={addArea} placeholder="Otra amenidad" style={[styles.input, styles.areaInput]} returnKeyType="done" /><Pressable onPress={addArea} style={styles.addButton}><Text style={styles.addButtonText}>Agregar</Text></Pressable></View>{areas.length ? <View style={styles.list}>{areas.map((area) => <View key={area} style={styles.areaRow}><Text style={styles.areaName}>◇  {area}</Text><Pressable accessibilityLabel={`Quitar ${area}`} onPress={() => setAreas((current) => current.filter((item) => item !== area))}><Text style={styles.remove}>Quitar</Text></Pressable></View>)}</View> : <Text style={styles.helper}>Si no hay áreas comunes, puedes continuar sin agregar ninguna.</Text>}</>}
      {step === 3 && <><Text style={styles.title}>Reglas principales</Text><Text style={styles.subtitle}>Escribe los acuerdos que deben consultar los residentes.</Text><TextInput value={rules} onChangeText={setRules} placeholder="Ej. Horario de silencio: 22:00 a 08:00…" multiline textAlignVertical="top" style={[styles.input, styles.textarea]} /><Text style={styles.helper}>Este texto podrá editarse más adelante desde la configuración.</Text></>}
      {step === 4 && <><Text style={styles.title}>Prepara la lista de residentes</Text><Text style={styles.subtitle}>Cada residente crea su cuenta y recibe un código único. Puedes vincularlos ahora o agregarlos después desde la pestaña “Residentes”.</Text><View style={styles.infoBox}><Text style={styles.infoIcon}>＋</Text><View style={styles.infoCopy}><Text style={styles.infoTitle}>El residente registra sus propios datos</Text><Text style={styles.infoText}>Incluye vivienda, estatus, contacto de emergencia y foto de perfil.</Text></View></View><Text style={styles.label}>Código del residente</Text><View style={styles.addRow}><TextInput value={residentCode} onChangeText={setResidentCode} placeholder="Pídele su código MiCon" autoCapitalize="characters" autoCorrect={false} style={[styles.input, styles.areaInput]} /><Pressable onPress={linkResident} style={styles.addButton}><Text style={styles.addButtonText}>＋ Agregar</Text></Pressable></View>{linkedResidents.length > 0 && <View style={styles.list}>{linkedResidents.map((name, index) => <Text key={`${name}-${index}`} style={styles.areaRow}>✓  {name} quedó vinculado</Text>)}</View>}<Text style={styles.helper}>El código solo funciona si el residente escribió una vivienda creada en el paso 1.</Text></>}
      {step === 5 && <><Text style={styles.title}>¿Tienen servicio de guardia?</Text><Text style={styles.subtitle}>Esta opción controla si las funciones de seguridad aparecen en el condominio.</Text><Pressable accessibilityRole="radio" accessibilityState={{ selected: hasGuards === true }} onPress={() => setHasGuards(true)} style={[styles.choice, hasGuards === true && styles.choiceSelected]}><Text style={styles.choiceIcon}>✓</Text><View style={styles.choiceCopy}><Text style={styles.choiceTitle}>Sí, contamos con guardias</Text><Text style={styles.choiceText}>Podrás dar de alta al personal para que use su app.</Text></View></Pressable><Pressable accessibilityRole="radio" accessibilityState={{ selected: hasGuards === false }} onPress={() => setHasGuards(false)} style={[styles.choice, hasGuards === false && styles.choiceSelected]}><Text style={styles.choiceIcon}>○</Text><View style={styles.choiceCopy}><Text style={styles.choiceTitle}>No tenemos guardias</Text><Text style={styles.choiceText}>Las opciones de seguridad permanecerán ocultas.</Text></View></Pressable></>}
      <View style={styles.actions}>{step > 1 && <Pressable onPress={() => setStep((current) => current - 1)} style={styles.backButton}><Text style={styles.backText}>Atrás</Text></Pressable>}<Pressable disabled={saving} onPress={() => saveStep(step < 5 ? step + 1 : null)} style={[styles.nextButton, saving && styles.disabled]}><Text style={styles.nextText}>{saving ? 'Guardando…' : step === 5 ? 'Terminar configuración' : 'Guardar y continuar'}</Text></Pressable></View>
    </View>
    <Text style={styles.footer}>Condominio: {user?.condominium_name || 'Mi comunidad'} · Tu información se guarda en cada paso.</Text>
  </ScrollView>;
}

const baseStyles = StyleSheet.create({ screen: { backgroundColor: '#F6F7FB', flexGrow: 1, padding: 20, paddingTop: 48 }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 }, brand: { color: '#26213F', fontSize: 25, fontWeight: '900' }, eyebrow: { color: '#788196', fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginTop: 4 }, signOut: { borderColor: '#E4E6ED', borderRadius: 10, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 8 }, signOutText: { color: '#596074', fontSize: 11, fontWeight: '700' }, stepper: { backgroundColor: '#FFF', borderColor: '#E9EAF0', borderRadius: 16, borderWidth: 1, marginBottom: 14, padding: 16 }, stepCount: { color: '#5140E9', fontSize: 10, fontWeight: '900', letterSpacing: 1 }, progressTrack: { backgroundColor: '#EEEFF4', borderRadius: 4, height: 5, marginTop: 11, overflow: 'hidden' }, progress: { backgroundColor: '#5140E9', borderRadius: 4, height: 5 }, stepLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }, stepLabel: { alignItems: 'center', backgroundColor: '#F0F1F6', borderRadius: 14, color: '#788196', fontSize: 11, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5 }, stepLabelActive: { backgroundColor: '#EEEAFE', color: '#5140E9' }, card: { backgroundColor: '#FFF', borderColor: '#E9EAF0', borderRadius: 20, borderWidth: 1, padding: 20 }, title: { color: '#161B2B', fontSize: 22, fontWeight: '800' }, subtitle: { color: '#788196', fontSize: 13, lineHeight: 20, marginTop: 7 }, label: { color: '#3E4556', fontSize: 12, fontWeight: '700', marginTop: 25 }, input: { backgroundColor: '#FFF', borderColor: '#E4E6ED', borderRadius: 12, borderWidth: 1, color: '#161B2B', fontSize: 15, marginTop: 8, padding: 14 }, helper: { color: '#788196', fontSize: 11, lineHeight: 17, marginTop: 10 }, suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 }, chip: { backgroundColor: '#F2F1FF', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 9 }, chipText: { color: '#5140E9', fontSize: 11, fontWeight: '700' }, addRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 14 }, areaInput: { flex: 1 }, addButton: { backgroundColor: '#5140E9', borderRadius: 11, marginTop: 8, paddingHorizontal: 13, paddingVertical: 13 }, addButtonText: { color: '#FFF', fontSize: 12, fontWeight: '800' }, list: { marginTop: 10 }, areaRow: { alignItems: 'center', borderBottomColor: '#F0F1F5', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 }, areaName: { color: '#30364A', fontSize: 13, fontWeight: '700' }, remove: { color: '#A04A4A', fontSize: 11, fontWeight: '700' }, textarea: { minHeight: 160 }, infoBox: { backgroundColor: '#F7F6FF', borderRadius: 14, flexDirection: 'row', gap: 12, marginTop: 16, padding: 14 }, infoIcon: { color: '#5140E9', fontSize: 20, fontWeight: '900' }, infoCopy: { flex: 1 }, infoTitle: { color: '#24283A', fontSize: 13, fontWeight: '800' }, infoText: { color: '#788196', fontSize: 11, lineHeight: 17, marginTop: 4 }, choice: { alignItems: 'center', borderColor: '#E4E6ED', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 12, marginTop: 14, padding: 15 }, choiceSelected: { backgroundColor: '#F7F6FF', borderColor: '#5140E9' }, choiceIcon: { color: '#5140E9', fontSize: 20, fontWeight: '900', width: 22 }, choiceCopy: { flex: 1 }, choiceTitle: { color: '#24283A', fontSize: 13, fontWeight: '800' }, choiceText: { color: '#788196', fontSize: 11, lineHeight: 16, marginTop: 3 }, actions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end', marginTop: 27 }, backButton: { alignItems: 'center', borderColor: '#E4E6ED', borderRadius: 11, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 19, paddingVertical: 14 }, backText: { color: '#3E4556', fontSize: 12, fontWeight: '800' }, nextButton: { alignItems: 'center', backgroundColor: '#5140E9', borderRadius: 11, flex: 1, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 15 }, disabled: { opacity: 0.65 }, nextText: { color: '#FFF', fontSize: 12, fontWeight: '800', textAlign: 'center' }, footer: { color: '#788196', fontSize: 10, marginBottom: 20, marginTop: 14, textAlign: 'center' } });
