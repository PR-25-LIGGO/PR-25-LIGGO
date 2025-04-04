// app/auth/profile.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import BottomNav from '@/components/BottomNav';

export default function Profile() {
  return (
    <View style={styles.container}>
      {/* Logo centrado arriba */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/logo-liggo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/women/82.jpg' }} // Reemplaza con imagen real
          style={styles.avatar}
        />

        <Text style={styles.name}>Paula</Text>
        <Text style={styles.profession}>Químico Farmacéutico</Text>
        <Text style={styles.university}>Universidad América</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intereses</Text>
          <Text style={styles.interests}>🎨 Arte, 📚 Lectura, 🏃‍♂️ Deporte</Text>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  logo: {
    width: 140,
    height: 60,
  },
  scroll: {
    paddingTop: 120,
    paddingBottom: 100,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginTop: 20,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profession: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  university: {
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
  },
  section: {
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  interests: {
    fontSize: 16,
    color: '#444',
  },
});
