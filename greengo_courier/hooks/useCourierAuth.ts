import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const COURIER_ID_KEY = '@greengo_courier_id';
const COURIER_PHONE_KEY = '@greengo_courier_phone';
export const COURIER_ONLINE_KEY = '@greengo_courier_online';

export const useCourierAuth = () => {
  const [courierId, setCourierId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCourierData();
  }, []);

  const loadCourierData = async () => {
    try {
      const [id, phone] = await Promise.all([
        AsyncStorage.getItem(COURIER_ID_KEY),
        AsyncStorage.getItem(COURIER_PHONE_KEY),
      ]);
      setCourierId(id);
      setPhoneNumber(phone);
    } catch (error) {
      console.error('Error loading courier data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCourierData = async (id: string, phone: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(COURIER_ID_KEY, id),
        AsyncStorage.setItem(COURIER_PHONE_KEY, phone),
      ]);
      setCourierId(id);
      setPhoneNumber(phone);
    } catch (error) {
      console.error('Error saving courier data:', error);
    }
  };

  const clearCourierData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(COURIER_ID_KEY),
        AsyncStorage.removeItem(COURIER_PHONE_KEY),
        AsyncStorage.removeItem(COURIER_ONLINE_KEY),
      ]);
      setCourierId(null);
      setPhoneNumber(null);
    } catch (error) {
      console.error('Error clearing courier data:', error);
    }
  };

  return {
    courierId,
    phoneNumber,
    isLoading,
    saveCourierData,
    clearCourierData,
  };
};

