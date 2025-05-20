import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import BottomNav from "@/components/BottomNav";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

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

          // Obtener la información del usuario que hizo el match
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
      <Image
        source={require("@/assets/logo-liggo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Matches */}
        <Text style={styles.sectionTitle}>New Matches</Text>
        {matches.length > 0 ? (
          matches.map((match) => (
            <TouchableOpacity 
  key={match.id} 
  style={styles.matchRow} 
onPress={() => router.push(`/profile/profile-screen?id=${match.id}`)}
>
  <Image
    source={{ uri: match.photo }}
    style={styles.avatar}
  />
  <View style={{ marginLeft: 12 }}>
    <Text style={styles.matchLabel}>{match.name}</Text>
    <Text style={styles.matchDate}>{match.matchDate}</Text>
  </View>
</TouchableOpacity>

          ))
        ) : (
          <Text style={styles.noMatches}>No tienes nuevos matches</Text>
        )}

        {/* Messages */}
        <Text style={styles.sectionTitle}>Messages</Text>
        <View style={styles.chatItem}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/women/81.jpg" }}
            style={styles.avatar}
          />
          <View style={styles.chatContent}>
            <Text style={styles.chatName}>Sachia</Text>
            <Text style={styles.chatPreview}>Recently active, match now!</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Likes You</Text>
          </View>
        </View>

        <View style={styles.chatItem}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/women/82.jpg" }}
            style={styles.avatar}
          />
          <View style={styles.chatContent}>
            <Text style={styles.chatName}>Shain</Text>
            <Text style={styles.chatPreview}>Hey, what's up with dog pics?</Text>
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
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  logo: {
    width: 160,
    height: 60,
    alignSelf: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  matchLabel: {
    fontWeight: "500",
    fontSize: 14,
  },
  matchDate: {
    fontSize: 12,
    color: "#555",
  },
  noMatches: {
    fontSize: 14,
    color: "#777",
    marginBottom: 10,
    textAlign: "center",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatName: {
    fontWeight: "bold",
    fontSize: 15,
  },
  chatPreview: {
    fontSize: 13,
    color: "#666",
  },
  badge: {
    backgroundColor: "#FCD34D",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
});
