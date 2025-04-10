import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { auth } from "../../services/firebase";
import { db } from "../../services/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { Alert } from "react-native";


export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert("Nombre requerido", "Por favor ingresa tu nombre completo");
      return;
    }
  
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Error", "No hay usuario autenticado");
      return;
    }
  
    try {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { name }, { merge: true }); // merge evita sobrescribir
      router.push("/auth/birthday"); // Avanza a la siguiente pantalla
    } catch (error: any) {
      Alert.alert("Error al guardar", error.message);
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
        <Text style={{ fontSize: 18 }}>◀</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Mi nombre es:</Text>

      <TextInput
        placeholder="Nombre Apellido"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Text style={styles.note}>
        Es recomendable poner nombre completo, igual se puede cambiar más adelante
      </Text>

      <TouchableOpacity onPress={handleContinue} style={styles.buttonWrapper}>
        <LinearGradient
          colors={["#4eff6a", "#ff87d2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>CONTINUAR</Text>
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  note: {
    fontSize: 12,
    color: "#666",
    marginBottom: 30,
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
