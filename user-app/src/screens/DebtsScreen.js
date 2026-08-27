import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import api from '../api';

export default function DebtsScreen() {
  const [debts, setDebts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/debts');
        setDebts(res.data);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={debts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{item.type}</Text>
            <Text>{item.description}</Text>
            <Text>Monto: ${item.amount}</Text>
            <Text>Vence: {item.due_date?.split('T')[0]}</Text>
            <Text>Estado: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: { borderWidth: 1, borderColor: '#ccc', padding: 15, marginBottom: 10, borderRadius: 5 },
});