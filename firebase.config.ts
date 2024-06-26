// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from "firebase/storage"; // Import the storage module
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvQUX7D4IEiYAnPVq5q_qwilWPRDXyBKE",
  authDomain: "fitnessprotrack.firebaseapp.com",
  projectId: "fitnessprotrack",
  storageBucket: "fitnessprotrack.appspot.com",
  messagingSenderId: "759148893353",
  appId: "1:759148893353:web:8c7892c3784b853a3405b8",
  measurementId: "G-SZ1GD686B1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const storage = getStorage(app);

export { app, db, auth, storage };