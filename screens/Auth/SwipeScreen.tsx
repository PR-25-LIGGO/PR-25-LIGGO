import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Swiper from 'react-native-deck-swiper';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import BottomNav from '@/components/BottomNav';
import {
  collection, addDoc, getDocs, query, where, doc, getDoc, setDoc
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { useCallback } from "react";
import { ActivityIndicator,Alert} from "react-native";


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
  const [noMoreUsers, setNoMoreUsers] = useState(false);
  const router = useRouter();
useFocusEffect(
  useCallback(() => {
    const onBackPress = () => {
      Alert.alert(
        "¿Salir de la app?",
        "¿Estás seguro de que deseas salir?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Salir", onPress: () => BackHandler.exitApp(), style: "destructive" }
        ]
      );
      return true;
    };

    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, [])
);


  useEffect(() => {
    fetchMatchedUsers();
  }, []);

  const fetchMatchedUsers = async () => {
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

        const swipesSnapshot = await getDocs(
          query(collection(db, 'swipes'), where('fromUserId', '==', userId))
        );
        const swipedUserIds = swipesSnapshot.docs.map(doc => doc.data().toUserId);

        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('gender', '==', oppositeGender),
          where('interests', 'array-contains-any', interests)
        );
        const snapshot = await getDocs(q);
        const matchedUsers = snapshot.docs
          .filter(doc => !swipedUserIds.includes(doc.id))
          .map((doc) => ({
            id: doc.id,
            ...doc.data()
          })) as User[];

        setUsers(matchedUsers);
        setNoMoreUsers(false);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (toUserId: string, type: string) => {
    try {
      const fromUserId = await AsyncStorage.getItem("userId");
      const timestamp = new Date().toISOString();
      if (!fromUserId) return;

      await addDoc(collection(db, "swipes"), {
        fromUserId,
        toUserId,
        tipo: type,
        fecha: timestamp,
      });

      if (type === "match") {
        const q = query(
          collection(db, "swipes"),
          where("fromUserId", "==", toUserId),
          where("toUserId", "==", fromUserId),
          where("tipo", "==", "match")
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          await setDoc(doc(collection(db, "matches")), {
            chatid: `${fromUserId}_${toUserId}`,
            howMatch: timestamp,
            usersId: [fromUserId, toUserId],
          });
          console.log("✅ Match confirmado");
        }
      }

      console.log("Swipe registrado");
    } catch (error) {
      console.error("Error al registrar el swipe:", error);
    }
  };

  const handleSecondChance = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("Usuario no autenticado");

      // 🔹 1. Buscar todos los swipes rechazados
      const rejectedSnapshot = await getDocs(
        query(
          collection(db, "swipes"),
          where("fromUserId", "==", userId),
          where("tipo", "==", "reject")
        )
      );

      const rejectedUserIds = rejectedSnapshot.docs.map(doc => doc.data().toUserId);

      // 🔹 2. Verificar que NO haya match recíproco
      const validRejected: string[] = [];
      for (const rejectedId of rejectedUserIds) {
        const reciprocalMatchQuery = query(
          collection(db, "swipes"),
          where("fromUserId", "==", rejectedId),
          where("toUserId", "==", userId),
          where("tipo", "==", "match")
        );
        const matchSnap = await getDocs(reciprocalMatchQuery);
        if (matchSnap.empty) validRejected.push(rejectedId);
      }



      // 🔹 3. Obtener los datos de usuario
      const userDocs = await Promise.all(validRejected.map(async (uid) => {
        const docSnap = await getDoc(doc(db, "users", uid));
        if (docSnap.exists()) return { id: uid, ...docSnap.data() } as User;
        return null;
      }));

      const filtered = userDocs.filter(Boolean) as User[];
      setUsers(filtered);
      setCurrentIndex(0);
      setNoMoreUsers(false);
    } catch (error) {
      console.error("Error al cargar rechazados:", error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FFF8' }}>
        <ActivityIndicator size="large" color="#3DDC84" />
        <Text style={{ marginTop: 10, fontSize: 16, color: "#555" }}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Swiper
        cards={users}
        cardIndex={currentIndex}
        renderCard={(card) => (
          <View style={styles.card}>
            <Image
              source={require("@/assets/logo-liggo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.sugerencia}>⬅️ Desliza a la izquierda para ❌</Text>
            <Text style={styles.sugerencia}>➡️ Desliza a la derecha para ❤️</Text>

            {card?.photos?.length > 0 ? (
              <Image source={{ uri: card.photos[0] }} style={styles.image} />
            ) : (
              <Text style={styles.noImageText}>Sin fotos disponibles</Text>
            )}

            <Text style={styles.name}>{card?.name || "Usuario desconocido"}</Text>
            <Text style={styles.ageText}>
              {calculateAge(card?.birthdate || "2000-01-01")} años
            </Text>

            <TouchableOpacity
              style={styles.infoButton}
              onPress={() =>
                router.push(`/profile/profile-screen?id=${card.id}`)
              }
            >
              <Ionicons name="information-circle-outline" size={50} color="#555" />
            </TouchableOpacity>
          </View>

        )}

        onSwipedLeft={(index) => {
          const userId = users[index]?.id;
          if (userId) handleSwipe(userId, "reject");
          setCurrentIndex(index + 1);
        }}
        onSwipedRight={(index) => {
          const userId = users[index]?.id;
          if (userId) handleSwipe(userId, "match");
          setCurrentIndex(index + 1);
        }}
        onSwipedAll={() => setNoMoreUsers(true)}
        backgroundColor={'#F8FFF8'}
        stackSize={3}
      />

      {noMoreUsers && (
        <TouchableOpacity style={styles.retryButton} onPress={handleSecondChance}>
          <Text style={styles.retryText}>
            Tilin dice: ¡Dale una segunda oportunidad a los rechazados!
          </Text>
        </TouchableOpacity>
      )}


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
    justifyContent: 'center',
    alignItems: 'center',
  },
  sugerencia: {
    backgroundColor: 'transparent',
    paddingBottom: 10,
    color: "lightgray",
  },
  card: {

    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    margin: 10,
    borderColor: '#3DDC84',
    borderWidth: 2,
    shadowColor: 'green',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  image: {
    width: 280,
    height: 360,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#DC2D22',
    shadowColor: "red",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 9,
  },
  logo: {
    width: 140,
    height: 90,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#222',
  },

  infoButton: {
    borderRadius: 50,
    padding: 5,
    borderWidth: 2,
    borderColor: '#555',
  },

  noImageText: {
    fontSize: 16,
    color: '#888',
    marginTop: 20,
    fontStyle: 'italic',
  },

  retryButton: {
    backgroundColor: '#3DDC84',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 16,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  ageText: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    width: '90%',
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },

});
