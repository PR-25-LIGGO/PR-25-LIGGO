import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BottomNav from "@/components/BottomNav";

export default function EventsScreen() {
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
