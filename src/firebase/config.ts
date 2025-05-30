import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAC24W3PyFGKXfBtkEfEXLkury5szQf9iM",
  authDomain: "huasi-home.firebaseapp.com",
  projectId: "huasi-home",
  storageBucket: "huasi-home.firebasestorage.app",
  messagingSenderId: "343208534796",
  appId: "1:343208534796:web:560811ce8bda1a5e075f29",
  measurementId: "G-K9VJQBY1BP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;