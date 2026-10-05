// js/firebase.js

const firebaseConfig = {
  apiKey: "AIzaSyBEekWvORyvCRX_qAK-VHfK4vyIzd8iwAQ",
  authDomain: "the-exhausted-nerd.firebaseapp.com",
  projectId: "the-exhausted-nerd",
  storageBucket: "the-exhausted-nerd.firebasestorage.app",
  messagingSenderId: "1086770628669",
  appId: "1:1086770628669:web:b70e9362891590aa454254"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

window.auth = auth;
window.db = db;
window.googleProvider = googleProvider;

console.log("Firebase connected");
