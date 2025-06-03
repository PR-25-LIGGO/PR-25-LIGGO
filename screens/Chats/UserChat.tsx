import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

interface Message {
  id: string;
  text: string;
  from: string;
  to: string;
  timestamp: any;
  seen?: boolean;
}

export default function UserChat() {
  const { chatId, name } = useLocalSearchParams();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [otherUserPhoto, setOtherUserPhoto] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);

  if (typeof chatId !== "string") return <Text>Error: chatId inválido</Text>;

  useEffect(() => {
    AsyncStorage.getItem("userId").then(setUserId);
  }, []);

  // Cargar foto del otro usuario
  useEffect(() => {
    async function fetchOtherUserPhoto() {
      if (!chatId || !userId) return;

      if (typeof chatId !== "string") {
        console.error("chatId debe ser string, no array");
        return;
      }

      const chatDoc = await getDoc(doc(db, "matches", chatId));

      if (!chatDoc.exists()) return;

      const usersId: string[] = chatDoc.data().usersId || [];
      const otherUserId = usersId.find((id) => id !== userId);
      if (!otherUserId) return;

      const userDoc = await getDoc(doc(db, "users", otherUserId));
      if (!userDoc.exists()) return;

      const photos: string[] = userDoc.data().photos || [];
      if (photos.length > 0) {
        setOtherUserPhoto(photos[0]);
      }
    }

    fetchOtherUserPhoto();
  }, [chatId, userId]);

  useEffect(() => {
    if (!chatId || !userId) return;

    const q = query(
      collection(db, "matches", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setMessages(msgs);

      for (const msg of msgs) {
        if (!msg.seen && msg.from !== userId) {
          const msgRef = doc(db, "matches", chatId, "messages", msg.id);
          await updateDoc(msgRef, { seen: true });
        }
      }
    });

    return unsubscribe;
  }, [chatId, userId]);

  const sendMessage = async () => {
    if (!message.trim() || !userId) return;

    try {
      await addDoc(collection(db, "matches", chatId, "messages"), {
        text: message,
        from: userId,
        to: "",
        timestamp: serverTimestamp(),
        seen: false,
      });
      setMessage("");
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.from === userId;
    const time = item.timestamp?.toDate?.()?.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          {time && <Text style={styles.time}>{time}</Text>}
          {isMe && <Text style={styles.checks}>{item.seen ? "✔✔" : "✔"}</Text>}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Modal para imagen ampliada */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <Image
            source={{ uri: otherUserPhoto || "" }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>

      {/* Encabezado con botón volver y foto */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Contenedor para foto y nombre, a la izquierda */}
        <View style={styles.leftContainer}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            {otherUserPhoto ? (
              <Image source={{ uri: otherUserPhoto }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.profilePlaceholder} />
            )}
          </TouchableOpacity>
          <Text style={styles.headerSubtitle}>{name || "Chat"}</Text>
        </View>


        {/* Espacio para balancear el header */}
        <View style={{ width: 28 }} />
      </View>


      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.chatContainer}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "90%",
    height: "70%",
    borderRadius: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40,  // como dices que quieres
    paddingBottom: 12,
    backgroundColor: "#FF6C00",
    paddingHorizontal: 12,
    position: "relative", // para que el centro pueda ser absoluto
  },
  backButton: {
    padding: 4,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 30,
    marginRight: 15,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#ccc",
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.9,
  },
  centerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    // Opcional para poner un poco más arriba:
    // top: 48,
  },
  headerMainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  chatContainer: {
    padding: 12,
    paddingBottom: 24,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginVertical: 6,
    maxWidth: "75%",
  },
  myMessage: {
    backgroundColor: "#FF6C00",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#FF87D2",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  time: {
    marginTop: 4,
    fontSize: 10,
    color: "#eee",
    alignSelf: "flex-end",
  },
  checks: {
    marginLeft: 4,
    marginTop: 4,
    color: "#eee",
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    padding: 8,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    color: "#000",
  },
  sendButton: {
    backgroundColor: "#FF6C00",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
