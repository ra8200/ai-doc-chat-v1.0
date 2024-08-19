import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "ai-doc-chat.firebaseapp.com",
    projectId: "ai-doc-chat",
    storageBucket: "ai-doc-chat.appspot.com",
    messagingSenderId: "180391762009",
    appId: "1:180391762009:web:ec09dbd7aaf8643fcd3948",
    measurementId: "G-ZY28KF0PLM"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);


export { db, storage };
