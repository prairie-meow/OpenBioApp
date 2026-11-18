import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: 'AIzaSyC4KABB_RjJ7GclUrHVL5n42cRzflbQA9Y',
  authDomain: 'openbioapp.firebaseapp.com',
  projectId: 'openbioapp',
  storageBucket: 'openbioapp.firebasestorage.app',
  messagingSenderId: '662630758387',
  appId: '1:662630758387:web:d036aaec60985e61bb0486',
  measurementId: 'G-V6282KPQNH',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(firebaseApp, 'openbioapp');
export const storage = getStorage(firebaseApp);
