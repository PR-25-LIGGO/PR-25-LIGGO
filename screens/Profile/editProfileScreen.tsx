import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storage } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export default function EditProfileScreen() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || '');
        setGender(data.gender || '');
        setBirthdate(data.birthdate || '');
        setPhotos(data.photos || []);
      }
    };
    fetchUser();
  }, []);

  const handlePickImage = async () => {
    if (photos.length >= 6) {
      Alert.alert('Máximo 6 fotos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      const uid = auth.currentUser?.uid;
      const imageName = `photo_${Date.now()}`;
      const storageRef = ref(storage, `users/${uid}/photos/${imageName}`);
      const blob = await fetch(uri).then(res => res.blob());
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      setPhotos((prev) => [...prev, downloadUrl]);
    }
  };

  const handleDeletePhoto = async (url: string) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const path = decodeURIComponent(url.split("/o/")[1].split("?")[0]);
      const imageRef = ref(storage, path);
      await deleteObject(imageRef);
      setPhotos((prev) => prev.filter((p) => p !== url));
    } catch (error) {
      console.error("Error al eliminar la foto:", error);
    }
  };

  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await setDoc(doc(db, 'users', uid), {
      name,
      gender,
      birthdate,
      photos,
    }, { merge: true });
    Alert.alert('Perfil actualizado');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text>Nombre</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Tu nombre" style={{ borderWidth: 1, marginBottom: 10 }} />

      <Text>Género</Text>
      <TextInput value={gender} onChangeText={setGender} placeholder="Ej: Hombre, Mujer..." style={{ borderWidth: 1, marginBottom: 10 }} />

      <Text>Fecha de nacimiento</Text>
      <TextInput value={birthdate} onChangeText={setBirthdate} placeholder="DD/MM/AAAA" style={{ borderWidth: 1, marginBottom: 10 }} />

      <Text>Fotos ({photos.length}/6)</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        {photos.map((url, index) => (
          <TouchableOpacity key={index} onLongPress={() => handleDeletePhoto(url)}>
            <Image source={{ uri: url }} style={{ width: 100, height: 100, margin: 5, borderRadius: 8 }} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={handlePickImage} style={{ backgroundColor: '#FF6C00', padding: 10, borderRadius: 5 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Agregar Foto</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 20 }}>
        <Button title="Guardar Cambios" onPress={handleSave} color="#4EFF6A" />
      </View>
    </ScrollView>
  );
}