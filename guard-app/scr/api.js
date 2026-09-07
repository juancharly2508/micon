import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  // Android Emulator reaches services on the development PC through 10.0.2.2.
  // Set EXPO_PUBLIC_API_URL in .env when using a physical device or another host.
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api',
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
