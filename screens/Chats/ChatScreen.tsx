import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  name: string;
  photos: string[];
}

export default function ChatScreen() {
  const [matches, setMatches] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchMatches = async () => {
      const currentUserId = await AsyncStorage.getItem("userId");
      if (!currentUserId) return;

      const matchesRef = collection(db, "matches");
      const q = query(matchesRef, where("usersId", "array-contains", currentUserId));
      const querySnapshot = await getDocs(q);

      const matchedUsers: User[] = [];

      for (const matchDoc of querySnapshot.docs) {
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

      setMatches(matchedUsers);
    };

    fetchMatches();
  }, []);

const goToChat = (chatId: string, name: string) => {
  router.push({
    pathname: '/chats/UserChat/[chatId]',
    params: { chatId, name }
  });
};

  return (
    <View style={styles.container}>
      {/* Header con logo */}
      <View style={styles.header}>
        <Image
          source={require("@/assets/logo-liggo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* Puedes agregar botones aquí si quieres */}
      </View>

      <Text style={styles.title}>Tus Matches</Text>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => goToChat(item.id, item.name)}>
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No tienes matches aún</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 60 },
  header: { height: 60, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  logo: { width: 160, height: 40 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  card: {
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: { fontSize: 18 },
});
