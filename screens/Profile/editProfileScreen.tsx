import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { auth, db, storage } from "../../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null, null, null]); // Max 6 photos
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
          setPhotos(data.photos || [null, null, null, null, null, null]); // Cargar las fotos actuales
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

  // Seleccionar una imagen
  const pickImage = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newPhotos = [...photos];
      newPhotos[index] = result.assets[0].uri;
      setPhotos(newPhotos);
    }
  };

  // Eliminar una imagen
  const removeImage = (index: number) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);
  };

  // Guardar nombre, intereses y fotos
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Nombre requerido", "Por favor ingresa tu nombre completo");
      return;
    }

    const selectedPhotos = photos.filter((p) => p !== null) as string[];
    if (selectedPhotos.length < 2 || selectedPhotos.length > 6) {
      Alert.alert("Fotos requeridas", "Por favor agrega entre 2 y 6 fotos");
      return;
    }

    try {
      setSaving(true);
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Usuario no autenticado");

      const downloadURLs: string[] = [];

      // Subir imágenes a Firebase Storage y obtener las URLs
      for (let i = 0; i < selectedPhotos.length; i++) {
  const response = await fetch(selectedPhotos[i]);
  const blob = await response.blob();
  const filename = `users/${uid}/photo${i + 1}.jpg`;
  const imageRef = ref(storage, filename);
  await uploadBytes(imageRef, blob);
  const url = await getDownloadURL(imageRef);
  downloadURLs.push(url);
}


      // Guardar datos en Firestore
      await setDoc(doc(db, "users", uid), { name, interests: selectedInterests, photos: downloadURLs }, { merge: true });

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
      <View style={styles.topBar}>
              <Image
                source={require('@/assets/logo-liggo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backButton}>Atrás</Text>
              </TouchableOpacity>
            </View>

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

      <Text style={styles.sectionTitle}>Fotos</Text>
      <View style={styles.photosContainer}>
        {photos.map((uri, index) => (
          <TouchableOpacity key={index} style={styles.photoBox} onPress={() => pickImage(index)}>
            {uri ? (
              <View style={styles.photoWrapper}>
                <Image source={{ uri }} style={styles.photo} />
                <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.plusText}>＋</Text>
            )}
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
    height: 80,
    alignSelf: "center",
    marginBottom: 20,
  },

backButton: {
    backgroundColor: '#DC2D22',
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
  photosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  photoBox: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#e5e5f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderRadius: 8,
    position: "relative",
  },
  photoWrapper: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  removeText: {
    color: "#ff4d4d",
    fontSize: 16,
    fontWeight: "bold",
  },
  plusText: {
    fontSize: 24,
    color: "#9747FF",
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
topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});