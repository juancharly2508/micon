import { useThemedStyles } from '../context/ThemeContext';
import React, { useContext, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function QRVerifyScreen() {
  const styles = useThemedStyles(baseStyles);
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [scanned, setScanned] = useState(false);
  const scanLock = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const { user } = useContext(AuthContext);

  const verify = async (rawCode = code) => {
    const normalizedCode = rawCode.trim().toUpperCase();
    if (!normalizedCode) {
      Alert.alert('Código requerido', 'Escribe el código QR del visitante.');
      return;
    }

    if (scanLock.current) return;
    scanLock.current = true;
    setChecking(true);
    try {
      const response = await api.post('/qr/verify', { code: normalizedCode });
      Alert.alert(response.data.valid ? 'Acceso permitido' : 'Acceso denegado', response.data.message);
      setScanned(true);
      if (response.data.valid) setCode('');
    } catch (error) {
      Alert.alert('No se pudo verificar', error.response?.data?.error || 'Revisa la conexión con el servidor.');
      scanLock.current = false;
    } finally { setChecking(false); }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}><View><Text style={styles.brand}>MiCon Seguridad</Text><Text style={styles.greeting}>Hola, {user?.full_name?.split(' ')[0] || 'Guardia'}</Text></View></View>
      <View style={styles.card}><Text style={styles.title}>Escanear acceso</Text><Text style={styles.subtitle}>Centra el código QR del visitante dentro del recuadro.</Text>
        {permission?.granted ? <View style={styles.cameraFrame}><CameraView style={styles.camera} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={scanned || checking ? undefined : ({ data }) => verify(data)} /><View pointerEvents="none" style={styles.scanFrame} /></View> : <View style={styles.permissionBox}><Text style={styles.permissionText}>{permission?.canAskAgain === false ? 'Activa el permiso de cámara desde la configuración del dispositivo.' : 'Se necesita acceso a la cámara para leer el QR.'}</Text>{permission?.canAskAgain !== false && <Pressable onPress={requestPermission} style={styles.button}><Text style={styles.buttonText}>Permitir cámara</Text></Pressable>}</View>}
        {scanned && <Pressable onPress={() => { scanLock.current = false; setScanned(false); }} style={styles.rescan}><Text style={styles.rescanText}>Escanear otro código</Text></Pressable>}
        <Text style={styles.label}>¿No puedes escanearlo?</Text>
        <TextInput accessibilityLabel="Código de acceso" autoCapitalize="characters" autoCorrect={false} onChangeText={setCode} onSubmitEditing={() => verify()} placeholder="Escribe el código del visitante" placeholderTextColor="#9BA4B5" returnKeyType="go" style={styles.input} value={code} />
        <Pressable accessibilityRole="button" disabled={checking || !code.trim()} onPress={() => verify()} style={[styles.button, (checking || !code.trim()) && styles.disabled]}><Text style={styles.buttonText}>{checking ? 'Verificando…' : 'Verificar código'}</Text></Pressable>
      </View>
      <Text style={styles.footer}>Cada acceso se registra en el sistema.</Text>
    </View>
  );
}

const baseStyles = StyleSheet.create({
  screen: { backgroundColor: '#F6F7FB', flex: 1, justifyContent: 'center', padding: 22 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  brand: { color: '#26213F', fontSize: 17, fontWeight: '900' },
  greeting: { color: '#788196', fontSize: 12, marginTop: 4 },
  logout: { borderColor: '#E4E6ED', borderRadius: 10, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9 },
  logoutText: { color: '#596074', fontSize: 11, fontWeight: '700' },
  card: { backgroundColor: '#FFF', borderColor: '#E9EAF0', borderRadius: 20, borderWidth: 1, padding: 20 },
  badge: { alignItems: 'center', backgroundColor: '#EEEAFE', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  badgeIcon: { color: '#5140E9', fontSize: 20, fontWeight: '900' },
  title: { color: '#161B2B', fontSize: 22, fontWeight: '900', marginTop: 16 },
  subtitle: { color: '#788196', fontSize: 12, lineHeight: 18, marginTop: 6 },
  label: { color: '#3E4556', fontSize: 12, fontWeight: '800', marginTop: 24 },
  input: { backgroundColor: '#FFF', borderColor: '#D9DCE5', borderRadius: 12, borderWidth: 1, color: '#161B2B', fontSize: 15, letterSpacing: 1, marginTop: 8, padding: 15 },
  button: { alignItems: 'center', backgroundColor: '#5140E9', borderRadius: 12, marginTop: 15, padding: 15 },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  footer: { color: '#788196', fontSize: 10, lineHeight: 15, marginTop: 17, textAlign: 'center' },
  cameraFrame: { borderRadius: 14, height: 220, marginTop: 18, overflow: 'hidden' }, camera: { flex: 1 }, scanFrame: { borderColor: '#FFF', borderRadius: 18, borderWidth: 2, height: 150, left: '50%', marginLeft: -75, marginTop: -75, position: 'absolute', top: '50%', width: 150 }, permissionBox: { alignItems: 'center', backgroundColor: '#F6F7FB', borderRadius: 14, marginTop: 18, padding: 18 }, permissionText: { color: '#788196', fontSize: 12, textAlign: 'center' }, rescan: { alignItems: 'center', paddingTop: 10 }, rescanText: { color: '#5140E9', fontSize: 12, fontWeight: '800' },
});
