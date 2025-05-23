import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../services/firebase";
import { Alert } from "react-native";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email.endsWith("@est.univalle.edu")) {
      Alert.alert("Correo inválido", "Debes usar tu correo institucional");
      return;
    }
  
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Correo enviado",
        "Te hemos enviado un enlace para restablecer tu contraseña"
      );
      router.back();
    } catch (error: any) {
      let message = "Ocurrió un error al intentar recuperar la contraseña.";
  
      switch (error.code) {
        case "auth/user-not-found":
          message = "Este correo no está registrado en nuestra base de datos.";
          break;
        case "auth/invalid-email":
          message = "El formato del correo no es válido.";
          break;
        case "auth/too-many-requests":
          message = "Se ha solicitado la recuperación varias veces. Intenta más tarde.";
          break;
        default:
          message = error.message;
          break;
      }
  
      Alert.alert("Error", message);
    }
  };  

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
        <Text style={{ fontSize: 18 }}>◀</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Recuperar contraseña</Text>

      <TextInput
        placeholder="Correo institucional"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TouchableOpacity onPress={handleResetPassword} style={styles.buttonWrapper}>
        <LinearGradient
          colors={["#4eff6a", "#ff87d2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>ENVIAR CORREO</Text>
        </LinearGradient>
      </TouchableOpacity>
      <Text style={styles.note}>
  El correo puede tardar algunos minutos en llegar. Revisa tu bandeja de entrada y también el spam.
</Text>

    </View>
  );
}

import { useState } from "react";

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
  note: {
    fontSize: 14,
    color: "#888",
    marginVertical: 10,
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
