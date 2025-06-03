<<<<<<< Updated upstream
// app/auth/profile.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import BottomNav from '@/components/BottomNav';
=======
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Modal, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

interface UserProfile {
  name: string;
  birthdate: string;
  photos: string[];
  interests: string[];
}

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      if (id) {
        try {
          const userRef = doc(db, 'users', id.toString());
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUser(userSnap.data() as UserProfile);
          }
        } catch (error) {
          console.error("Error al cargar el perfil del usuario:", error);
        }
      }
    }

    fetchUserProfile();
  }, [id]);

  function calculateAge(birthdate: string): number {
    if (!birthdate) return 0;
    const [day, month, year] = birthdate.split('/').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
>>>>>>> Stashed changes

export default function Profile() {
  return (
    <View style={styles.container}>
<<<<<<< Updated upstream
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
=======
      {user && (
        <>
          <View style={styles.header}>
            {user.photos.length > 0 ? (
              <Image source={{ uri: user.photos[0] }} style={styles.mainPhoto} />
            ) : (
              <Text style={styles.noImageText}>Sin foto disponible</Text>
            )}
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.age}>{calculateAge(user.birthdate)} años</Text>
            <Text style={styles.sectionTitle}>Intereses:</Text>
            {user.interests.map((interest, index) => (
              <Text key={index} style={styles.interest}>{interest}</Text>
            ))}
            <Text style={styles.sectionTitle}>Galería:</Text>
          </View>

          <FlatList
            data={user.photos.slice(1)}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelectedImage(item)}>
                <Image source={{ uri: item }} style={styles.galleryImage} />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.galleryContainer}
          />

          {/* Modal para la imagen ampliada */}
          <Modal visible={!!selectedImage} transparent={true} animationType="fade">
            <View style={styles.modalBackground}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedImage(null)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
              <Image source={{ uri: selectedImage || '' }} style={styles.fullScreenImage} />
            </View>
          </Modal>
        </>
      )}
>>>>>>> Stashed changes
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
<<<<<<< Updated upstream
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
=======
    padding: 15,
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  mainPhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#333',
  },
  age: {
    fontSize: 20,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#480081',
  },
  interest: {
    fontSize: 18,
    color: '#333',
    marginLeft: 10,
    marginBottom: 5,
  },
  galleryContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    margin: 5,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '90%',
    height: '70%',
    borderRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 30,
    right: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
  },
  noImageText: {
    fontSize: 16,
    color: '#888',
  },
});
>>>>>>> Stashed changes
