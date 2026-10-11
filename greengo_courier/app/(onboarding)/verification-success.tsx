import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VerificationSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(app)/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.replace('/(app)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleContinue}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <View style={styles.clipboardContainer}>
            <View style={styles.clipboard}>
              <View style={styles.checkboxRow}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
            </View>
            <View style={styles.personContainer}>
              <Ionicons name="person" size={40} color="#4CAF50" />
              <Ionicons
                name="checkmark-circle"
                size={60}
                color="#4CAF50"
                style={styles.largeCheck}
              />
            </View>
          </View>
        </View>

        <Text style={styles.title}>ვერიფიკაცია წარმატებით გაიარეთ</Text>
        <Text style={styles.description}>
          თქვენი მოთხოვნა განხილვაშია, გთხოვთ დაგველოდოთ.
        </Text>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>გაგრძელება</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  clipboardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  clipboard: {
    width: 120,
    height: 150,
    backgroundColor: '#B2DFDB',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'flex-start',
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  personContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  largeCheck: {
    position: 'absolute',
    top: 20,
    right: -20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    minWidth: 200,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

