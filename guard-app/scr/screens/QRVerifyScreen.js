import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function QRVerifyScreen() {
  const [code, setCode] = useState('');
  const { logout } = React.useContext(AuthContext);

  const verify = async () => {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      Alert.alert('Código requerido', 'Escribe el código QR del visitante.');
      return;
    }

    try {
      const response = await api.post('/qr/verify', { code: normalizedCode });
      Alert.alert(response.data.valid ? 'Acceso permitido' : 'Acceso denegado', response.data.message);
      if (response.data.valid) setCode('');
    } catch (error) {
      Alert.alert('No se pudo verificar', error.response?.data?.error || 'Revisa la conexión con el servidor.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verificar código QR</Text>
      <TextInput
        autoCapitalize="characters"
        autoCorrect={false}
        onChangeText={setCode}
        placeholder="Código del visitante"
        style={styles.input}
        value={code}
      />
      <Button title="Verificar acceso" onPress={verify} />
      <View style={styles.logout}>
        <Button color="#b91c1c" title="Cerrar sesión" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, justifyContent: 'center', padding: 20 },
  input: { borderColor: '#9ca3af', borderRadius: 6, borderWidth: 1, padding: 12 },
  logout: { marginTop: 24 },
  title: { fontSize: 22, fontWeight: 'bold' },
});
