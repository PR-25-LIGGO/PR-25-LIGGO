import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const INTERESTS = [
  "Arquitectura",
  "Ingeniería Civil",
  "Medicina",
  "Odontología",
  "Psicología",
  "Derecho",
  "Administración de Empresas",
  "Contaduría Pública",
  "Ingeniería de Sistemas",
  "Ingeniería Electrónica",
  "Ingeniería Industrial",
  "Diseño Gráfico",
  "Comunicación Social",
  "Publicidad y Marketing",
  "Trabajo Social",
  "Educación",
  "Veterinaria",
  "Biotecnología",
  "Fisioterapia",
  "Bioquímica",
  "Ciencias Políticas",
  "Antropología",
  "Arquitectura de Interiores",
  "Nutrición",
  "Turismo y Hotelería",
  "Enfermería",
  "Finanzas",
  "Relaciones Internacionales",
  "Criminología",
  "Arte y Cultura",
];

export default function EditProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar datos actuales
  useEffect(() => {
    async function loadUserData() {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("Usuario no autenticado");

        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setSelectedInterests(data.interests || []);
        }
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, []);

  // Seleccionar o quitar interés
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Guardar nombre e intereses
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Nombre requerido", "Por favor ingresa tu nombre completo");
      return;
    }

    try {
      setSaving(true);
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Usuario no autenticado");

      await setDoc(doc(db, "users", uid), { name, interests: selectedInterests }, { merge: true });

      Alert.alert("Éxito", "Perfil actualizado");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Logo */}
      <Image source={require("@/assets/logo-liggo.png")} style={styles.logo} resizeMode="contain" />

      <Text style={styles.label}>Nombre completo</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Tu nombre completo"
        style={styles.input}
      />

      <Text style={styles.sectionTitle}>Intereses</Text>
      <View style={styles.tagsContainer}>
        {INTERESTS.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.tag, selectedInterests.includes(item) && styles.selectedTag]}
            onPress={() => toggleInterest(item)}
          >
            <Text style={[styles.tagText, selectedInterests.includes(item) && styles.selectedTagText]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={handleSave} style={styles.buttonWrapper} disabled={saving}>
        <LinearGradient
          colors={["#4eff6a", "#ff87d2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{saving ? "Guardando..." : "GUARDAR"}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  logo: {
    width: 160,
    height: 60,
    alignSelf: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 20,
    color: "#333",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    rowGap: 10,
    marginBottom: 20,
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
    marginBottom: 30,
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
