import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Modal, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, setDoc, updateDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native';
import { deleteDoc } from "firebase/firestore";
import { useFocusEffect } from 'expo-router';


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

  //codigoSwipe

  async function handleMatch(matchType: string) {
    try {
      const userId = id?.toString(); // ID del perfil que estoy viendo
      const fromUserId = await AsyncStorage.getItem("userId"); // ID del usuario autenticado
      if (!fromUserId || !userId) return;

      const timestamp = new Date().toISOString();

      // 🔐 ID compuesto predecible para matches
      const idsOrdenados = [fromUserId, userId].sort(); // [userA, userB]
      const matchDocId = `${idsOrdenados[0]}_${idsOrdenados[1]}`;

      // 🔄 Buscar documento original en swipes (de quien envió el primer match)
      const swipeQuery = query(
        collection(db, "swipes"),
        where("fromUserId", "==", userId),
        where("toUserId", "==", fromUserId)
      );
      const swipeSnapshot = await getDocs(swipeQuery);

      // 🔍 Encontrar documento original (del primer swipe)
      if (!swipeSnapshot.empty) {
        const originalDoc = swipeSnapshot.docs[0]; // asumimos solo uno
        const swipeDocRef = doc(db, "swipes", originalDoc.id);

        if (matchType === "match") {
          const q = query(
            collection(db, "swipes"),
            where("fromUserId", "==", userId),
            where("toUserId", "==", fromUserId),
            where("tipo", "==", "match")
          );
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            const sortedIds = [fromUserId, userId].sort();
            const matchDocId = `${sortedIds[0]}_${sortedIds[1]}`;

            const matchRef = doc(db, "matches", matchDocId);
            await setDoc(matchRef, {
              chatid: matchDocId,
              howMatch: timestamp,
              usersId: sortedIds,
            });
            console.log("✅ Match confirmado y guardado en matches");
            router.setParams({ refresh: Date.now() }); // para acutalizar
            router.back();
          }
        }


        if (matchType === "reject") {
          await updateDoc(swipeDocRef, {
            tipo: "reject",
            fecha: timestamp,
          });
          console.log("🚫 Rechazo actualizado en swipes");

          // Eliminar el documento de matches
          const sortedIds = [fromUserId, userId].sort();
          const matchDocId = `${sortedIds[0]}_${sortedIds[1]}`;
          const matchRef = doc(db, "matches", matchDocId);
          const matchSnap = await getDoc(matchRef);
          if (matchSnap.exists()) {
            await deleteDoc(matchRef);
            console.log("🗑️ Documento de match eliminado");
          }

          setUser(null);
          router.setParams({ refresh: Date.now() }); // para actualizar
          router.back();
        }

      } else {
        console.warn("❗ No se encontró el swipe original para actualizar");
      }
    } catch (error) {
      console.error("Error al manejar el match/reject:", error);
    }
  }



  //Final codigo Swipe


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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.topBar}>
        <Image source={require('@/assets/logo-liggo.png')} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Atras</Text>
        </TouchableOpacity>
      </View>

      {user && (
        <>
          <View style={styles.cardContainer}>
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

          <View style={styles.galeriaContainer}>
            <Text style={styles.sectionTitle}>🖼️ Galería:</Text>
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
              scrollEnabled={false} // importante para que el ScrollView principal funcione correctamente
            />
          </View>

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

      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedImage(null)}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedImage || '' }} style={styles.fullScreenImage} />
        </View>
      </Modal>
    </ScrollView>

  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#F9F9F9',
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 80,
  },
  backButton: {
    backgroundColor: '#DC2D22',
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  //card de perfil
  cardContainer: {
    backgroundColor: "#FFF0F0",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: "blue",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },

  //card de galeria 
  galeriaContainer: {
    backgroundColor: "#f4fef5",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,

    shadowColor: "red",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },

  mainPhoto: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  age: {
    fontSize: 18,
    textAlign: "center",
    color: "#555",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DC2D22",
    marginVertical: 10,
    textAlign: "center",
  },
  interest: {
    fontSize: 16,
    color: "#222",
    marginVertical: 4,
    padding: 6,
    borderWidth: 2,
    borderColor: "#3DDC84",
    borderRadius: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    alignSelf: 'center',
    backgroundColor: '#fff',
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  matchButton: {
    backgroundColor: '#D4F0D4',
    padding: 12,
    borderRadius: 20,
    elevation: 4,
  },
  rejectButton: {
    backgroundColor: '#F0D4D4',
    padding: 12,
    borderRadius: 20,
    elevation: 4,
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
    backgroundColor: '#DC2D22',
    borderRadius: 20,
    padding: 6,
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
  },
  noImageText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 16,
    marginVertical: 20,
  },

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

});
