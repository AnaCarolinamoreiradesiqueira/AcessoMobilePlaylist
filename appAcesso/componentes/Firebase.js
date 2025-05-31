import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyD6y9y_ucX4aWxR8l6pjCiXeh4y78_rvXw",
  authDomain: "playlist-61bf3.firebaseapp.com",
  projectId: "playlist-61bf3",
  storageBucket: "playlist-61bf3.appspot.com",
  messagingSenderId: "453354170638",
  appId: "1:453354170638:web:3d0c65aafd7120bf564f5f",
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };