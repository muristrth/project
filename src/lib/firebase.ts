// src/utils/firebase.ts

// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics"; // Optional: if you want to use Analytics

// Your web app's Firebase configuration
// These are the credentials you provided.
const firebaseConfig = {
  apiKey: "AIzaSyBRyY0zwzL9efyCrR1n_UZndA1qEggI4qc",
  authDomain: "ignition-ent.firebaseapp.com",
  projectId: "ignition-ent",
  storageBucket: "ignition-ent.firebasestorage.app",
  messagingSenderId: "760493398278",
  appId: "1:760493398278:web:1c3f2db3ca53ee44b7a687",
  measurementId: "G-J3B2XT89HP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app); // For Firestore database operations
const auth = getAuth(app);   // For Firebase Authentication
const analytics = getAnalytics(app); // Optional: if you want to use Analytics

// Export the initialized services for use throughout your application
export { db, auth, analytics };

// Note: The `__app_id` and `__initial_auth_token` global variables
// are specific to the Canvas environment for authentication and data isolation.
// They are not directly used in this standalone firebase.ts file,
// but rather consumed by your React components (like the FirebaseProvider)
// when running within the Canvas.
