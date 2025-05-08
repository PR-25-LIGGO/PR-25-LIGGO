import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const unsubEventList = listenToEvents(async (data) => {
      setEvents(data);

      // Verificar asistencia por evento
      const attendanceResults = await Promise.all(
        data.map(async (event) => {
          const isAttending = await isUserAttending(event.id);
          return isAttending ? event.id : null;
        })
      );
      setAttendingIds(attendanceResults.filter(Boolean) as string[]);

      // Escuchar en tiempo real el contador por evento
      const unsubCountList = data.map((event) =>
        listenToAttendeeCount(event.id, (count) => {
          setAttendeeCounts((prev) => ({
            ...prev,
            [event.id]: count,
          }));
        })
      );

      // Limpiar listeners al desmontar
      return () => {
        unsubCountList.forEach((unsub) => unsub());
      };
    });

    return unsubEventList;
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/logo-liggo.png")} style={styles.logo} />
      <Text style={styles.title}>Eventos Cerca</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {events.map((event) => {
          const isAttending = attendingIds.includes(event.id);

          const eventDate = new Date(`${event.date} ${event.time}`);
          const now = new Date();
          const endDate = new Date(eventDate.getTime() + 5 * 60 * 60 * 1000);
          const isOngoing = now >= eventDate && now <= endDate;

          return (
            <View key={event.id} style={styles.eventCard}>
              <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
              <View style={styles.eventInfo}>
                <View>
                  <Text style={styles.eventName}>{event.title}</Text>
                  <Text style={styles.eventMeta}>
                    {isOngoing ? "Evento en curso" : `${event.date} · ${event.time}`}
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
                    // No hace falta actualizar el contador manualmente
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
  attendeeCount: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  
  logo: {
    width: 160,
    height: 60,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
  },
  eventImage: {
    width: 90,
    height: 90,
  },
  eventInfo: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  eventName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  eventMeta: {
    fontSize: 12,
    color: "#666",
  },
  gradientButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-end",
    marginTop: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  addButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#FF6C00",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
  },
});
