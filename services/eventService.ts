import { db } from "./firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { onSnapshot, QuerySnapshot } from "firebase/firestore";
import { auth } from "./firebase";
import { query, where, getDocs } from "firebase/firestore";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";



export function listenToAttendeeCount(eventId: string, onChange: (count: number) => void) {
  const ref = collection(db, "events", eventId, "attendees");

  return onSnapshot(ref, (snapshot) => {
    onChange(snapshot.size);
  });
}
export function listenToUserAttendance(
  eventId: string,
  userId: string,
  callback: (isAttending: boolean) => void
) {
  const ref = doc(db, "events", eventId, "attendees", userId);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists());
  });
}


export async function getAttendeeCount(eventId: string): Promise<number> {
  const ref = collection(db, "events", eventId, "attendees");
  const snapshot = await getDocs(ref);
  return snapshot.size;
}
export function listenToEvents(callback: (events: any[]) => void) {
  return onSnapshot(collection(db, "events"), (snapshot: QuerySnapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(data);
  });
}
export async function hasEventOnDate(uid: string, date: string) {
  const ref = collection(db, "events");
  const q = query(ref, where("uid", "==", uid), where("date", "==", date));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}
export async function isUserAttending(eventId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) return false;

  const ref = doc(db, "events", eventId, "attendees", uid);
  const snap = await getDoc(ref);
  return snap.exists();
}

export async function toggleAttendance(eventId: string, attending: boolean) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const ref = doc(db, "events", eventId, "attendees", uid);
  if (attending) {
    await deleteDoc(ref); // quitar asistencia
  } else {
    await setDoc(ref, { attending: true }); // asistir
  }
}


export async function createEvent(data: {
  title: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
}) {
  const uid = auth.currentUser?.uid;

  if (!uid) throw new Error("Usuario no autenticado");

  const docRef = await addDoc(collection(db, "events"), {
    ...data,
    uid,
    createdAt: Timestamp.now(),
  });

  return docRef.id;
}
