import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <LinearGradient
  colors={["rgba(78, 255, 106, 0.6)", "rgba(255, 135, 210, 0.6)"]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={styles.footer}
>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => router.push("/auth/swipe-screen")}
      >
        <Ionicons
          name="home"
          size={28}
          color={pathname === "/auth/swipe-screen" ? "#4eff6a" : "gray"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => router.push("/events/events-screen")}
      >
        <Ionicons
          name="calendar"
          size={28}
          color={pathname === "/events/events-screen" ? "#ff87d2" : "gray"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => router.push("/chats/chats-screen")}
      >
        <Ionicons
          name="chatbubbles"
          size={28}
          color={pathname === "/chats/chats-screen" ? "#4eff6a" : "gray"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => router.push("/profile/user-profile-screen")}
      >
        <Ionicons
          name="person"
          size={28}
          color={pathname === "/profile/user-profile-screen" ? "#ff87d2" : "gray"}
        />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
  },
  iconContainer: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 4,
  },
});
