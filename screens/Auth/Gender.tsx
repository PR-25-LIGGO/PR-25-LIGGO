import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { auth } from "../../services/firebase";
import { db } from "../../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Alert } from "react-native";


export default function Gender() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const handleContinue = async () => {
    if (!selected) {
      Alert.alert("Selecciona una opción", "Debes elegir un género para continuar");
      return;
    }
  
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Error", "No hay usuario autenticado");
      return;
    }
  
    try {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, {
        gender: selected,
        showGender: show,
      }, { merge: true });
  
      router.push("/auth/interest"); // o la siguiente pantalla
    } catch (error: any) {
      Alert.alert("Error al guardar", error.message);
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
        <Text style={{ fontSize: 18 }}>◀</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Género</Text>

      {["MUJER", "HOMBRE", "OTRO"].map((gender) => (
        <TouchableOpacity
          key={gender}
          style={[styles.genderButton, selected === gender && styles.selected]}
          onPress={() => setSelected(gender)}
        >
          <Text style={[styles.genderText, selected === gender && styles.selectedText]}>
            {gender}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.checkboxContainer}>
        <BouncyCheckbox
          size={20}
          fillColor="#a855f7"
          unFillColor="#fff"
          isChecked={show}
          onPress={() => setShow(!show)}
        />
        <Text style={styles.checkboxLabel}>Mostrar mi género en el perfil</Text>
      </View>

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
  genderButton: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  selected: {
    backgroundColor: "#f2f2f2",
  },
  genderText: {
    fontSize: 16,
    color: "#444",
  },
  selectedText: {
    fontWeight: "bold",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  checkboxLabel: {
    marginLeft: 0,
    color: "#777",
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
