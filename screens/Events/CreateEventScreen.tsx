import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { uploadImageToStorage } from "@/services/storageService";
import { createEvent } from "../../services/eventService";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";
import { auth } from "@/services/firebase";
import { hasEventOnDate } from "@/services/eventService";



export default function CreateEventScreen() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7 });
    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };


  const handleSubmit = async () => {
    console.log("handleSubmit fue llamado");

    if (!title || !location || !image || !selectedDate || !selectedTime) {
      alert("Completa todos los campos.");
      return;
    }

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        alert("No estás autenticado.");
        return;
      }

      const dateStr = selectedDate.toLocaleDateString();

      // ✅ Validación: ¿ya tiene evento ese día?
      const exists = await hasEventOnDate(uid, dateStr);
      if (exists) {
        alert("Ya has creado un evento para esta fecha.");
        return;
      }

      const imageUrl = await uploadImageToStorage(image);
      const timeStr = selectedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

      await createEvent({
        title,
        date: dateStr,
        time: timeStr,
        location,
        imageUrl,
      });

      alert("Evento creado 🎉");
      router.back();
    } catch (error: any) {
      alert("Error al crear evento: " + error.message);
    }
  };
  return (
  <ScrollView contentContainerStyle={styles.container}>
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
    <Text style={styles.title}> Publicar Nuevo Evento</Text>

    <Text style={styles.label}>📛 Nombre del Evento</Text>
    <TextInput
      style={styles.input}
      value={title}
      onChangeText={setTitle}
      placeholder="Ej: Go mambita"
      placeholderTextColor="#999"
    />

    <Text style={styles.label}>📆 Fecha</Text>
    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
      <Text style={{ color: selectedDate ? "#000" : "#999" }}>
        {selectedDate ? selectedDate.toLocaleDateString() : "Seleccionar fecha"}
      </Text>
    </TouchableOpacity>

    <Text style={styles.label}>🕓 Hora</Text>
    <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
      <Text style={{ color: selectedTime ? "#000" : "#999" }}>
        {selectedTime
          ? selectedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
          : "Seleccionar hora"}
      </Text>
    </TouchableOpacity>

    <Text style={styles.label}>📍 Ubicación</Text>
    <TextInput
      style={styles.input}
      value={location}
      onChangeText={setLocation}
      placeholder="Ej: Hupermall"
      placeholderTextColor="#999"
    />

    <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
      {image ? (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      ) : (
        <Text style={styles.imageText}>Seleccionar Imagen de Portada</Text>
      )}
    </TouchableOpacity>

    {showDatePicker && (
      <DateTimePicker
        value={selectedDate || new Date()}
        mode="date"
        display={Platform.OS === "ios" ? "spinner" : "default"}
        onChange={(_, date) => {
          setShowDatePicker(false);
          if (date) setSelectedDate(date);
        }}
      />
    )}

    {showTimePicker && (
      <DateTimePicker
        value={selectedTime || new Date()}
        mode="time"
        is24Hour={true}
        display={Platform.OS === "ios" ? "spinner" : "default"}
        onChange={(_, time) => {
          setShowTimePicker(false);
          if (time) setSelectedTime(time);
        }}
      />
    )}

    <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
      <Text style={styles.submitText}>🚀 Publicar Evento</Text>
    </TouchableOpacity>
  </ScrollView>
);

}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8FFF8",
    flexGrow: 1,
  },
  logo: {
    width: 140,
    height: 90,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3DDC84",
    marginBottom: 20,
    alignSelf: "center",
  },
  label: {
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    marginTop: 12,
    fontSize: 13,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#FFFFFF",
    color: "#000",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 6,
  },
  imagePicker: {
    marginVertical: 20,
    backgroundColor: "#FFF0F0",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCC",
    shadowColor: "blue",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation:4,
  },
  imageText: {
    color: "black",
    fontSize: 13,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: "#3DDC84",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "red",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#DC2D22',
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});
