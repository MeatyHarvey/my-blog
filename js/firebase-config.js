// Firebase configuration - You'll need to replace with your own config
const firebaseConfig = {
    // You'll get these values when you create a Firebase project
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com", 
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// For development, you can use Firebase emulator
// db.useEmulator("localhost", 8080);
