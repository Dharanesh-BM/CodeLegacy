import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB6qSYDtUSee0kwEZod0b9ShK2je-U08wo",
  authDomain: "smartmeal-ai-15d32.firebaseapp.com",
  projectId: "smartmeal-ai-15d32",
  storageBucket: "smartmeal-ai-15d32.firebasestorage.app",
  messagingSenderId: "1066058503322",
  appId: "1:1066058503322:web:1a5f2691a24201ccb53b23"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a a time.
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
      console.log('Persistence failed: Browser not supported');
    }
  });
