// ============================================
// FIREBASE INITIALIZATION (FRONT-END)
// ERROR-SAFE VERSION
// ============================================

(function() {
    'use strict';
    
    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyA8tR_IUf0NRLJ2aXWD80AC9xF4Vf-Xa1Q",
      authDomain: "stem-forge.firebaseapp.com",
      projectId: "stem-forge",
      storageBucket: "stem-forge.firebasestorage.app",
      messagingSenderId: "326321735871",
      appId: "1:326321735871:web:3d40fc6bd19bcb27585e0a",
      measurementId: "G-Q0CHQHZ1E4"
    };

    // Check if Firebase SDK loaded
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK not loaded. Check your script tags.');
        return;
    }

    try {
        // Initialize Firebase compat
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('🔥 Firebase initialized');
        }
        
        // Make auth available globally
        window.firebaseAuth = firebase.auth();
        
        // Get auth token helper
        window.getAuthToken = async function() {
            try {
                const user = window.firebaseAuth?.currentUser;
                if (!user) return null;
                return await user.getIdToken();
            } catch (error) {
                console.error('Failed to get auth token:', error);
                return null;
            }
        };
        
        // Listen for auth state changes
        window.firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                console.log('✅ User signed in:', user.email);
            } else {
                console.log('👤 No user signed in');
            }
            window.dispatchEvent(new CustomEvent('auth-state-changed', {
                detail: { user }
            }));
        });
        
    } catch (error) {
        console.error('❌ Firebase init failed:', error);
        window.firebaseAuth = null;
    }
})();
