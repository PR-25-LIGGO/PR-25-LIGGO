import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Modal, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  const router = useRouter();

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
    if (
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  return (
    <View style={styles.container}>
      {/* Logo + Atrás */}
      <View style={styles.topBar}>
        <Image
          source={require('@/assets/logo-liggo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Atrás</Text>
        </TouchableOpacity>
      </View>

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

            <Text style={styles.sectionTitle}>🎯 Intereses:</Text>
            <View style={styles.tagsContainer}>
              {user.interests.map((interest, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.headerGaleria}>
            <Text style={styles.sectionTitle}>🖼️ Galería:</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 140,
    height: 90,
  },
  backButton: {
    backgroundColor: '#DC2D22',
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#FFF0F0',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderColor: '#DC2D22',
    borderWidth: 1,
  },
  mainPhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#DC2D22',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#222',
  },
  age: {
    fontSize: 20,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#DC2D22',
  },

  // ✅ INTERESES (ESTILO TAG)
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    rowGap: 10,
    justifyContent: "center",
    marginBottom: 10,
  },
  tag: {
    borderWidth: 1.5,
    borderColor: "#3DDC84",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    elevation: 2,
  },
  tagText: {
    fontSize: 14,
    color: "#111",
    fontWeight: "500",
    fontStyle: "italic",
  },

  // ✅ GALERÍA
  galleryContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#F8FFF8',
    borderColor: '#3DDC84',
    borderWidth: 2,
    borderRadius: 30,
    padding: 10,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
    margin: 5,
  },

  // ✅ MODAL DE IMAGEN
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
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
    backgroundColor: '#DC2D22',
    borderRadius: 20,
    padding: 6,
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
  },
  noImageText: {
    fontSize: 16,
    color: '#888',
  },
  headerGaleria: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
});
