import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function Register() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Actualización sin espacios
  const onChangeEmail = (text: string) => {
    setEmail(text.replace(/\s/g, ""));
  };

  const onChangePassword = (text: string) => {
    setPassword(text.replace(/\s/g, ""));
  };

  const onChangeConfirm = (text: string) => {
    setConfirm(text.replace(/\s/g, ""));
  };

  // Validación de contraseña fuerte
  const validatePassword = (password: string) => {
    const uppercaseRegex = /[A-Z]/;
    const numberRegex = /\d/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    return uppercaseRegex.test(password) && numberRegex.test(password) && specialCharRegex.test(password);
  };

  const handleRegister = async () => {
    if (!email || !password || !confirm) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    if (email.includes(" ")) {
      Alert.alert("Correo inválido", "El correo no puede contener espacios");
      return;
    }

    if (password.includes(" ") || confirm.includes(" ")) {
      Alert.alert("Contraseña inválida", "La contraseña no puede contener espacios");
      return;
    }

    if (!email.endsWith("@est.univalle.edu")) {
      Alert.alert("Correo inválido", "Usa tu correo institucional (@est.univalle.edu)");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Contraseñas no coinciden", "Revisa que ambas contraseñas sean iguales");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(
        "Contraseña débil",
        "La contraseña debe contener al menos una letra mayúscula, un número y un carácter especial."
      );
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Enviar verificación de correo electrónico
      await sendEmailVerification(user);

      Alert.alert(
        "Verificación enviada",
        "Hemos enviado un enlace de verificación a tu correo. Revisa tu bandeja de entrada o spam."
      );

      // Guardamos los datos en Firestore
      await setDoc(doc(db, "users", user.uid), {
        createdAt: new Date().toISOString(),
      });

      router.push("/auth/verify-code"); 
    } catch (error: any) {
      Alert.alert("Error al registrarse", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
        <Text style={{ fontSize: 18 }}>◀</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Registro</Text>

      <TextInput
        placeholder="Correo institucional"
        placeholderTextColor="#999"
        value={email}
        onChangeText={onChangeEmail}
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
          onChangeText={onChangePassword}
          style={[styles.input, { flex: 1 }]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.eye}>{showPassword ? "🙈" : "👁"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Repetir contraseña"
          placeholderTextColor="#999"
          secureTextEntry={!showConfirm}
          value={confirm}
          onChangeText={onChangeConfirm}
          style={[styles.input, { flex: 1 }]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          <Text style={styles.eye}>{showConfirm ? "🙈" : "👁"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleRegister} style={styles.buttonWrapper}>
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
  eye: {
    fontSize: 20,
    marginLeft: 10,
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