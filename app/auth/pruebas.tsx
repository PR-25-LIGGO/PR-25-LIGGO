// app/auth/pruebas.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { getMedicinaUsers } from '../../scripts/pruebaUser';

export default function PruebasScreen() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const medicinaUsers = await getMedicinaUsers();
      setUsers(medicinaUsers);
    };
    fetchUsers();
  }, []);

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Usuarios de Medicina</Text>
      {users.length === 0 ? (
        <Text>No hay usuarios de Medicina disponibles.</Text>
      ) : (
        users.map((user, index) => (
          <View 
            key={index} 
            style={{ marginBottom: 20, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 }}
          >
            <Text style={{ fontSize: 18 }}>{user.name}</Text>
            <Text>Edad: {new Date().getFullYear() - new Date(user.birthdate).getFullYear()} años</Text>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              {user.photos.map((photo: string, i: number) => (
                <Image 
                  key={i} 
                  source={{ uri: photo }} 
                  style={{ width: 100, height: 100, marginRight: 5, borderRadius: 8 }} 
                />
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
