// scripts/userSeeders.ts
import { addDoc, collection, deleteDoc, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { db, storage } from '../services/firebase';

// Lista de intereses aleatorios
const INTERESTS = [
  "Arquitectura", "Ingeniería Civil", "Medicina", "Odontología", "Psicología",
  "Derecho", "Administración de Empresas", "Contaduría Pública",
  "Ingeniería de Sistemas", "Ingeniería Electrónica", "Ingeniería Industrial",
  "Diseño Gráfico", "Comunicación Social", "Publicidad y Marketing",
  "Trabajo Social", "Educación", "Veterinaria", "Biotecnología",
  "Fisioterapia", "Bioquímica", "Ciencias Políticas", "Antropología",
  "Arquitectura de Interiores", "Nutrición", "Turismo y Hotelería",
  "Enfermería", "Finanzas", "Relaciones Internacionales", "Criminología",
  "Arte y Cultura"
];

// Nombres y apellidos aleatorios
const MALE_NAMES = ["Boris", "Manuel", "Matias", "Emmanuel", "Benjamin"];
const FEMALE_NAMES = ["Vanessa", "Kelly", "Leydy", "Fabiola", "Thalia"];
const LAST_NAMES = ["Ugarte", "Gutierrez", "Lara", "Ovando", "Diaz"];

// Función para obtener URLs de fotos desde el almacenamiento de Firebase
async function getPhotoURLs(gender: string, index: number): Promise<string[]> {
  const folder = 'usersPrueba/';
  const photoNames = gender === 'HOMBRE'
    ? [`H${index}.jpeg`, `H${index + 1}.jpeg`]
    : [`M${index}.jpeg`, `M${index + 1}.jpeg`];

  try {
    return await Promise.all(photoNames.map(async (photo) => {
      const photoRef = ref(storage, `${folder}${photo}`);
      return await getDownloadURL(photoRef);
    }));
  } catch (error) {
    console.error(`❌ Error al obtener fotos para ${gender} ${index}:`, error);
    return [];
  }
}

// Función para generar un usuario de prueba
async function generateUser(gender: string, interests: string[], name: string, photos: string[]) {
  try {
    if (photos.length < 2) {
      console.warn(`⚠️ Usuario ${name} no tiene suficientes fotos, se omitirá.`);
      return;
    }

    const newUser = {
      birthdate: "05/12/2000",
      createdAt: new Date().toISOString(),
      gender: gender,
      interests: interests,
      name: name,
      photos: photos,
      showGender: true,
      isTestUser: true,
    };
    await addDoc(collection(db, 'users'), newUser);
    console.log(`✅ Usuario ${name} creado con éxito.`);
  } catch (error) {
    console.error(`❌ Error al crear el usuario ${name}:`, error);
  }
}

// Genera 5 hombres y 5 mujeres para cada carrera
export async function createTestUsers() {
  for (const career of INTERESTS) {
    for (let i = 1; i <= 10; i += 2) {
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

      // Generación de hombres
      const maleIndex = Math.ceil(i / 2);
      const maleName = `${MALE_NAMES[(maleIndex - 1) % MALE_NAMES.length]} ${lastName}`;
      const maleInterests = INTERESTS.sort(() => 0.5 - Math.random()).slice(0, 3);
      const malePhotos = await getPhotoURLs('HOMBRE', maleIndex * 2 - 1); // Ajuste en el índice
      await generateUser("HOMBRE", maleInterests, maleName, malePhotos);

      // Generación de mujeres
      const femaleIndex = Math.ceil(i / 2);
      const femaleName = `${FEMALE_NAMES[(femaleIndex - 1) % FEMALE_NAMES.length]} ${lastName}`;
      const femaleInterests = INTERESTS.sort(() => 0.5 - Math.random()).slice(0, 3);
      const femalePhotos = await getPhotoURLs('MUJER', femaleIndex * 2 - 1); // Ajuste en el índice
      await generateUser("MUJER", femaleInterests, femaleName, femalePhotos);
    }
  }
}

// Eliminar usuarios de prueba
export async function deleteTestUsers() {
  const usersRef = collection(db, 'users');
  try {
    const snapshot = await getDocs(usersRef);
    snapshot.forEach(async (doc) => {
      if (doc.data().isTestUser) {
        await deleteDoc(doc.ref);
        console.log(`🗑️ Usuario de prueba ${doc.data().name} eliminado.`);
      }
    });
  } catch (error) {
    console.error("❌ Error al eliminar usuarios de prueba:", error);
  }
}
