// Firebase configuration - Real Firebase config from your project
const firebaseConfig = {
    apiKey: "AIzaSyD_0XvuWXso1AD1830Ans8IyIYImp0B_E",
    authDomain: "website-85d6d.firebaseapp.com",
    projectId: "website-85d6d",
    storageBucket: "website-85d6d.firebasestorage.app",
    messagingSenderId: "362859485714",
    appId: "1:362859485714:web:796fdcc5cab401e5da96cb",
    measurementId: "G-5MPR5DSLX7"
};

// Initialize Firebase only if we have real config values
let firebaseInitialized = false;
let db = null;

try {
    // Check if we have real Firebase config (not placeholder values)
    if (firebaseConfig.apiKey !== "your-api-key-here" && 
        firebaseConfig.projectId !== "your-project-id") {
        firebase.initializeApp(firebaseConfig);
        firebaseInitialized = true;
        console.log('🔥 Firebase initialized with real config');
        
        // Initialize Firestore
        db = firebase.firestore();
        console.log('💾 Firestore database initialized');
        
    } else {
        console.log('Firebase config contains placeholder values, will use local storage');
    }
} catch (error) {
    console.log('Firebase initialization failed:', error.message);
    firebaseInitialized = false;
    db = null;
}

// Make variables globally available
window.firebaseInitialized = firebaseInitialized;
window.db = db;

console.log('📊 Firebase setup complete:', {
    firebaseInitialized: firebaseInitialized,
    dbAvailable: db !== null,
    firebaseSDK: typeof firebase !== 'undefined'
});
