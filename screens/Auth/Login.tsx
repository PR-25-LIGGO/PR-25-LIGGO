import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Función para eliminar espacios al escribir
  const handleEmailChange = (text: string) => {
    setEmail(text.replace(/\s/g, ""));
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text.replace(/\s/g, ""));
  };

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

      switch (error.code) {
        case "auth/wrong-password":
          Alert.alert("Contraseña incorrecta", "La contraseña que ingresaste es incorrecta.");
          break;
        case "auth/user-not-found":
          Alert.alert("Usuario no encontrado", "No existe una cuenta con este correo.");
          break;
        case "auth/invalid-email":
          Alert.alert("Correo inválido", "El correo electrónico no tiene un formato válido.");
          break;
          case "auth/invalid-credential":
          Alert.alert("Contraseña incorrecta");
          break;
        default:
          Alert.alert("Error al iniciar sesión", error.message);
      }
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
        onChangeText={handleEmailChange}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={handlePasswordChange}
          style={[styles.input, { flex: 1 }]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="#999"
          />
        </TouchableOpacity>
      </View>

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
    color: "#000",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyeButton: {
    paddingHorizontal: 8,
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
