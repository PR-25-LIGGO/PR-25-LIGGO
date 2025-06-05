// services/storageService.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuid } from "uuid";

export async function uploadImageToStorage(uri: string): Promise<string> {
  const blob = await (await fetch(uri)).blob();
  const path = `events/${uuid()}.jpg`;
  const storageRef = ref(getStorage(), path);
  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
}
