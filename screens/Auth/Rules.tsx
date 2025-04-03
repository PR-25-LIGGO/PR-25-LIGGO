// screens/Auth/Rules.tsx
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function Rules() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
        <Text style={{ fontSize: 18 }}>◀</Text>
      </TouchableOpacity>

      <Image
        source={require("@/assets/logo-liggo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Bienvenido a Liggo.</Text>
      <Text style={styles.subtitle}>Porfavor respetar las reglas de usuarios</Text>

      <View style={styles.rulesContainer}>
        <Text style={styles.rule}>✔️ <Text style={styles.bold}>Sé tú mismo</Text>{'\n'}Asegúrate de mostrar fotos e intereses que te reflejen</Text>
        <Text style={styles.rule}>✔️ <Text style={styles.bold}>Mantente seguro</Text>{'\n'}No compartas información personal sin conocer a la persona</Text>
        <Text style={styles.rule}>✔️ <Text style={styles.bold}>Respeta a los demás</Text>{'\n'}Mantén el respeto con los demás usuarios</Text>
        <Text style={styles.rule}>✔️ <Text style={styles.bold}>Sé proactivo</Text>{'\n'}Reporta cualquier inconveniente</Text>
      </View>

      <TouchableOpacity onPress={() => router.push("/auth/swipe-screen")} style={styles.buttonWrapper}>
        <LinearGradient
          colors={["#4eff6a", "#ff87d2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>ACEPTO</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  backArrow: {
    position: "absolute",
    top: 60,
    left: 24,
  },
  logo: {
    width: 120,
    height: 60,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  rulesContainer: {
    marginBottom: 30,
    gap: 20,
  },
  rule: {
    fontSize: 14,
    color: "#555",
  },
  bold: {
    fontWeight: "bold",
  },
  buttonWrapper: {
    alignItems: "center",
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
