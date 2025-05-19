// app/auth/userSeeder.tsx
import { View, Button, Text, Alert } from 'react-native';
import { createTestUsers, deleteTestUsers } from '../../scripts/userSeeders';

export default function UserSeederScreen() {
  const handleGenerate = async () => {
    try {
      await createTestUsers();
      Alert.alert("Usuarios generados correctamente");
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("Error al generar usuarios", error.message);
      } else {
        Alert.alert("Error al generar usuarios", String(error));
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTestUsers();
      Alert.alert("Usuarios eliminados correctamente");
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("Error al eliminar usuarios", error.message);
      } else {
        Alert.alert("Error al eliminar usuarios", String(error));
      }
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Generador de Usuarios de Prueba</Text>
      <Button title="Generar Usuarios" onPress={handleGenerate} />
      <View style={{ marginVertical: 10 }} />
      <Button title="Eliminar Usuarios" onPress={handleDelete} color="red" />
    </View>
  );
}
