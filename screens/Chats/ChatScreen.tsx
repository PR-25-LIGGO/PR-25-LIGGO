<<<<<<< Updated upstream
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
=======
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  BackHandler,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
>>>>>>> Stashed changes
import BottomNav from "@/components/BottomNav";

export default function ChatsScreen() {
    return (
        <View style={styles.container}>
            {/* Logo arriba */}
            <Image
                source={require("@/assets/logo-liggo.png")}
                style={styles.logo}
                resizeMode="contain"
            />

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* Matches */}
                <Text style={styles.sectionTitle}>New matches</Text>
                <View style={styles.matchRow}>
                    <Image
                        source={require("@/assets/match-icon.png")}
                        style={styles.matchImage}
                    />
                    <View style={{ marginLeft: 12 }}>
                        <Text style={styles.matchLabel}>99+ likes</Text>
                    </View>
                </View>



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

<<<<<<< Updated upstream
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
    matchCard: {
        alignItems: "center",
        marginBottom: 20,
    },
    matchRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    matchImage: {
        width: 100,
        height: 140,
        borderRadius: 12,
    },

    matchLabel: {
        fontWeight: "500",
        fontSize: 14,
    },
    chatItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingBottom: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
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
=======
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
      pathname: "/chats/UserChat/[chatId]",
      params: { chatId, name },
    });
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/auth/swipe-screen");
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  return (
    <>
      <View style={styles.container}>
        {/* Header con logo */}
        <View style={styles.header}>
          <Image
            source={require("@/assets/logo-liggo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
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
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>No tienes matches aún</Text>
          }
        />
      </View>

      <BottomNav />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 160,
    height: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
  },
});
>>>>>>> Stashed changes
