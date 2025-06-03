import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { auth, db } from "../../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Alert } from "react-native";

export default function Birthdate() {
  const router = useRouter();

  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios"); // en Android se oculta tras elegir
    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  const handleContinue = async () => {
    if (!birthdate) {
      Alert.alert("Fecha requerida", "Por favor selecciona tu fecha de nacimiento");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Error", "No hay usuario autenticado");
      return;
    }

    try {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { birthdate: birthdate.toISOString() }, { merge: true });
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

      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={styles.dateInput}
      >
        <Text style={{ color: birthdate ? "#000" : "#999", fontSize: 18 }}>
          {birthdate ? formatDate(birthdate) : "Selecciona tu fecha"}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={birthdate || new Date(2000, 0, 1)} // fecha por defecto si no hay
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()} // no puede ser futuro
          onChange={handleChange}
        />
      )}

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
  dateInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 16,
    marginBottom: 8,
    alignItems: "center",
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
