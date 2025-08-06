// Firebase configuration - Using placeholder values (Firebase will fall back to local storage)
const firebaseConfig = {
    // You'll get these values when you create a Firebase project
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com", 
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase only if we have real config values
let firebaseInitialized = false;
try {
    // Check if we have real Firebase config (not placeholder values)
    if (firebaseConfig.apiKey !== "your-api-key-here" && 
        firebaseConfig.projectId !== "your-project-id") {
        firebase.initializeApp(firebaseConfig);
        firebaseInitialized = true;
        console.log('Firebase initialized with real config');
    } else {
        console.log('Firebase config contains placeholder values, will use local storage');
    }
} catch (error) {
    console.log('Firebase initialization failed:', error.message);
    firebaseInitialized = false;
}

// Only create db reference if Firebase is properly initialized
let db = null;
if (firebaseInitialized) {
    try {
        db = firebase.firestore();
        // For development, you can use Firebase emulator
        // db.useEmulator("localhost", 8080);
    } catch (error) {
        console.log('Failed to initialize Firestore:', error.message);
        db = null;
    }
}
