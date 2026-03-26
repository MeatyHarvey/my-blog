// Firebase configuration - Real Firebase config from your project
const firebaseConfig = {
    apiKey: "AIzaSyD_0XvuWXso1AD1830Ans8IyIYImp0B_E4",
    authDomain: "website-85d6d.firebaseapp.com",
    projectId: "website-85d6d",
    storageBucket: "website-85d6d.firebasestorage.app",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef",
    measurementId: "G-ABC123DEF4"
};

// Initialize Firebase
let firebaseInitialized = false;
let db = null;

try {
    // Check if we have real config values
    if (firebaseConfig.apiKey !== "your-api-key-here" &&
        firebaseConfig.projectId !== "your-project-id") {
        
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized with real config');
        
        // Initialize Firestore
        db = firebase.firestore();
        console.log('✅ Firestore database initialized');
        
        firebaseInitialized = true;
    } else {
        console.log('Firebase config contains placeholder values, will use local storage');
        firebaseInitialized = false;
    }
} catch (error) {
    console.log('Firebase initialization failed:', error.message);
    firebaseInitialized = false;
    db = null;
}

// Make variables globally available
window.firebaseInitialized = firebaseInitialized;
window.db = db;

console.log('🔥 Firebase setup complete:', {
    firebaseInitialized: firebaseInitialized,
    dbAvailable: db !== null,
    firebaseSDK: typeof firebase !== 'undefined'
});
