// Dynamic configuration supporting both local AI Studio provisioned config and production Environment Variables
import rawConfig from "../../firebase-applet-config.json";

interface FirebaseAppletConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  storageBucket: string;
  messagingSenderId: string;
  measurementId: string;
  firestoreDatabaseId: string;
}

const metaEnv = (import.meta as any).env || {};

const firebaseConfig: FirebaseAppletConfig = {
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || rawConfig.appId,
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || rawConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig.messagingSenderId,
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || rawConfig.measurementId || "",
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_FIRESTORE_DATABASE_ID || rawConfig.firestoreDatabaseId || "(default)"
};

export default firebaseConfig;
