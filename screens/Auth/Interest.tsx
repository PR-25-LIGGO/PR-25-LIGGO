import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { auth, db } from "../../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Alert } from "react-native";


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
    "Arte y Cultura"
  ];
  

  export default function Interests() {
    const router = useRouter();
    const [selected, setSelected] = useState<string[]>([]);
  
    const toggleInterest = (item: string) => {
      if (selected.includes(item)) {
        setSelected(selected.filter(i => i !== item));
      } else {
        setSelected([...selected, item]);
      }
    };
  
    const handleContinue = async () => {
      const uid = auth.currentUser?.uid;
  
      if (!uid) {
        Alert.alert("Error", "No hay usuario autenticado");
        return;
      }
  
      try {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
          interests: selected
        }, { merge: true });
  
        router.push("/auth/photos"); // siguiente pantalla
      } catch (error: any) {
        Alert.alert("Error al guardar intereses", error.message);
      }
    };

  return (
    <View style={styles.container}>
      {/* Botón de retroceso */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
        <Text style={{ fontSize: 18 }}>◀</Text>
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.title}>Intereses</Text>
      <Text style={styles.subtitle}>
        Los intereses aparecerán en tu perfil, los puedes cambiar en cualquier momento
      </Text>

      {/* Tags */}
      <View style={styles.tagsContainer}>
        {INTERESTS.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.tag, selected.includes(item) && styles.selectedTag]}
            onPress={() => toggleInterest(item)}
          >
            <Text style={[styles.tagText, selected.includes(item) && styles.selectedTagText]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botón continuar */}
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
    textAlign: "left",
  },
  subtitle: {
    fontSize: 13,
    color: "#777",
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
