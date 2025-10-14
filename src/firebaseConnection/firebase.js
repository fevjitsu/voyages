import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyD3BwdwyuoIgvBjQcPtlYCA_ZrmvJl8UO8",
  authDomain: "voyagesofvictora.firebaseapp.com",
  projectId: "voyagesofvictora",
  storageBucket: "voyagesofvictora.firebasestorage.app",
  messagingSenderId: "721648559676",
  appId: "1:721648559676:web:7544daf31df1c133018539",
  measurementId: "G-25CSHVJXK0"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Functions
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;