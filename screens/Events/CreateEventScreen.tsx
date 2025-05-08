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
      <Text style={styles.title}>Publicar Evento</Text>

      <Text style={styles.label}>Nombre del Evento</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Ej: Go mambita"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Fecha</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text style={{ color: selectedDate ? "#000" : "#999" }}>
          {selectedDate ? selectedDate.toLocaleDateString() : "Seleccionar fecha"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Hora</Text>
      <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
        <Text style={{ color: selectedTime ? "#000" : "#999" }}>
          {selectedTime
            ? selectedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
            : "Seleccionar hora"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Ubicación</Text>
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
        <Text style={styles.submitText}>Publicar Evento</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    alignSelf: "center",
  },
  label: {
    fontWeight: "600",
    color: "#444",
    marginBottom: 4,
    marginTop: 12,
    textTransform: "uppercase",
    fontSize: 12,
  },
  input: {
    backgroundColor: "#F5F5F5",
    color: "#000",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 4,
  },
  imagePicker: {
    marginVertical: 20,
    backgroundColor: "#F5F5F5",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCC",
  },
  imageText: {
    color: "#888",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: "#FF6C00",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});