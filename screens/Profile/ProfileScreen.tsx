import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { auth, db } from '@/services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import BottomNav from '@/components/BottomNav';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';


export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setLoading(false);
        return;
      }

      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setUserData(snap.data());
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  const calculateAge = (birthdate: string) => {
    const [day, month, year] = birthdate.split('/').map(Number);
    const birth = new Date(year, month - 1, day);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6C00" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>No se encontraron datos del usuario.</Text>
        <TouchableOpacity onPress={() => router.push("/profile/edit")}> {/* Ajustado */}
          <Text style={{ color: '#FF6C00', fontWeight: 'bold' }}>Completar perfil</Text>
        </TouchableOpacity>
        <BottomNav />
      </View>
    );
  }

  const { name, gender, birthdate, photos = [] } = userData;
  const age = calculateAge(birthdate);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {photos.length > 0 ? (
          <FlatList
            data={photos}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.image} />
            )}
          />
        ) : (
          <Text>No has subido fotos aún.</Text>
        )}

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.profession}>{gender}</Text>
        <Text style={styles.university}>{age} años</Text>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scroll: {
    paddingTop: 60,
    paddingBottom: 100,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 300,
    height: 400,
    borderRadius: 20,
    margin: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  profession: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  university: {
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
  },
});
