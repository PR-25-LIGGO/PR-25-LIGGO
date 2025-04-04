import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
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
