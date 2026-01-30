import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API || "AIzaSyCvMsgVadULWHUBTh8pJ-sj9nBKp4QPwek",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sprache-f18c6.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sprache-f18c6",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sprache-f18c6.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID || "116869406648",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:116869406648:web:b3fa6ac0920b29f55c394d"
};

const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
