import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAJBSuzQByACz_Jf8rrFDlFrlvA9rmaBZE',
  authDomain: 'wintool2-1.firebaseapp.com',
  projectId: 'wintool2-1',
  storageBucket: 'wintool2-1.firebasestorage.app',
  messagingSenderId: '219867524292',
  appId: '1:219867524292:web:2d7b7ba8dc1a4ff1abed91',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
