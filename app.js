import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBvdFAKO1hcC70kTd3BbiuskVJH9XTDtWs",
    authDomain: "trinity-logistics-b076c.firebaseapp.com",
    projectId: "trinity-logistics-b076c",
    storageBucket: "trinity-logistics-b076c.firebasestorage.app",
    messagingSenderId: "700729435351",
    appId: "1:700729435351:web:5cc00ea239cd87259efc92",
    measurementId: "G-20DY9C2Q1N"
};

// Initialize Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const authContainer = document.getElementById('auth-container');
const adminPanel = document.getElementById('admin-panel');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const registerForm = document.getElementById('register-form');
const authError = document.getElementById('auth-error');
const successAlert = document.getElementById('success-alert');
const generatedIdDisplay = document.getElementById('generated-id-display');

// Track Authentication Login State Changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        authContainer.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        document.getElementById('user-display').innerText = `Logged in: ${user.email}`;
    } else {
        authContainer.classList.remove('hidden');
        adminPanel.classList.add('hidden');
    }
});

// Admin Log In
loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    authError.classList.add('hidden');

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        authError.innerText = "Authentication failed. Invalid Admin credentials.";
        authError.classList.remove('hidden');
    }
});

// Admin Log Out
logoutBtn.addEventListener('click', () => {
    signOut(auth);
    successAlert.classList.add('hidden');
    registerForm.reset();
});

// Register New Package
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    successAlert.classList.add('hidden');

    // Generate clean unique 6-digit tracking tag text
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const generatedTrackingID = `TRINITY-${randomDigits}`;

    const luggagePayload = {
        description: document.getElementById('lug-desc').value.trim(),
        weight: document.getElementById('lug-weight').value.trim(),
        status: document.getElementById('lug-status').value,
        courierName: document.getElementById('courier-name').value.trim(),
        courierPhone: document.getElementById('courier-phone').value.trim(),
        createdAt: new Date().toISOString()
    };

    try {
        // Save using the generated Tracking ID as the Document ID instead of Auto-ID
        await setDoc(doc(db, "luggage", generatedTrackingID), luggagePayload);
        
        // Show success callout
        generatedIdDisplay.innerText = generatedTrackingID;
        successAlert.classList.remove('hidden');
        registerForm.reset();
    } catch (error) {
        console.error("Firestore Write Failed: ", error);
        alert("Database write error. Check security rules configuration.");
    }
});
