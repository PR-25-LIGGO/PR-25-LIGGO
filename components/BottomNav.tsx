import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push("/auth/swipe-screen")}>
                <Ionicons name="home" size={32} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/events/events-screen")}>
                <Ionicons name="calendar" size={32} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/chats/chats-screen")}>
                <Ionicons name="chatbubbles" size={32} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/profile/profile-screen")}>
                <Ionicons name="person" size={32} color="gray" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 10,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
});
