import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Safety Check: Check if mandatory keys are missing
const isFirebaseConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let app;
let db;
let auth;
let googleProvider;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
  }
} else {
  console.warn("Firebase configuration is missing! Ensure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID are set.");
}

export { db, auth, googleProvider, isFirebaseConfigured };
