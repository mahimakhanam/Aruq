import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBrudJbm7z6yXbVe9dTyMl5zuOcOZKY2kc",
    authDomain: "aruq-phase-3.firebaseapp.com",
    projectId: "aruq-phase-3",
    storageBucket: "aruq-phase-3.firebasestorage.app",
    messagingSenderId: "76456941997",
    appId: "1:76456941997:web:7549ad6f27875a0a68a924",
    measurementId: "G-K3E7515EGG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;