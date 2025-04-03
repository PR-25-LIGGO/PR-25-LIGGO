import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function ErrorAccount() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backArrow} onPress={() => router.back()}>
        <Text style={{ fontSize: 18 }}>◀</Text>
      </TouchableOpacity>

      <Image
        source={require("@/assets/logo-liggo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.subtitle}>
        No pudimos encontrar tu cuenta de liggo, crea una cuenta
      </Text>

      <TouchableOpacity onPress={() => router.push("/auth/register")}>
        <LinearGradient
          colors={["#A8EB12", "#F6A1F2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Crear nueva cuenta</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  backArrow: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  logo: {
    width: 150,
    height: 100,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  button: {
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
});
