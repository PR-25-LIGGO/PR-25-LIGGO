import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    SafeAreaView,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import {
    toggleAttendance,
    listenToAttendeeCount,
    listenToUserAttendance,
} from "@/services/eventService";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";

export default function EventDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAttending, setIsAttending] = useState(false);
    const [attendeeCount, setAttendeeCount] = useState(0);

    // Cargar evento y suscriptores en cada enfoque
    useFocusEffect(
        useCallback(() => {
            let unsubCount: (() => void) | null = null;
            let unsubUser: (() => void) | null = null;

            const fetch = async () => {
                if (!id) return;

                const docRef = doc(db, "events", id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setEvent({ id: docSnap.id, ...docSnap.data() });
                }

                unsubCount = listenToAttendeeCount(id as string, (count) => {
                    setAttendeeCount(count);
                });

                const uid = auth.currentUser?.uid;
                if (uid) {
                    unsubUser = listenToUserAttendance(
                        id as string,
                        uid,
                        (attending: boolean) => {
                            setIsAttending(attending);
                        }
                    );
                }

                setLoading(false);
            };

            fetch();

            return () => {
                unsubCount?.();
                unsubUser?.();
            };
        }, [id])
    );

    const handleToggleAttendance = async () => {
        if (!id) return;
        await toggleAttendance(id as string, isAttending);
        // ❌ No pongas: setIsAttending(!isAttending);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FF6C00" />
            </View>
        );
    }

    if (!event) {
        return (
            <View style={styles.center}>
                <Text>Evento no encontrado</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Logo Liggo */}
                <Image
                    source={require("@/assets/logo-liggo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />

                {/* Botón de volver */}
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={26} color="#333" />
                </TouchableOpacity>

                {/* Imagen del evento */}
                <Image source={{ uri: event.imageUrl }} style={styles.image} />

                <Text style={styles.title}>{event.title}</Text>

                <View style={styles.metaRow}>
                    <Ionicons name="location-sharp" size={18} color="#FF6C00" />
                    <Text style={styles.metaText}>{event.location}</Text>
                </View>

                <View style={styles.metaRow}>
                    <Ionicons name="calendar" size={18} color="#FF6C00" />
                    <Text style={styles.metaText}>
                        {event.date} - {event.time}
                    </Text>
                </View>

                <Text style={styles.attendeeCount}>{attendeeCount} asistente(s)</Text>

                {/* Botón de asistencia */}
                <TouchableOpacity onPress={handleToggleAttendance}>
                    <LinearGradient
                        colors={isAttending ? ["#FF6C00", "#FF87D2"] : ["#4EFF6A", "#FF87D2"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.assistButton}
                    >
                        <Text style={styles.assistText}>
                            {isAttending ? "Quitar asistencia" : "Asistir"}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        padding: 24,
        paddingBottom: 60,
        marginTop: 20,
        backgroundColor: "#fff",
        flexGrow: 1,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: 160,
        height: 60,
        alignSelf: "center",
        marginBottom: 10,
    },
    backButton: {
        marginBottom: 10,
        alignSelf: "flex-start",
    },
    image: {
        width: "100%",
        height: 220,
        borderRadius: 12,
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#FF6C00",
        marginBottom: 10,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    metaText: {
        marginLeft: 6,
        fontSize: 16,
        color: "#555",
    },
    assistButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        alignItems: "center",
        alignSelf: "center",
        marginTop: 24,
    },
    assistText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    attendeeCount: {
        marginTop: 20,
        fontSize: 14,
        color: "#888",
        textAlign: "center",
    },
});
