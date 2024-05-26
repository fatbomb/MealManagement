// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import Realtime Database

const firebaseConfig = {
  apiKey: "AIzaSyD4y3FHBj5AT5koIQuzcO8K5omUf34BSHM",
  authDomain: "mealmangment.firebaseapp.com",
  projectId: "mealmangment",
  storageBucket: "mealmangment.appspot.com",
  messagingSenderId: "973711755959",
  appId: "1:973711755959:web:da49c85c8996724fb69b32",
  measurementId: "G-M381H6V9SN",
  databaseURL: "https://mealmangment.firebaseio.com" // Add your database URL
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const firestore = getFirestore(app); // Initialize Realtime Database

export { auth, firestore };
