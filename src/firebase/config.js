import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-tmt8_lnfSV99gj7hEXLMDKT3J0ZbzbA",
  authDomain: "squad-savings.firebaseapp.com",
  projectId: "squad-savings",
  storageBucket: "squad-savings.firebasestorage.app",
  messagingSenderId: "1050827793004",
  appId: "1:1050827793004:web:ae88b9da7032a8f945ee49",
  measurementId: "G-77YSB2EWL3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);