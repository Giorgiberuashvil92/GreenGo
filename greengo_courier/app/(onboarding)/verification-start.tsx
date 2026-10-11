import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VerificationStartScreen() {
  const router = useRouter();

  const handleDocumentType = (type: 'id' | 'passport') => {
    router.push({
      pathname: '/(onboarding)/document-capture',
      params: { type },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationBox}>
            <View style={styles.dashedFrame}>
              <Ionicons name="person" size={40} color="#B2DFDB" />
            </View>
          </View>
        </View>

        <Text style={styles.title}>დაიწყე ვერიფიკაცია</Text>
        <Text style={styles.description}>
          გთხოვთ, წარმოადგინოთ დოკუმენტები თქვენი პროფილის გადასამოწმებლად
        </Text>

        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleDocumentType('id')}
          >
            <View style={styles.cardContent}>
              <Ionicons name="id-card" size={24} color="#333" />
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>
                  გადაიღეთ თქვენი პირადობის მოწმობა
                </Text>
                <Text style={styles.cardSubtitle}>
                  თქვენი პირადი ინფორმაციების სწორად შესამოწმებლად
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#333" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => handleDocumentType('passport')}
          >
            <View style={styles.cardContent}>
              <Ionicons name="camera" size={24} color="#333" />
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>
                  გადაიღეთ თქვენი პასპორტი
                </Text>
                <Text style={styles.cardSubtitle}>
                  თქვენი პირადი ინფორმაციების სწორად შესამოწმებლად
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#333" />
            </View>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  illustrationBox: {
    width: 200,
    height: 150,
    backgroundColor: '#B2DFDB',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashedFrame: {
    width: 160,
    height: 120,
    borderWidth: 2,
    borderColor: '#B2DFDB',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 16,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

