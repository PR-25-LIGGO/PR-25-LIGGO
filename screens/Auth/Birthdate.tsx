import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { auth } from "../../services/firebase";
import { db } from "../../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Alert } from "react-native";


export default function Birthdate() {
  const router = useRouter();
  const [birthdate, setBirthdate] = useState("");
  const handleBirthdateChange = (text: string) => {
    // Quitamos todo lo que no sea dígito
    const cleaned = text.replace(/\D/g, "");
  
    let formatted = cleaned;
  
    if (cleaned.length >= 3 && cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length >= 5 && cleaned.length <= 8) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }
  
    setBirthdate(formatted);
  };
  
  const handleContinue = async () => {
    if (!birthdate.trim()) {
      Alert.alert("Fecha requerida", "Por favor ingresa tu fecha de nacimiento");
      return;
    }
  
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Error", "No hay usuario autenticado");
      return;
    }
  
    try {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { birthdate }, { merge: true });
      router.push("/auth/gender");
    } catch (error: any) {
      Alert.alert("Error al guardar", error.message);
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
        <Text style={{ fontSize: 18 }}>◀</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Mi fecha de nacimiento</Text>

      <TextInput
        placeholder="DD /  MM  /  YYYY"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={birthdate}
        onChangeText={handleBirthdateChange}
        style={styles.input}
      />

      <Text style={styles.info}>Tu edad será pública</Text>

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
    marginBottom: 8,
    textAlign: "center",
  },
  info: {
    textAlign: "center",
    fontSize: 14,
    color: "#777",
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
