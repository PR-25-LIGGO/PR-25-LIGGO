import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { auth } from "../../services/firebase";
import { reload, sendEmailVerification } from "firebase/auth";

export default function VerifyCode() {
  const router = useRouter();

  const handleCheckVerification = async () => {
    try {
      await reload(auth.currentUser!); // Refresca el estado del usuario desde Firebase

      if (auth.currentUser?.emailVerified) {
        Alert.alert("Verificado", "Tu correo ha sido verificado correctamente");
        router.push("/auth/name"); // Continúa al flujo de completar datos
      } else {
        Alert.alert("No verificado", "Aún no has confirmado tu correo. Revisa tu bandeja de entrada o spam.");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleResendEmail = async () => {
    try {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await sendEmailVerification(auth.currentUser);
        Alert.alert("Correo reenviado", "Verifica tu bandeja de entrada y spam.");
      }
    } catch (error: any) {
      Alert.alert("Error al reenviar", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
        <Text style={{ fontSize: 18 }}>◀</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Verifica tu correo</Text>

      <Text style={styles.info}>
        Hemos enviado un enlace de verificación a tu correo institucional. Revisa tu bandeja de entrada o spam.
      </Text>

      <TouchableOpacity onPress={handleCheckVerification} style={styles.buttonWrapper}>
        <LinearGradient
          colors={["#4eff6a", "#ff87d2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>YA VERIFIQUÉ</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResendEmail} style={styles.resendButton}>
        <Text style={styles.resendText}>Reenviar correo de verificación</Text>
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
  resendButton: {
    marginTop: 20,
    padding: 10,
  },
  
  resendText: {
    color: "#888",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    fontSize: 20,
    textAlign: "center",
    marginBottom: 24,
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
