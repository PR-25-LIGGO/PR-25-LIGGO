import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Swiper from 'react-native-deck-swiper';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import BottomNav from '@/components/BottomNav';
import { collection, addDoc, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  birthdate: string;
  photos: string[];
}

export default function SwipeScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function fetchMatchedUsers() {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) throw new Error("Usuario no autenticado");

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const interests: string[] = userData.interests;
          const gender: string = userData.gender;
          const oppositeGender = gender === "HOMBRE" ? "MUJER" : "HOMBRE";
          const usersRef = collection(db, 'users');
          const q = query(
            usersRef,
            where('gender', '==', oppositeGender),
            where('interests', 'array-contains-any', interests)
          );

          const snapshot = await getDocs(q);
          const matchedUsers = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })) as User[];

          setUsers(matchedUsers);
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMatchedUsers();
  }, []);

  const handleSwipe = async (toUserId: string, type: string) => {
    try {
      const fromUserId = await AsyncStorage.getItem("userId");
      const timestamp = new Date().toISOString();

      if (!fromUserId) return;

      // Registrar el swipe en la colección "swipes"
      await addDoc(collection(db, "swipes"), {
        fromUserId,
        toUserId,
        tipo: type,
        fecha: timestamp,
      });

      // Verificar si hay un match
      if (type === "match") {
        const q = query(
          collection(db, "swipes"),
          where("fromUserId", "==", toUserId),
          where("toUserId", "==", fromUserId),
          where("tipo", "==", "match")
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          // Crear el match en la colección "matches"
          await setDoc(doc(collection(db, "matches")), {
            chatid: `${fromUserId}_${toUserId}`,
            howMatch: timestamp,
            usersId: [fromUserId, toUserId],
          });

          console.log("✅ Match confirmado");
        }
      }

      console.log("Recahazo de swipe exitoso");
    } catch (error) {
      console.error("Error al registrar el swipe:", error);
    }
  };

  const handleSwipeLeft = (index: number) => {
    const userId = users[index]?.id;
    if (userId) {
      handleSwipe(userId, "reject");
      setCurrentIndex(index + 1);
    }
  };

  if (loading) {
    return <Text>Cargando usuarios...</Text>;
  }

  return (
    <View style={styles.container}>
      <Swiper
        cards={users}
        cardIndex={currentIndex}
        renderCard={(card) => (
          <View style={styles.card}>
            {card?.photos?.length > 0 ? (
              card.photos.map((photo, index) => (
                <Image key={index} source={{ uri: photo }} style={styles.image} />
              ))
            ) : (
              <Text style={styles.noImageText}>Sin fotos disponibles</Text>
            )}
            <Text style={styles.name}>{card?.name || "Usuario desconocido"}</Text>
            <Text>{calculateAge(card?.birthdate || "2000-01-01")} años</Text>

            <View style={styles.actionButtons}>
              {/* Botón de Información */}
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => router.push(`/profile/profile-screen?id=${card.id}`)}
              >
                <Ionicons name="information-circle-outline" size={30} color="#333" />
              </TouchableOpacity>

              {/* Botón de Match */}
              <TouchableOpacity
                style={styles.matchButton}
                onPress={() => handleSwipe(card.id, "match")}
              >
                <MaterialIcons name="check-circle" size={30} color="#28a745" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        onSwipedLeft={(index) => handleSwipeLeft(index)} // Swipe izquierda = reject
        onSwipedAll={() => console.log("No hay más usuarios")}
        backgroundColor={'#f5f5f5'}
        stackSize={3}
      />
      <BottomNav />
    </View>
  );
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 10,
  },
  image: {
    width: 200,
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  infoButton: {
    marginHorizontal: 10,
  },
  matchButton: {
    marginHorizontal: 10,
  },
  noImageText: {
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});
