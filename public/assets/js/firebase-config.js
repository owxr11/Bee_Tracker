// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries
 
  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAooO7COFCWw90ihPjMI69lHpT9LODIglA",
    authDomain: "alphaproyecto.firebaseapp.com",
    projectId: "alphaproyecto",
    storageBucket: "alphaproyecto.firebasestorage.app",
    messagingSenderId: "354933542265",
    appId: "1:354933542265:web:39d76a30435d4865fab3a8"
  };
 
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  export const db = getFirestore(app);
  export const auth = getAuth(app);