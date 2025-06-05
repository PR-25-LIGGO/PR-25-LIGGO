import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { auth, db, storage } from "../../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";


export default function Photos() {
    const router = useRouter();
    const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null, null, null]);
    const [uploading, setUploading] = useState(false);
  
    const pickImage = async (index: number) => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
  
      if (!result.canceled) {
        const newPhotos = [...photos];
        newPhotos[index] = result.assets[0].uri;
        setPhotos(newPhotos);
      }
    };
  
    const removeImage = (index: number) => {
      const newPhotos = [...photos];
      newPhotos[index] = null;
      setPhotos(newPhotos);
    };
  
    const handleContinue = async () => {
      const selectedPhotos = photos.filter((p) => p !== null) as string[];
      if (selectedPhotos.length < 2) {
        Alert.alert("Requiere al menos 2 fotos para continuar");
        return;
      }
  
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert("Error", "No hay usuario autenticado");
        return;
      }
  
      try {
        setUploading(true);
        const downloadURLs: string[] = [];
  
        for (let i = 0; i < selectedPhotos.length; i++) {
          const response = await fetch(selectedPhotos[i]);
          const blob = await response.blob();
          const filename = `users/${uid}/photo${i + 1}.jpg`;
  
          const imageRef = ref(storage, filename);
          await uploadBytes(imageRef, blob);
          const url = await getDownloadURL(imageRef);
          console.log(`Foto ${i + 1} subida: ${url}`);

          downloadURLs.push(url);
        }
  
        // Guardar en Firestore
        await setDoc(
          doc(db, "users", uid),
          { photos: downloadURLs },
          { merge: true }
        );
  
        router.push("/auth/rules");
      } catch (error: any) {
        Alert.alert("Error al subir fotos", error.message);
      } finally {
        setUploading(false);
      }
    };
  
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
          <Text style={{ fontSize: 18 }}>◀</Text>
        </TouchableOpacity>
  
        <Text style={styles.title}>Agregar fotos</Text>
        <Text style={styles.subtitle}>Agrega por lo menos 2 fotos</Text>
  
        <View style={styles.grid}>
          {photos.map((uri, index) => (
            <TouchableOpacity key={index} style={styles.imageBox} onPress={() => pickImage(index)}>
              {uri ? (
                <>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity style={styles.remove} onPress={() => removeImage(index)}>
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.plus}>＋</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
  
        <TouchableOpacity onPress={handleContinue} style={styles.buttonWrapper} disabled={uploading}>
          <LinearGradient
            colors={["#4eff6a", "#ff87d2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {uploading ? "Subiendo..." : "CONTINUAR"}
            </Text>
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
        textAlign: "center",
    },
    subtitle: {
        textAlign: "center",
        color: "#777",
        marginBottom: 20,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 10,
    },
    imageBox: {
        width: "30%",
        aspectRatio: 1,
        backgroundColor: "#e5e5f0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
        borderRadius: 8,
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 8,
    },
    remove: {
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
    plus: {
        fontSize: 24,
        color: "#9747FF",
    },
    buttonWrapper: {
        marginTop: 20,
        alignItems: "center",
    },
    button: {
        width: "100%",
        paddingVertical: 14,
        borderRadius: 25,
    },
    buttonText: {
        color: "#888",
        fontWeight: "bold",
        textAlign: "center",
    },
});
