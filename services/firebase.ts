import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDWo01ds8x08c52GYA3Q7ab9VjWrj-zFU",
  authDomain: "liggo-d89ac.firebaseapp.com",
  databaseURL: "https://liggo-d89ac-default-rtdb.firebaseio.com",
  projectId: "liggo-d89ac",
  storageBucket: "liggo-d89ac.firebasestorage.app",
  messagingSenderId: "678301529413",
  appId: "1:678301529413:web:7990f44fb15ed2a3d23a2c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);