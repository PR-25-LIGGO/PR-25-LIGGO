// scripts/pruebaUser.ts
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

// Función para obtener usuarios de Medicina
export async function getMedicinaUsers() {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const medicinaUsers: any[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isTestUser && data.interests.includes("Medicina")) {
        medicinaUsers.push(data);
      }
    });

    console.log(`✅ Usuarios de Medicina obtenidos: ${medicinaUsers.length}`);
    return medicinaUsers;
  } catch (error) {
    console.error("❌ Error al obtener usuarios de Medicina:", error);
    return [];
  }
}
