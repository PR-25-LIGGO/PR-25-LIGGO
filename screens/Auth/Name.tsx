import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { auth, db } from "../../services/firebase";
import { doc, setDoc } from "firebase/firestore";

const CAREERS = [
  "Arquitectura", "Ingeniería Civil", "Medicina", "Odontología", "Psicología",
  "Derecho", "Administración de Empresas", "Contaduría Pública",
  "Ingeniería de Sistemas", "Ingeniería Electrónica", "Ingeniería Industrial",
  "Diseño Gráfico", "Comunicación Social", "Publicidad y Marketing",
  "Trabajo Social", "Educación", "Veterinaria", "Biotecnología",
  "Fisioterapia", "Bioquímica", "Ciencias Políticas", "Antropología",
  "Arquitectura de Interiores", "Nutrición", "Turismo y Hotelería",
  "Enfermería", "Finanzas", "Relaciones Internacionales", "Criminología",
  "Arte y Cultura"
];

export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);

  const handleContinue = async () => {
    if (name.length > 60) {
      Alert.alert("Nombre demasiado largo", "El nombre no puede superar los 60 caracteres.");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Nombre requerido", "Por favor ingresa tu nombre completo");
      return;
    }

    if (!selectedCareer) {
      Alert.alert("Carrera requerida", "Por favor selecciona tu carrera");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Error", "No hay usuario autenticado");
      return;
    }

    try {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { name, career: selectedCareer }, { merge: true });
      router.push("/auth/birthday");
    } catch (error: any) {
      Alert.alert("Error al guardar", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={60}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 100,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
          <Text style={{ fontSize: 18 }}>◀</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Mi nombre es:</Text>
        <TextInput
          placeholder="Nombre Apellido"
          placeholderTextColor="#999"
          value={name}
          onChangeText={(text) => {
            const cleaned = text
              .replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, "") // solo letras y espacios
              .replace(/\s{2,}/g, " ")                 // máximo un espacio
              .trimStart();                            // evitar espacio inicial

            if (cleaned.length <= 60) setName(cleaned);
          }}

          style={styles.input}
          returnKeyType="done"
        />

        <Text style={styles.title}>Selecciona tu carrera:</Text>
        <View style={styles.tagsContainer}>
          {CAREERS.map((career) => (
            <TouchableOpacity
              key={career}
              style={[styles.tag, selectedCareer === career && styles.selectedTag]}
              onPress={() => setSelectedCareer(career)}
            >
              <Text style={[styles.tagText, selectedCareer === career && styles.selectedTagText]}>
                {career}
              </Text>
            </TouchableOpacity>
          ))}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  backArrow: {
    position: "absolute",
    top: 60,
    left: 24,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    rowGap: 10,
  },
  tag: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 30,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  selectedTag: {
    borderColor: "#a855f7",
  },
  tagText: {
    fontSize: 13,
    color: "#333",
  },
  selectedTagText: {
    color: "#a855f7",
    fontWeight: "bold",
  },
  buttonWrapper: {
    marginTop: 30,
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
