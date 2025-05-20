import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Modal, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, setDoc, updateDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  name: string;
  birthdate: string;
  photos: string[];
  interests: string[];
}

export default function MatchProfileInfo() {
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

  async function handleMatch(matchType: string) {
  try {
    const userId = id?.toString();
    const fromUserId = await AsyncStorage.getItem("userId");
    if (!fromUserId || !userId) return;

    const timestamp = new Date().toISOString();
    const swipeDocRef = doc(db, "swipes", `${fromUserId}_${userId}`);

    // Verificar si el documento ya existe en la colección 'swipes'
    const existingDocSnap = await getDoc(swipeDocRef);

    if (existingDocSnap.exists()) {
      // Actualizar el estado del documento existente
      await updateDoc(swipeDocRef, {
        tipo: matchType,
        fecha: timestamp,
      });
      console.log(`🔄 Documento actualizado con el estado: ${matchType}`);
    } else {
      // Crear el documento si no existe
      await setDoc(swipeDocRef, {
        fromUserId,
        toUserId: userId,
        tipo: matchType,
        fecha: timestamp,
      });
      console.log(`✅ Nuevo documento creado con el estado: ${matchType}`);
    }

    if (matchType === "match") {
      // Verificar si ambos hicieron match
      const q = query(
        collection(db, "swipes"),
        where("fromUserId", "==", userId),
        where("toUserId", "==", fromUserId),
        where("tipo", "==", "match")
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const matchDocRef = doc(collection(db, "matches"), `${fromUserId}_${userId}`);
        await setDoc(matchDocRef, {
          chatid: `${fromUserId}_${userId}`,
          howMatch: timestamp,
          usersId: [fromUserId, userId],
        });
        console.log("✅ Match confirmado");
      }
    }

    if (matchType === "reject") {
      // Actualizar la interfaz para que desaparezca de New Matches
      console.log("🚫 Rechazo registrado");
      setUser(null);
      router.back();
    }
  } catch (error) {
    console.error("Error al actualizar el estado de match:", error);
  }
}



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

  return (
    <View style={styles.container}>
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
            data={user.photos}
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

          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={() => handleMatch("reject")} style={styles.rejectButton}>
              <MaterialIcons name="cancel" size={30} color="red" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleMatch("match")} style={styles.matchButton}>
              <Ionicons name="checkmark-circle" size={30} color="green" />
            </TouchableOpacity>
          </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainPhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  noImageText: {
    fontSize: 16,
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
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
    marginBottom: 5,
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  matchButton: {
    backgroundColor: '#d4f0d4',
    padding: 10,
    borderRadius: 20,
  },
  rejectButton: {
    backgroundColor: '#f0d4d4',
    padding: 10,
    borderRadius: 20,
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
});
