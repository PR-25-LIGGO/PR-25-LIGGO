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
    <Image
      source={require("@/assets/logo-liggo.png")}
      style={styles.logo}
      resizeMode="contain"
    />
    <Text style={styles.title}>🎉 Eventos Cerca</Text>
    

    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
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
                  {isOngoing ? "🟢 En curso" : `📅 ${event.date} · 🕒 ${event.time}`}
                </Text>
                <Text style={styles.eventMeta}>📍 {event.location}</Text>
              </View>

              <TouchableOpacity
                onPress={async () => {
                  await toggleAttendance(event.id, isAttending);
                  setAttendingIds((prev) =>
                    isAttending ? prev.filter((id) => id !== event.id) : [...prev, event.id]
                  );
                }}
              >
                <LinearGradient
                  colors={isAttending ? ["#FF6C00", "#FF87D2"] : ["#4EFF6A", "#3DDC84"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>
                    {isAttending ? "❌ Quitar asistencia" : "✅ Asistir"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.attendeeCount}>
                👥 {attendeeCounts[event.id] || 0} asistente(s)
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>

    <TouchableOpacity style={styles.addButton} onPress={() => router.push("/events/create")}>
      <Text style={styles.addButtonText}>＋</Text>
    </TouchableOpacity>

    <BottomNav />
  </View>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFF8",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  logo: {
    width: 140,
    height: 90,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3DDC84",
    textAlign: "center",
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 16,
    shadowColor: "blue",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 6,
    overflow: "hidden",
    
  },
  eventImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  eventInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  eventName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  eventMeta: {
    fontSize: 12,
    color: "#666",
  },
  gradientButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignSelf: "flex-end",
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  attendeeCount: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  addButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#3DDC84",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 9,
  },
  addButtonText: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: '#DC2D22',
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
