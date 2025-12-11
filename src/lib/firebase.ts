// Firebase Configuration
// IMPORTANTE: Substitua as configurações abaixo com as do seu projeto Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Substitua com suas credenciais do Firebase Console
// https://console.firebase.google.com/ -> Configurações do projeto -> Suas apps
const firebaseConfig = {
  apiKey: "AIzaSyBDY1G8jR0t47JPugUiM6hIPhc1TgWr5a8",
  authDomain: "sunset-pe.firebaseapp.com",
  projectId: "sunset-pe",
  storageBucket: "sunset-pe.firebasestorage.app",
  messagingSenderId: "629592928602",
  appId: "1:629592928602:web:e2a07fee1ac5aeb412c363",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;
