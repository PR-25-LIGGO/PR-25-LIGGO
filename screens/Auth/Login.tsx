import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Campos vacíos", "Ingresa tu correo y contraseña");
      return;
    }

    if (!email.endsWith("@est.univalle.edu")) {
      Alert.alert("Correo inválido", "Debes usar tu correo institucional");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar el UID en AsyncStorage
      await AsyncStorage.setItem("userId", user.uid);

      Alert.alert("Bienvenido", "Sesión iniciada con éxito");
      router.push("/auth/swipe-screen");
    } catch (error: any) {
      Alert.alert("Error al iniciar sesión", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
        <Text style={{ fontSize: 18 }}>◀</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Iniciar sesión</Text>

      <TextInput
        placeholder="Correo institucional"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Contraseña"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity onPress={() => router.push("/auth/forgot")}>
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogin} style={styles.buttonWrapper}>
        <LinearGradient
          colors={["#4eff6a", "#ff87d2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>INGRESAR</Text>
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
    marginBottom: 24,
  },
  forgotText: {
    textAlign: "center",
    fontSize: 13,
    color: "#777",
    marginBottom: 40,
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
