import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import BottomNav from "@/components/BottomNav";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";

interface Match {
  id: string;
  name: string;
  photo: string;
  matchDate: string;
}

export default function ChatsScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchMatches() {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) throw new Error("Usuario no autenticado");

        const swipesRef = collection(db, "swipes");
        const q = query(
          swipesRef,
          where("toUserId", "==", userId),
          where("tipo", "==", "match")
        );
        const snapshot = await getDocs(q);

        const userMatches: Match[] = [];
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const fromUserId = data.fromUserId;

          const userRef = doc(db, "users", fromUserId);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            userMatches.push({
              id: fromUserId,
              name: userData.name,
              photo: userData.photos?.[0] || "https://randomuser.me/api/portraits/lego/2.jpg",
              matchDate: new Date(data.fecha).toLocaleString(),
            });
          }
        }

        setMatches(userMatches);
      } catch (error) {
        console.error("Error al cargar matches:", error);
      }
    }

    fetchMatches();
  }, []);

  return (
  <View style={styles.container}>
    <Text style={styles.title}>💬 Chats & Matches</Text>
    <Image
      source={require("@/assets/logo-liggo.png")}
      style={styles.logo}
      resizeMode="contain"
    />

    <ScrollView showsVerticalScrollIndicator={false}>
      
      {/* 🟩 NUEVOS MATCHES */}
      <View style={styles.cardContainer}>
        <Text style={styles.sectionTitle}>✨ Nuevos Matches</Text>
        {matches.length > 0 ? (
          matches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={styles.matchCard}
              onPress={() => router.push(`/profile/matchProf?id=${match.id}`)}
            >
              <Image source={{ uri: match.photo }} style={styles.avatar} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.matchName}>{match.name}</Text>
                <Text style={styles.matchDate}>{match.matchDate}</Text>
              </View>
              <Ionicons name="heart" size={22} color="#DC2D22" />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noMatches}>No tienes nuevos matches</Text>
        )}
      </View>

      {/* 🟦 MENSAJES */}
      <View style={styles.chatContainer}>
        <Text style={styles.sectionTitle}>📨 Mensajes Recientes</Text>

        <View style={styles.chatItem}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/women/81.jpg" }}
            style={styles.avatar}
          />
          <View style={styles.chatContent}>
            <Text style={styles.chatName}>Sachia</Text>
            <Text style={styles.chatPreview}>Vio tu perfil y quiere conocerte...</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>💌</Text>
          </View>
        </View>

        <View style={styles.chatItem}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/women/82.jpg" }}
            style={styles.avatar}
          />
          <View style={styles.chatContent}>
            <Text style={styles.chatName}>Shain</Text>
            <Text style={styles.chatPreview}>¡Me encantan tus fotos de viaje!</Text>
          </View>
        </View>
      </View>
    </ScrollView>

    <BottomNav />
  </View>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  cardContainer: {
  backgroundColor: "#FFF0F0",
  padding: 16,
  borderRadius: 14,
  marginBottom: 20,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 2,
  elevation: 2,
},

chatContainer: {
  backgroundColor: "#F8FFF8",
  padding: 16,
  borderRadius: 14,
  marginBottom: 20,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 2,
  elevation: 2,
},
  title: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 10,
    color: "#3DDC84",
  },
  logo: {
    width: 140,
    height: 90,
    alignSelf: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#222",
  },
  matchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF", //card dentrode Nuevos MAtches
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "blue",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 9,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ccc",
  },
  matchName: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  matchDate: {
    fontSize: 12,
    color: "#777",
  },
  noMatches: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginVertical: 10,
  },
  
  //Los cards dentro de Mensajes Recientes
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF", //card dentrode Nuevos Mensaje
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "red",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 9,
  },
  chatContent: {
    flex: 1,
    marginLeft: 10,
  },
  chatName: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#111",
  },
  chatPreview: {
    fontSize: 13,
    color: "#555",
  },
  badge: {
    backgroundColor: "#FFDE59",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 14,
  },
});
