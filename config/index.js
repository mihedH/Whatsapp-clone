import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, onDisconnect, serverTimestamp } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC24p7ojvNDA_JvUpkblY4lppK114WodRM",
  authDomain: "whatsappclone-73977.firebaseapp.com",
  databaseURL: "https://whatsappclone-73977-default-rtdb.firebaseio.com",
  projectId: "whatsappclone-73977",
  storageBucket: "whatsappclone-73977.firebasestorage.app",
  messagingSenderId: "1043240960873",
  appId: "1:1043240960873:web:d45199e6c64316410873f8",
  measurementId: "G-3ZYHXE4ZY5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { app, auth, database };
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://atousqwgihcroaakhzyz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0b3VzcXdnaWhjcm9hYWtoenl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MDg3NjgsImV4cCI6MjA0ODI4NDc2OH0.52W3anV16UI1v_125rq1uDyfRDL8QeGuDhCp9F8SN2c'
const supabase = createClient(supabaseUrl, supabaseKey)
export{ supabase };