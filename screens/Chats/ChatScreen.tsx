import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import BottomNav from "@/components/BottomNav";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from "react-native";

interface Match {
  id: string;
  name: string;
  photo: string;
  matchDate: string;
}

interface User {
  id: string;
  name: string;
  photos: string[];
}

export default function ChatScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [chats, setChats] = useState<User[]>([]);
  const router = useRouter();

useFocusEffect(
  useCallback(() => {
    const fetchMatchesAndChats = async () => {
      try {
        const currentUserId = await AsyncStorage.getItem("userId");
        if (!currentUserId) throw new Error("Usuario no autenticado");

        // --- Fetch Matches
        const swipesRef = collection(db, "swipes");
        const qMatches = query(
          swipesRef,
          where("toUserId", "==", currentUserId),
          where("tipo", "==", "match")
        );
        const snapshotMatches = await getDocs(qMatches);

        const userMatches: Match[] = [];
        for (const docSnap of snapshotMatches.docs) {
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

        // --- Fetch Chats
        const matchesRef = collection(db, "matches");
        const qChats = query(matchesRef, where("usersId", "array-contains", currentUserId));
        const snapshotChats = await getDocs(qChats);

        const matchedUsers: User[] = [];

        for (const matchDoc of snapshotChats.docs) {
          const data = matchDoc.data();
          const usersId = data.usersId;
          const chatid = data.chatid;

          const otherUserId = usersId.find((id: string) => id !== currentUserId);
          if (!otherUserId) continue;

          const userDoc = await getDoc(doc(db, "users", otherUserId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            matchedUsers.push({
              id: chatid,
              name: userData.name,
              photos: userData.photos || [],
            });
          }
        }
        setChats(matchedUsers);
      } catch (error) {
        console.error("Error al cargar matches y chats:", error);
      }
    };

    const backAction = () => {
      router.replace("/auth/swipe-screen");
      return true;
    };

    fetchMatchesAndChats();
    BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", backAction);
    };
  }, [])
);


  const goToChat = (chatId: string, name: string) => {
    router.push({
      pathname: '/chats/UserChat/[chatId]',
      params: { chatId, name }
    });
  };

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

          {chats.length > 0 ? (
            chats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={styles.chatItem}
                onPress={() => goToChat(chat.id, chat.name)}
              >
                <Image
                  source={{ uri: chat.photos[0] || "https://randomuser.me/api/portraits/lego/2.jpg" }}
                  style={styles.avatar}
                />
                <View style={styles.chatContent}>
                  <Text style={styles.chatName}>{chat.name}</Text>
                  <Text style={styles.chatPreview}>Último mensaje o resumen</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noMatches}>No tienes mensajes recientes</Text>
          )}
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
    backgroundColor: "#FFF",
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

  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
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
});
