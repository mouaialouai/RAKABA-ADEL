/// <reference types="vite/client" />

/**
 * Firebase Configuration — reads from Vite environment variables
 */
const firebaseConfig = {
  projectId:           import.meta.env.VITE_FIREBASE_PROJECT_ID          || '',
  appId:               import.meta.env.VITE_FIREBASE_APP_ID              || '',
  apiKey:              import.meta.env.VITE_FIREBASE_API_KEY             || '',
  authDomain:          import.meta.env.VITE_FIREBASE_AUTH_DOMAIN         || '',
  storageBucket:       import.meta.env.VITE_FIREBASE_STORAGE_BUCKET      || '',
  messagingSenderId:   import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  measurementId:       '',
  firestoreDatabaseId: '(default)',
};

export default firebaseConfig;
