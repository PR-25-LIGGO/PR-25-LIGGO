import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  BackHandler
} from "react-native";
import { auth, db } from "@/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

interface UserProfile {
  name?: string;
  career?: string;
  birthdate?: string;
  gender?: string;
  interests?: string[];
  photos?: string[];
}

export default function UserProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useFocusEffect(
  React.useCallback(() => {
    const onBackPress = () => {
      router.replace("/auth/swipe-screen");
      return true;
    };

    const fetchUserProfile = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setUserProfile(null);
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile(); // 🔁 Se llama cada vez que se enfoca la pantalla

    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, [])
);


  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.replace("/auth/swipe-screen");
        return true;
      };
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  const calculateAge = (birthdate?: string): number | null => {
    if (!birthdate) return null;
    const parts = birthdate.split("/");
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const birthDateObj = new Date(year, month, day);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(userProfile?.birthdate);

  const openLogoutModal = () => {
    setModalVisible(true);
  };

  const closeLogoutModal = () => {
    setModalVisible(false);
  };

  const handleLogout = async () => {
    await auth.signOut();
    setModalVisible(false);
    router.replace("/auth/login-landing");
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4eff6a" />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se pudo cargar el perfil.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 160 }}>
        <Image
          source={require("@/assets/logo-liggo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.profileTopSection}>
          {userProfile.photos && userProfile.photos.length > 0 ? (
            <View style={styles.photoWrapper}>
              <Image source={{ uri: userProfile.photos[0] }} style={styles.photo} />
            </View>
          ) : (
            <View style={[styles.photoWrapper, { justifyContent: "center" }]}>
              <Text style={{ color: "#999" }}>Sin foto</Text>
            </View>
          )}

          <Text style={styles.name}>
  {userProfile.name || "Nombre no disponible"}
  {age !== null ? `, ${age}` : ""}
</Text>


          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.actionButtonEdit}
              onPress={() => router.push("/profile/edit")}
            >
              <Ionicons name="create-outline" size={30} color="#999" />
              <Text style={styles.actionButtonLabel}>Editar perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButtonEdit} onPress={openLogoutModal}>
              <Ionicons name="log-out-outline" size={30} color="#999" />
              <Text style={styles.actionButtonLabel}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileBottomSection}>
          {userProfile.career && <Text style={styles.detail}>🏠 {userProfile.career}</Text>}
          {userProfile.gender && <Text style={styles.detail}>👤 {userProfile.gender}</Text>}
          {userProfile.interests && userProfile.interests.length > 0 && (
            <>
              <Text style={styles.subTitle}>Intereses</Text>
              <View style={styles.interestsContainer}>
                {userProfile.interests.map((interest, i) => (
                  <View key={i} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {userProfile.photos && userProfile.photos.length > 1 && (
            <View style={styles.galleryContainer}>
              {userProfile.photos.slice(1).map((photo, idx) => (
                <Image key={idx} source={{ uri: photo }} style={styles.galleryImage} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNav />

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={closeLogoutModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cerrar sesión</Text>
            <Text style={styles.modalText}>¿Estás seguro que deseas cerrar sesión?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={closeLogoutModal}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleLogout}>
                <Text style={styles.modalConfirmText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  logo: {
    width: 160,
    height: 60,
    alignSelf: "center",
    marginBottom: 24,
  },
  profileTopSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  photoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#FF66C4",
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 12,
    color: "#333",
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 40,
  },
  actionButtonEdit: {
    alignItems: "center",
  },
  actionButtonLabel: {
    color: "#999",
    fontWeight: "600",
    marginTop: 6,
    fontSize: 14,
  },
  profileBottomSection: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 24,
    width: "100%",
  },
  detail: {
    fontSize: 16,
    color: "#555",
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#C62828",
    textAlign: "center",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  interestTag: {
    borderWidth: 1,
    borderColor: "green",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  interestText: {
    color: "#333",
    fontWeight: "bold",
    fontStyle: "italic",
  },
  galleryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
    gap: 10,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    flex: 1,
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "red",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 20,
  },
  modalButtonCancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
  modalCancelText: {
    color: "#555",
    fontWeight: "bold",
  },
  modalButtonConfirm: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#4eff6a",
  },
  modalConfirmText: {
    color: "#fff",
    fontWeight: "bold",
  },
});