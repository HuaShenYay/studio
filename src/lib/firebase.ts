// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "lexiprep-8jaja",
  "appId": "1:801725289223:web:b83da76d4596173ef1eba2",
  "storageBucket": "lexiprep-8jaja.firebasestorage.app",
  "apiKey": "AIzaSyCqsbVsLqi6k3kR56yNYvbrKVxQc7ksM7Q",
  "authDomain": "lexiprep-8jaja.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "801725289223"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
