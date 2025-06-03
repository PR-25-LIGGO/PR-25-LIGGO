<<<<<<< Updated upstream
import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BottomNav from "@/components/BottomNav";

export default function EventsScreen() {
=======
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, BackHandler } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  listenToEvents,
  isUserAttending,
  toggleAttendance,
  listenToAttendeeCount,
} from "@/services/eventService";
import BottomNav from "@/components/BottomNav";

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [attendingIds, setAttendingIds] = useState<string[]>([]);
  const [attendeeCounts, setAttendeeCounts] = useState<{ [key: string]: number }>({});

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

  useEffect(() => {
    const unsubEventList = listenToEvents(async (data) => {
      setEvents(data);

      const attendanceResults = await Promise.all(
        data.map(async (event) => {
          const isAttending = await isUserAttending(event.id);
          return isAttending ? event.id : null;
        })
      );
      setAttendingIds(attendanceResults.filter(Boolean) as string[]);

      const unsubCountList = data.map((event) =>
        listenToAttendeeCount(event.id, (count) => {
          setAttendeeCounts((prev) => ({
            ...prev,
            [event.id]: count,
          }));
        })
      );

      return () => {
        unsubCountList.forEach((unsub) => unsub());
      };
    });

    return unsubEventList;
  }, []);

>>>>>>> Stashed changes
  return (
    <View style={styles.container}>
      {/* Logo arriba */}
      <Image source={require("@/assets/logo-liggo.png")} style={styles.logo} />

      <Text style={styles.title}>Eventos Cerca</Text>

      <View style={styles.eventCard}>
        <Image
          source={require("@/assets/evento1.png")}
          style={styles.eventImage}
        />
        <View style={styles.eventInfo}>
          <Text style={styles.eventName}>Go Evas</Text>
          <LinearGradient
            colors={["#4eff6a", "#ff87d2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Asistir</Text>
          </LinearGradient>
        </View>
      </View>

<<<<<<< Updated upstream
      <View style={styles.eventCard}>
        <Image
          source={require("@/assets/evento2.png")}
          style={styles.eventImage}
        />
        <View style={styles.eventInfo}>
          <Text style={styles.eventName}>Casa Estudio</Text>
          <LinearGradient
            colors={["#4eff6a", "#ff87d2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Asistir</Text>
          </LinearGradient>
        </View>
      </View>
=======
          const eventDate = new Date(`${event.date} ${event.time}`);
          const now = new Date();
          const endDate = new Date(eventDate.getTime() + 5 * 60 * 60 * 1000);
          const isOngoing = now >= eventDate && now <= endDate;
          const isUpcoming = now < eventDate;

          return (
            <View key={event.id} style={styles.eventCard}>
              <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
              <View style={styles.eventInfo}>
                <View>
                  <Text style={styles.eventName}>{event.title}</Text>
                  <Text style={styles.eventMeta}>
                    {isUpcoming
                      ? "Próximamente"
                      : isOngoing
                      ? "Evento en curso"
                      : `${event.date} · ${event.time}`}
                  </Text>
                  <Text style={styles.eventMeta}>{event.location}</Text>
                </View>

                <TouchableOpacity
                  onPress={async () => {
                    await toggleAttendance(event.id, isAttending);
                    setAttendingIds((prev) =>
                      isAttending
                        ? prev.filter((id) => id !== event.id)
                        : [...prev, event.id]
                    );
                  }}
                >
                  <LinearGradient
                    colors={isAttending ? ["#FF6C00", "#FF87D2"] : ["#4EFF6A", "#FF87D2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.buttonText}>
                      {isAttending ? "Quitar asistencia" : "Asistir"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.attendeeCount}>
                  {attendeeCounts[event.id] || 0} asistente(s)
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/events/create")}
      >
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
=======
  attendeeCount: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
>>>>>>> Stashed changes
  logo: {
    width: 160,
    height: 60,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  eventImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  eventInfo: {
    marginLeft: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  gradientButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});
