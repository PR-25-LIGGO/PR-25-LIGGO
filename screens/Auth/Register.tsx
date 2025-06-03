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
<<<<<<< Updated upstream
=======
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { sendEmailVerification } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
>>>>>>> Stashed changes

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

<<<<<<< Updated upstream
=======
  const validatePassword = (pwd: string) => {
    if (pwd.length < 6) return false;
    if (!/[A-Z]/.test(pwd)) return false;
    return true;
  };

  const handleRegister = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirm.trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedConfirm) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    if (!trimmedEmail.endsWith("@est.univalle.edu")) {
      Alert.alert("Correo inválido", "Usa tu correo institucional (@est.univalle.edu)");
      return;
    }

    if (!validatePassword(trimmedPassword)) {
      Alert.alert(
        "Contraseña inválida",
        "La contraseña debe tener al menos 6 caracteres y contener al menos una letra mayúscula."
      );
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      Alert.alert("Contraseñas no coinciden", "Revisa que ambas contraseñas sean iguales");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      const user = userCredential.user;

      await sendEmailVerification(user);

      Alert.alert(
        "Verificación enviada",
        "Hemos enviado un enlace de verificación a tu correo. Revisa tu bandeja de entrada o spam."
      );

      await setDoc(doc(db, "users", user.uid), {
        createdAt: new Date().toISOString(),
      });

      router.push("/auth/verify-code");
    } catch (error: any) {
      Alert.alert("Error al registrarse", error.message);
    }
  };

>>>>>>> Stashed changes
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
        <Text style={{ fontSize: 18 }}>◀</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Registro</Text>

      <TextInput
        placeholder="Nombre completo"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Correo institucional"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={[styles.input, { flex: 1 }]}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="#333"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Repetir contraseña"
          placeholderTextColor="#999"
          secureTextEntry={!showConfirm}
          value={confirm}
          onChangeText={setConfirm}
          style={[styles.input, { flex: 1 }]}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          <Ionicons
            name={showConfirm ? "eye-off" : "eye"}
            size={24}
            color="#333"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push("/auth/verify-code")} style={styles.buttonWrapper}>
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
    marginBottom: 24,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
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
