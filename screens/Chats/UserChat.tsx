import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { collection, addDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { id } = useLocalSearchParams(); // este es el ID del otro usuario

interface Message {
  id: string;
  text: string;
  from: string;
  to: string;
  timestamp: any;
}

export default function UserChat() {
  const { id } = useLocalSearchParams(); // id del otro usuario
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const chatId = userId && id ? [userId, id].sort().join("_") : null;

  useEffect(() => {
    AsyncStorage.getItem("userId").then(setUserId);
  }, []);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "matches", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setMessages(msgs);
    });

    return unsubscribe;
  }, [chatId]);

  const sendMessage = async () => {
    if (!message.trim() || !userId || !id || !chatId) return;

    await addDoc(collection(db, "matches", chatId, "messages"), {
      text: message,
      from: userId,
      to: id,
      timestamp: new Date(),
    });

    setMessage("");
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.from === userId;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: "white" }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  chatContainer: { padding: 12 },
  messageBubble: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: "75%",
  },
  myMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#E5E5EA",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    padding: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
});
